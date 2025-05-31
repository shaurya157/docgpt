import { Pinecone } from '@pinecone-database/pinecone';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

interface FileMetadata {
  contentType: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  userId: string;
  chatId?: string;
}

interface ProcessResult {
  fileName: string;
  status: 'error' | 'success';
  chunksCreated?: number;
  contentType?: string;
  error?: string;
  fileIds?: string[];
  preview?: string;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll('files') as File[];
  const userId = formData.get('userId');
  const chatId = formData.get('chatId')?.toString();

  if (!process.env.PINECONE_API_KEY || !process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      error: 'Missing required API keys'
    }, { status: 500 });
  }

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });
  const index = pinecone.Index(process.env.PINECONE_INDEX || "");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const results: ProcessResult[] = [];

  for (const file of files) {
    try {
      let textContent = '';
      const metadata: FileMetadata = {
        contentType: '',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
        userId: userId?.toString() || '',
        ...(chatId && { chatId })
      };

      console.log(`Processing file: ${file.name} (${file.type})`);

      // Process based on file type
      if (file.type.startsWith('image/')) {
        // Use OpenAI Vision for image analysis
        const base64 = await fileToBase64(file);
        const response = await openai.chat.completions.create({
          max_tokens: 1000,
          messages: [{
            content: [
              { 
                text: "Analyze this image in detail. Describe what you see, including any text, objects, people, scenes, and context. If there are charts, graphs, or data visualizations, describe the data and insights. If there's text in the image, transcribe it accurately.", 
                type: "text" 
              },
              { 
                image_url: { 
                  detail: "high",
                  url: `data:${file.type};base64,${base64}`
                }, 
                type: "image_url" 
              }
            ],
            role: "user"
          }],
          model: "gpt-4o"
        });
        textContent = response.choices[0].message.content || '';
        metadata.contentType = 'image_description';
        
      } else if (file.type.startsWith('audio/')) {
        // Use OpenAI Whisper for audio transcription
        const transcription = await openai.audio.transcriptions.create({
          file: file,
          model: "whisper-1",
        });
        textContent = transcription.text;
        metadata.contentType = 'audio_transcription';
        
      } else if (file.type.startsWith('video/')) {
        // For video, simplified approach for demo
        textContent = `Video file uploaded: ${file.name}. Video processing would extract audio for transcription and key frames for visual analysis.`;
        metadata.contentType = 'video_content';
        
      } else if (file.type === 'application/pdf' || file.type.startsWith('text/') || 
                 file.type === 'application/msword' || 
                 file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Use existing LlamaParse for documents or simple text extraction
        textContent = await processDocument(file);
        metadata.contentType = 'document_text';
      } else {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      if (!textContent.trim()) {
        throw new Error('No content could be extracted from the file');
      }

      // Create embeddings and store
      const chunks = chunkText(textContent, 1000);
      const embeddings = await pinecone.inference.embed(
        "llama-text-embed-v2",
        chunks,
        { inputType: 'passage' }
      );

      const chunkIds: string[] = [];
      const vectors = chunks.map((chunk, index) => {
        const chunkId = uuidv4();
        chunkIds.push(chunkId);
        
        // Handle embedding structure properly
        const embedding = embeddings.data[index];
        let values: number[];
        
        if ('values' in embedding) {
          values = embedding.values;
        } else {
          values = embedding as any;
        }
        
        return {
          id: chunkId,
          metadata: { 
            ...metadata, 
            chunkIndex: index,
            text: chunk,
            totalChunks: chunks.length
          },
          values: values
        };
      });

      await index.upsert(vectors);
      
      results.push({
        chunksCreated: chunks.length,
        contentType: metadata.contentType,
        fileIds: chunkIds,
        fileName: file.name,
        preview: textContent.substring(0, 200) + (textContent.length > 200 ? '...' : ''),
        status: 'success'
      });

    } catch (error: any) {
      console.error(`Error processing file ${file.name}:`, error);
      results.push({
        error: error.message || 'Unknown error occurred',
        fileName: file.name,
        status: 'error'
      });
    }
  }

  return NextResponse.json({ results });
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

async function processDocument(file: File): Promise<string> {
  // Simple text extraction for demo
  if (file.type.startsWith('text/')) {
    return await file.text();
  }
  
  // For PDFs and other documents, try to use existing LlamaParse logic
  if (process.env.LLAMA_CLOUD_API_KEY) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const parseResponse = await fetch('https://api.cloud.llamaindex.ai/api/parsing/upload', {
        body: formData,
        headers: { 'Authorization': `Bearer ${process.env.LLAMA_CLOUD_API_KEY}` },
        method: 'POST'
      });

      if (!parseResponse.ok) {
        throw new Error(`LlamaParse API error: ${parseResponse.statusText}`);
      }

      const parseData = await parseResponse.json();

      // Poll for job completion
      let jobStatus = "PENDING";
      let attempts = 0;
      const maxAttempts = 60; // 30 seconds max

      while (jobStatus === "PENDING" && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;

        const statusResponse = await fetch(`https://api.cloud.llamaindex.ai/api/parsing/job/${parseData.id}`, {
          headers: { 'Authorization': `Bearer ${process.env.LLAMA_CLOUD_API_KEY}` },
          method: 'GET'
        });

        if (!statusResponse.ok) {
          throw new Error(`Status check failed: ${statusResponse.statusText}`);
        }

        const statusData = await statusResponse.json();
        jobStatus = statusData.status;

        if (statusData.status === "FAILED") {
          throw new Error(`Parsing job failed: ${statusData.error || 'Unknown error'}`);
        }
      }

      if (jobStatus === "PENDING") {
        throw new Error('Parsing job timed out');
      }

      // Get markdown results
      const markdownResponse = await fetch(
        `https://api.cloud.llamaindex.ai/api/parsing/job/${parseData.id}/result/markdown`,
        {
          headers: { 'Authorization': `Bearer ${process.env.LLAMA_CLOUD_API_KEY}` },
          method: 'GET'
        }
      );

      if (!markdownResponse.ok) {
        throw new Error(`Failed to fetch markdown: ${markdownResponse.statusText}`);
      }

      const markdownData = await markdownResponse.json();
      return markdownData.markdown;
    } catch (error) {
      console.error('LlamaParse error:', error);
      // Fall back to placeholder
    }
  }
  
  // Fallback for documents when LlamaParse is not available
  return `Document uploaded: ${file.name}. Content extraction would be implemented here using LlamaParse or similar service.`;
}

function chunkText(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + maxLength, text.length);
    chunks.push(text.slice(start, end));
    start = end;
  }

  return chunks.length > 0 ? chunks : [text];
} 