import {AssistantResponse} from "ai";
import OpenAI from "openai";
import { NextRequest } from "next/server";
// import { z } from "zod";
// import { zfd } from "zod-form-data";

// const schema = zfd.formData({
//   threadId: z.string().or(z.undefined()),
//   message: zfd.text(),
//   file: z.instanceof(Blob)
// });

export const runtime = "edge";

export async function POST(req: NextRequest) {
  // Parse the request body
  const input = await req.formData();

  let {
    messages,
    system,
    apiKey: key,
    model = 'gpt-4o-mini',
    assistantId,
    threadId,
    openAiFileIds
  } = await req.json();
  const apiKey = key || process.env.OPENAI_API_KEY;
  const openai = new OpenAI({
    apiKey: apiKey || ""
  });

  // TODO: Potentially unsafe. Why do we need to get the assistant and thread ID from the frontend?
  // The benefit of this is lesser calls to firestore to get the above. Maybe some sort of caching layer
  // On the server where we cache assistant and thread IDs would help.
  // The risk of making a frontend call to get all the info and then sending it to server
  // is that any extension with the same access to the frontend now has access to the assistant/thread IDs
  // While no one should technically be able to call the same due to API keys, it's a massive risk.
  // TODO: find a server only way of doing this
  // Step 1: Create the assistant
  if (input["assistantId"] == undefined) {
    console.log("No active assistant provided, creating a new assistant")

    const assistant = await openai.beta.assistants.create({
      model: 'gpt-4-1106-preview',
      name: 'Research Assistant',
      instructions: system,
      tools: [
        { "type": "file_search" }
      ],
    })

    assistantId = assistant.id;
    console.log("Assistant created. Assistant ID: ", assistant.id)
  }

  const messageData = {
    role: "user" as "user",
    content: messages,
    file_ids: openAiFileIds
  };

  // TODO: Potentially we need to create a thread for only new documents
  // We don't even want to preserve thread IDs for new documents.
  // TODO: is there a way we can delete the thread? Do we need new threads per new document?
  // Step 2: Create a new conversation thread
  if (threadId == undefined) {
    console.log("No thread provided, creating a new one")
    const thread = await openai.beta.threads.create();

    threadId = thread.id;
    console.log("New thread created. Thread ID: ", threadId);
  }
  const createdMessage = await openai.beta.threads.messages.create(
    threadId,
    messageData
  );

  // Step 3: Send a message with the pre-uploaded files
  return AssistantResponse(
    { threadId, messageId: createdMessage.id },
    async ({ sendMessage }) => {
      // Run the assistant on the thread
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistantId
      });

      async function waitForRun(run: OpenAI.Beta.Threads.Runs.Run) {
        // Poll for status change
        while (run.status === "queued" || run.status === "in_progress") {
          // delay for 500ms
          await new Promise((resolve) => setTimeout(resolve, 500));

          run = await openai.beta.threads.runs.retrieve(threadId, run.id);
        }

        // Check the run status
        if (
          run.status === "cancelled" ||
          run.status === "cancelling" ||
          run.status === "failed" ||
          run.status === "expired"
        ) {
          throw new Error(run.status);
        }
      }

      await waitForRun(run);

      // Get new thread messages (after our message)
      const responseMessages = (
        await openai.beta.threads.messages.list(threadId, {
          after: createdMessage.id,
          order: "asc"
        })
      ).data;

      // Send the messages
      for (const message of responseMessages) {
        sendMessage({
          id: message.id,
          role: "assistant",
          content: message.content.filter(
            (content) => content.type === "text"
          ) as Array<any>
        });
      }
    }
  );
}
