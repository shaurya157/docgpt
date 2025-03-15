import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import fs from "fs";
import pdfParse from "pdf-parse";

export async function DELETE(req: NextRequest) {
  const reqJson = await req.json();
  const { openAiFileId } = reqJson;

  const apiKey = process.env.OPENAI_API_KEY;
  const openai = new OpenAI({
    apiKey: apiKey || '',
  });

  try {
    const deleteFileResponse = await openai.files.del(openAiFileId);

    if (deleteFileResponse.deleted) {
      return NextResponse.json({
        message: 'File deleted successfully.',
      });
    } else {
      return NextResponse.json({
        message: `Encountered an error while deleting from Open AI, non 200 status code`,
      });
    }
  } catch (deleteError) {
    return NextResponse.json({
      message: `Error deleting file. Error: ${deleteError}`,
    });
  }
}

export async function POST(req: NextRequest) {
  console.log("Beginning upload")
  const formData = await req.formData();
  const files = formData.getAll('files') as File[];
  const userId = formData.get('userId');
  const vectorStoreId = formData.get('vectorStoreId');

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

    const result: any[] = [];
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

        // TODO: add a unique identifier to the id and proper metadata
        const vectors = chunks.map((chunk, index) => ({
          id: `${userId}-${file.name}-${index}`,
          values: embeddings.data[index]["values"],
          metadata: {
            userId: userId?.toString() || '',
            fileName: file.name,
            text: chunk
          }
        }))

        await index.upsert(vectors);

        return NextResponse.json({
          message: `Successfully uploaded ${chunks.length} chunks from file: ${file.name}`
        });
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        console.error("File error message:", fileError.message)
        result.push({
          fileName: file.name,
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
            
// OpenAI API file upload
// TODO: add polling here similar to /chat route where we check upload status
// const fileUploadResponse = await openai.files.create({
//   file,
//   purpose: 'assistants',
// });

// result.push({
//   fileName: file.name,
//   openAiFileId: fileUploadResponse.id,
// });

// // TODO: add polling here similar to /chat route where we check upload status
// await openai.beta.vectorStores.files.create(vectorStoreId as string, {
//   file_id: fileUploadResponse.id,
// });