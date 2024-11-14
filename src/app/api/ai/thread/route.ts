import OpenAI from "openai";
import {NextRequest, NextResponse} from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  let {
    apiKey: key,
    userId
  } = await req.json();

  const apiKey = key || process.env.OPENAI_API_KEY;
  const openai = new OpenAI({
    apiKey: apiKey || ""
  });

  try {
    const thread = await openai.beta.threads.create({
      metadata: {
        userId: userId,
      }
    });

    return NextResponse.json(
      { threadId: thread.id }
    )
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to create Open AI Thread' },
      { status: 500 }
    );
  }
}
