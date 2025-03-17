import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { v4 as uuidv4 } from 'uuid';

export async function DELETE(req: NextRequest) {
  const reqJson = await req.json();
  const { fileIds } = reqJson;

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
  });
  const index = pinecone.Index(process.env.PINECONE_INDEX || "");

  try {
    // Delete all chunks associated with the file
    await index.deleteMany(fileIds);

    return NextResponse.json({
      message: 'File chunks deleted successfully.',
      status: 200
    });
  } catch (deleteError) {
    console.error("Error deleting chunks:", deleteError);
    return NextResponse.json({
      message: `Error deleting file chunks. Error: ${deleteError}`,
      status: 500
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll('files') as File[];
  const userId = formData.get('userId');

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || '',
  });
  const index = pinecone.Index(process.env.PINECONE_INDEX || "");

  const apiKey = process.env.OPENAI_API_KEY;
  const openai = new OpenAI({
    apiKey: apiKey || '',
  });

  try {
    if (userId == null) {
      throw new Error(
        'No user ID provided with upload. Please login before uploading files.'
      );
    }

    const result: { fileName: string; fileIds: string[]; status: string; error?: string }[] = [];
    
    // Process each file
    for (const file of files) {
      try {        
        // Convert File to FormData for LlamaParse
        const llamaParseFormData = new FormData();
        llamaParseFormData.append('file', file);
        
        // Call LlamaParse API to extract text
        const parseResponse = await fetch('https://api.cloud.llamaindex.ai/api/parsing/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.LLAMA_CLOUD_API_KEY}`
          },
          body: llamaParseFormData
        });

        if (!parseResponse.ok) {
          throw new Error(`LlamaParse API error: ${parseResponse.statusText}`);
        }

        const parseData = await parseResponse.json();

        // Poll for job completion
        let jobStatus = "PENDING";
        while (jobStatus === "PENDING") {
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms

          const statusResponse = await fetch(`https://api.cloud.llamaindex.ai/api/parsing/job/${parseData.id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${process.env.LLAMA_CLOUD_API_KEY}`
            }
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

        // Get markdown results
        const markdownResponse = await fetch(
          `https://api.cloud.llamaindex.ai/api/parsing/job/${parseData.id}/result/markdown`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${process.env.LLAMA_CLOUD_API_KEY}`
            }
          }
        );

        if (!markdownResponse.ok) {
          throw new Error(`Failed to fetch markdown: ${markdownResponse.statusText}`);
        }

        const markdownData = await markdownResponse.json();
        const text = markdownData.markdown;

        // Chunk the text into segments of 1000 characters
        const chunks = chunkText(text, 1000);

        if (chunks.length === 0) {
          throw new Error(`No chunks created from file: ${file.name}`);
        }

        // Generate embeddings for each chunk using llama-text-embed-v2
        const embeddings =  await pinecone.inference.embed(
          "llama-text-embed-v2",
          chunks,
          { inputType: 'passage' }
        )

        const chunkIds: string[] = [];
        
        // Create vectors with UUID as ids
        const vectors = chunks.map((chunk, index) => {
          const chunkId = uuidv4();
          chunkIds.push(chunkId);
          return {
            id: chunkId,
            values: embeddings.data[index]["values"],
            metadata: {
              userId: userId?.toString() || '',
              fileName: file.name,
              text: chunk
            }
          };
        });

        await index.upsert(vectors);

        result.push({
          fileName: file.name,
          fileIds: chunkIds,
          status: 'success'
        });

      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        console.error("File error message:", fileError.message)
        result.push({
          fileName: file.name,
          fileIds: [],
          status: 'error',
          error: fileError.message
        });
      }
    }

    return NextResponse.json({
      files: result,
      status: 200
    });
  } catch (uploadError) {
    console.error("Upload error:", uploadError);
    return NextResponse.json({
      message: uploadError.message || 'An unknown error occurred',
      status: 400
    }, { status: 400 });
  }
}

// Splits text into chunks of `maxLength`
function chunkText(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + maxLength, text.length);
    chunks.push(text.slice(start, end));
    start = end;
  }

  return chunks;
}
