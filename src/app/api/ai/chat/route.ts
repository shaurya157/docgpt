import {AssistantResponse, convertToCoreMessages} from "ai";
import OpenAI from "openai";
import {NextRequest, NextResponse} from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  console.log("HIT THE RUN ENDPOINT")
  const reqJson = await req.json()
  let {
    message,
    apiKey: key,
    assistantId,
    threadId,
  } = reqJson;

  console.log("reqJson", reqJson)
  const apiKey = key || process.env.OPENAI_API_KEY;
  const openai = new OpenAI({
    apiKey: apiKey || ""
  });

  try {
    const messageData = {
      role: "user" as "user",
      content: message as string,
    };

    const createdMessage = await openai.beta.threads.messages.create(
      threadId,
      messageData
    );

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
          console.log(message)
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
  } catch (e) {
    console.log("An error has occured while running the thread: ", e.message);
    return NextResponse.json(
      { error: `Failed to process AI request, ${e.message}` },
      { status: 500 }
    );
  }
}
