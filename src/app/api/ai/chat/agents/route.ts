import { DocumentWorkflow } from "@/lib/workflow";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const message = formData.get('message');
  const userId = formData.get('userId');
  const chatId = formData.get('chatId');
  
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
