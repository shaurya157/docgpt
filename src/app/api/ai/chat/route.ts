import {AssistantResponse, convertToCoreMessages} from "ai";
import OpenAI from "openai";
import {NextRequest, NextResponse} from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  console.log("HIT THE RUN ENDPOINT")

  let {
    messages,
    system,
    apiKey: key,
    model = 'gpt-4o-mini',
    assistantId,
    threadId,
    openAiFileIds,
    userId
  } = await req.json();
  console.log("System: ", system)
  console.log("messages: ", messages)
  console.log("threadId: ", threadId)
  console.log("assistantId: ", assistantId)
  console.log("userId: ", userId)

  const apiKey = key || process.env.OPENAI_API_KEY;
  const openai = new OpenAI({
    apiKey: apiKey || ""
  });

  try {
    // const messageData = {
    //   role: "user" as "user",
    //   content: convertToCoreMessages(messages)[0]["content"] as string,
    //   // file_ids: openAiFileIds
    // };
    //
    // const createdMessage = await openai.beta.threads.messages.create(
    //   threadId,
    //   messageData
    // );
    //
    // console.log(messageData)
    //
    // return AssistantResponse(
    //   { threadId, messageId: createdMessage.id },
    //   async ({ sendMessage }) => {
    //     // Run the assistant on the thread
    //     const run = await openai.beta.threads.runs.create(threadId, {
    //       assistant_id: assistantId
    //     });
    //
    //     async function waitForRun(run: OpenAI.Beta.Threads.Runs.Run) {
    //       // Poll for status change
    //       while (run.status === "queued" || run.status === "in_progress") {
    //         // delay for 500ms
    //         await new Promise((resolve) => setTimeout(resolve, 500));
    //
    //         run = await openai.beta.threads.runs.retrieve(threadId, run.id);
    //       }
    //
    //       // Check the run status
    //       if (
    //         run.status === "cancelled" ||
    //         run.status === "cancelling" ||
    //         run.status === "failed" ||
    //         run.status === "expired"
    //       ) {
    //         throw new Error(run.status);
    //       }
    //     }
    //
    //     await waitForRun(run);
    //
    //     // Get new thread messages (after our message)
    //     const responseMessages = (
    //       await openai.beta.threads.messages.list(threadId, {
    //         after: createdMessage.id,
    //         order: "asc"
    //       })
    //     ).data;
    //
    //     // Send the messages
    //     for (const message of responseMessages) {
    //       sendMessage({
    //         id: message.id,
    //         role: "assistant",
    //         content: message.content.filter(
    //           (content) => content.type === "text"
    //         ) as Array<any>
    //       });
    //     }
    //   }
    // );
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
