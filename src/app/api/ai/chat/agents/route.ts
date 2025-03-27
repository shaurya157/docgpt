import { NextRequest } from 'next/server';

import { DocumentWorkflow } from "@/lib/workflow";
import { CustomStreamController } from "@/utils/custom-stream";

export async function POST(req: NextRequest) {
  const streamController = new CustomStreamController();
  
  try {
    const { chatId, messages, model, userId } = await req.json();
    const selectedModel = model || 'Open AI 4o';
    const message = typeof messages === 'string' ? messages : messages[0].content;

    const workflow = new DocumentWorkflow();
    const app = await workflow.buildGraph();
    
    // Start the workflow with the stream controller
    app.invoke({
      chatId,
      context: [],
      draft: "",
      feedback: [],
      model: selectedModel,
      query: message,
      userId,
      streamController
    }).catch(error => {
      console.error('Workflow error:', error);
      streamController.writeSystemMessage(`Error: ${error.message}`);
      streamController.close();
    });

    // Return the stream
    return new Response(streamController.getStream(), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    // Ensure stream is closed on error
    streamController.writeSystemMessage('An unexpected error occurred');
    streamController.close();
    
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
