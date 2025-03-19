import { AssistantResponse } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const reqJson = await req.json();
  const { apiKey: key, assistantId, message, template, threadId } = reqJson;
  const apiKey = key || process.env.OPENAI_API_KEY;
  const openai = new OpenAI({
    apiKey: apiKey || '',
  });

  try {
    const messageData = {
      content: (template + message) as string,
      role: 'user' as const,
    };

    const createdMessage = await openai.beta.threads.messages.create(
      threadId,
      messageData
    );

    console.log('Created Message: ', createdMessage);
    return AssistantResponse(
      { messageId: createdMessage.id, threadId },
      async ({ sendMessage }) => {
        // Run the assistant on the thread
        const run = await openai.beta.threads.runs.create(threadId, {
          assistant_id: assistantId,
          tools: [{ "type": "file_search"}]
        });

        async function waitForRun(run: OpenAI.Beta.Threads.Runs.Run) {
          // Poll for status change
          while (run.status === 'queued' || run.status === 'in_progress') {
            // delay for 500ms
            await new Promise((resolve) => setTimeout(resolve, 500));

            run = await openai.beta.threads.runs.retrieve(threadId, run.id);
          }

          // Check the run status
          if (
            run.status === 'cancelled' ||
            run.status === 'cancelling' ||
            run.status === 'failed' ||
            run.status === 'expired'
          ) {
            if (run.status == 'failed') {
              console.log(
                `There was an error with the thread run. Status: ${run.status}, Last error: ${run.last_error?.message}`
              );
            }
            throw new Error(
              run.last_error ? run.last_error.message : run.status
            );
          }
        }

        await waitForRun(run);

        // Get new thread messages (after our message)
        const responseMessages = (
          await openai.beta.threads.messages.list(threadId, {
            after: createdMessage.id,
            order: 'asc',
          })
        ).data;

        // Send the messages
        for (const message of responseMessages) {
          console.log(message);
          sendMessage({
            id: message.id,
            content: message.content.filter(
              (content) => content.type === 'text'
            ) as Array<any>,
            role: 'assistant',
          });
        }
      }
    );
  } catch (e) {
    console.log('An error has occured while running the thread: ', e.message);
    return NextResponse.json(
      { error: `Failed to process AI request, ${e.message}` },
      { status: 500 }
    );
  }
}
