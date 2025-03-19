import { DocumentWorkflow } from "@/lib/workflow";
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const { messages, userId, chatId } = await req.json();
  let message = typeof messages === 'string' ? messages : messages[0].content;

  const workflow = new DocumentWorkflow();
  const app = await workflow.buildGraph();
  
  const result = await app.invoke({
    userId,
    chatId,
    query: message,
    context: [],
    draft: "",
    feedback: []
  });

  return new Response(result.draft);
}
