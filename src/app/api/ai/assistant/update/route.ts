import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const { assistantId, instructions } = await req.json();
  const apiKey = process.env.OPEN_API_KEY;
  const openai = new OpenAI({
    apiKey: apiKey || '',
  });

  try {
    await openai.beta.assistants.update(assistantId, {
      instructions: instructions,
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Failed to update assistant. Error: ${e}` },
      { status: 500 }
    );
  }
}
