import fs from 'fs';
import {NextRequest, NextResponse} from "next/server";
import {appendFileDataToUser} from "@/firebase/firestore-dao";
import OpenAI from "openai";

export async function DELETE(req: NextRequest) {
  const reqJson = await req.json();
  let { openAiFileId } = reqJson;

  const apiKey = process.env.OPENAI_API_KEY;
  const openai = new OpenAI({
    apiKey: apiKey || ""
  });

  try {
    const deleteFileResponse = await openai.files.del(openAiFileId)

    if (deleteFileResponse.deleted) {
      return NextResponse.json({
        message: "File deleted successfully."
      })
    } else {
      return NextResponse.json({
        message: `Encountered an error while deleting from Open AI, non 200 status code`
      })
    }
  } catch (deleteError) {
    return NextResponse.json({
      message: `Error deleting file. Error: ${deleteError}`
    })
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const userId = formData.get('user_id');
  const vectorStoreId = formData.get('vector_store_id');

  const apiKey = process.env.OPENAI_API_KEY;
  const openai = new OpenAI({
    apiKey: apiKey || ""
  });

  try {
    if (userId == null) {
      throw new Error('No user ID provided with upload. Please login before uploading files.');
    }

    // Prepare file for upload
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append("purpose", "assistants")

    // OpenAI API file upload
    // TODO: add polling here similar to /chat route where we check upload status
    const fileUploadResponse = await openai.files.create({
      file,
      purpose: "assistants"
    })

    // TODO: add polling here similar to /chat route where we check upload status
    // @ts-ignore
    const batchResponse = await openai.beta.vectorStores.files.create(vectorStoreId, {
      file_id: fileUploadResponse.id
    })

    return NextResponse.json({
      openAiFileId: fileUploadResponse.id
    })
  } catch (uploadError) {
    return NextResponse.json({ message: `ERROR! Error: ${uploadError}.` })
  }
}
