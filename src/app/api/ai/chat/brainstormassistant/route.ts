import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const message = formData.get('message');
  // const files = formData.getAll("files") as File[]

  const threadId = formData.get('threadId') as string;
  // TODO: get file from formdata too and process it
  const assistantId = formData.get('assistantId');
  const additionalInstructions = formData.get('additionalInstructions');

  const apiKey = process.env.OPENAI_API_KEY;
  const openai = new OpenAI({
    apiKey: apiKey || '',
  });

  try {
    const messageData = {
      content: message as string,
      role: 'user' as const,
    };

    console.log(`User sent message: ${messageData.content}`);
    const createdMessage = await openai.beta.threads.messages.create(
      threadId,
      messageData
    );

    const stream = await openai.beta.threads.runs.create(threadId, {
      additional_instructions: additionalInstructions as string,
      assistant_id: assistantId as string,
      stream: true,
      tools:[{ "type": "file_search"}]
    });

    return new Response(stream.toReadableStream());
  } catch (e) {
    console.log('An error has occured while running the thread: ', e.message);
    return NextResponse.json(
      { error: `Failed to process AI request, ${e.message}` },
      { status: 500 }
    );
  }
}
