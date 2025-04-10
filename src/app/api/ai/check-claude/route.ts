import { NextRequest } from 'next/server';
import Anthropic from "@anthropic-ai/sdk";

export async function GET(req: NextRequest) {
  console.log(`🧪 Testing Claude API access at ${new Date().toISOString()}`);
  
  try {
    // Create a direct Anthropic client instance
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    // Get available models
    console.log(`🔍 Checking Claude models with API key: ${process.env.ANTHROPIC_API_KEY ? "✅ Present" : "❌ Missing"}`);
    const models = await anthropic.models.list();
    console.log(`✅ Available Claude models: ${models.data.map(m => m.id).join(', ')}`);
    
    // Test a simple completion with Claude 3.7 Sonnet
    console.log(`🧠 Testing simple completion with claude-3-7-sonnet-20250219`);
    const result = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 100,
      messages: [{ role: "user", content: "Hello, Claude!" }],
    });
    
    console.log(`✅ Claude test successful!`);
    
    // Return the results
    return new Response(
      JSON.stringify({
        status: "success",
        models: models.data.map(m => ({
          id: m.id,
          // Only include properties that exist on the ModelInfo type
        })),
        testCompletion: {
          model: result.model,
          content: result.content,
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    // Log and return error
    console.error(`❌ Claude API test failed:`, error);
    
    let errorMessage = "Unknown error occurred";
    let errorDetails = {};
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = { stack: error.stack };
    }
    
    // Try to extract more details if it's an API error
    try {
      if (typeof error === 'object' && error !== null) {
        errorDetails = { ...errorDetails, ...error };
      }
    } catch (e) {
      console.error("Failed to extract error details:", e);
    }
    
    return new Response(
      JSON.stringify({
        status: "error",
        message: errorMessage,
        details: errorDetails
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
} 