import { Pinecone } from '@pinecone-database/pinecone';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const { messages, chatId, userId } = await req.json();
    const lastMessage = messages[messages.length - 1];

    if (!process.env.PINECONE_API_KEY || !process.env.OPENAI_API_KEY) {
      throw new Error('Missing required API keys');
    }

    // Get relevant context from Pinecone
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pinecone.Index(process.env.PINECONE_INDEX || "");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Create embedding for the query
    const queryEmbedding = await pinecone.inference.embed(
      "llama-text-embed-v2",
      [lastMessage.content],
      { inputType: 'query' }
    );

    // Extract the vector values properly
    const embedding = queryEmbedding.data[0];
    let vectorValues: number[];
    
    if ('values' in embedding) {
      vectorValues = embedding.values;
    } else {
      // Handle sparse embedding case or other formats
      vectorValues = embedding as any;
    }

    // Search for relevant context
    const searchResults = await index.query({
      vector: vectorValues,
      topK: 15,
      filter: { 
        userId,
        ...(chatId && { chatId })
      },
      includeMetadata: true
    });

    // Build context from multimodal sources
    const contextSections = searchResults.matches
      .filter(match => match.score && match.score > 0.7) // Only include relevant matches
      .map(match => {
        const metadata = match.metadata;
        const contentType = metadata?.contentType || 'unknown';
        const fileName = metadata?.fileName || 'unknown';
        const text = metadata?.text || '';
        
        let prefix = '';
        switch (contentType) {
          case 'image_description':
            prefix = `[IMAGE ANALYSIS from ${fileName}]`;
            break;
          case 'audio_transcription':
            prefix = `[AUDIO TRANSCRIPT from ${fileName}]`;
            break;
          case 'video_content':
            prefix = `[VIDEO CONTENT from ${fileName}]`;
            break;
          case 'document_text':
            prefix = `[DOCUMENT from ${fileName}]`;
            break;
          default:
            prefix = `[CONTENT from ${fileName}]`;
        }
        
        return `${prefix}: ${text}`;
      });

    const context = contextSections.join('\n\n');

    const systemPrompt = `You are a helpful AI assistant that can analyze and answer questions about uploaded files. You have access to content from various file types including:

- 📸 Images: Visual descriptions, text extraction, object recognition
- 🎵 Audio: Transcriptions of speech, conversations, and audio content  
- 🎥 Videos: Content analysis and transcriptions
- 📄 Documents: Text content from PDFs, Word docs, and other documents

Here is the relevant context from the user's uploaded files:

${context}

Instructions:
- Answer questions based on the provided context from the user's files
- When referencing specific files, mention them by name (e.g., "In the image 'screenshot.png'...")
- If you can't find relevant information in the uploaded files, say so clearly
- For images, describe what you see in detail when asked
- For audio/video, reference the transcribed content
- Be specific about which file(s) you're drawing information from
- If the user asks about something not in their files, explain that you can only discuss their uploaded content

Current conversation context: The user has uploaded files and is asking questions about their content.`;

    // Use OpenAI directly for streaming to avoid AI SDK version conflicts
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              const data = `0:${JSON.stringify({ type: 'text-delta', textDelta: content })}\n`;
              controller.enqueue(encoder.encode(data));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
} 