import OpenAI from "openai";
import {NextRequest, NextResponse} from "next/server";
import { Message } from "openai/resources/beta/threads/messages.mjs";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  let {
    apiKey: key,
    userId,
  } = await req.json();

  const apiKey = key || process.env.OPENAI_API_KEY;
  const openai = new OpenAI({
    apiKey: apiKey || ""
  });

  try {
    const vectorStore = await openai.beta.vectorStores.create({
      name: `${userId} - Vector store`,
      metadata: { userId }
    })

    const thread = await openai.beta.threads.create({
      metadata: {
        userId: userId,
      },
      tool_resources: {
        "file_search": {
          "vector_store_ids": [vectorStore.id]
        }
      }
    });

    return NextResponse.json(
      {
        threadId: thread.id,
        vectorStoreId: vectorStore.id
      }
    )
  } catch (e) {
    return NextResponse.json(
      { error: `Failed to create Open AI Thread. Error: ${e.message}` },
      { status: 500 }
    );
  }
}
