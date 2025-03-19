import { NextRequest } from 'next/server';

import { DocumentWorkflow } from "@/lib/workflow";

export async function POST(req: NextRequest) {
  const { chatId, messages, userId, model } = await req.json();
  const selectedModel = model || 'Open AI 4o';
  const message = typeof messages === 'string' ? messages : messages[0].content;

  const workflow = new DocumentWorkflow();
  const app = await workflow.buildGraph();
  
  const result = await app.invoke({
    chatId,
    context: [],
    draft: "",
    feedback: [],
    query: message,
    userId,
    model: selectedModel
  });

  return new Response(result.draft);
}
