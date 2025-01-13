import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  let { apiKey: key, userId, threadId, chatAssistantId } = await req.json();

  const apiKey = key || process.env.OPENAI_API_KEY;
  const openai = new OpenAI({
    apiKey: apiKey || '',
  });

  try {
    const threadResponse = await openai.beta.threads.retrieve(threadId);
    if (threadResponse.metadata!['userId'] != userId) {
      throw new Error(
        'User ID does not match queried thread, please sign out and sign in again'
      );
    }

    const allMessages: any[] = [];
    let after;
    while (true) {
      const response = await openai.beta.threads.messages.list(threadId, {
        limit: 100,
        after: after,
      });
      let messages = response.data;

      messages.forEach((datum) => {
        if (datum.role === 'user') {
          sanitizeUserPrompt(datum);
        }
        // Only give messages where the user is interacting with the chat assistant and the chat assistant's replies, nothing else
        // TODO: a bit hacky, can probably refine to not use the content of the message being sent by the editor. Fix this.
        if (
          datum.role === 'user' ||
          (chatAssistantId &&
            datum.role === 'assistant' &&
            datum.assistant_id === chatAssistantId)
        ) {
          allMessages.push(datum);
        }
      });

      if (messages.length == 0) {
        break;
      }
      after = messages[messages.length - 1].id;
    }

    return NextResponse.json({
      messages: allMessages,
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Failed to retrieve Open AI Thread. Error: ${e.message}` },
      { status: 500 }
    );
  }
}

const sanitizeUserPrompt = (message) => {
  const prompt = message.content[0]['text']['value'];
  const splitPrompt = prompt.split('\n');
  message.content[0]['text']['value'] = splitPrompt[
    splitPrompt.length - 1
  ].replace('about <Selection>', '');
};
