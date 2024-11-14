import fs from 'fs';
import {NextRequest, NextResponse} from "next/server";
import {appendFileDataToUser} from "@/firebase/firestore-dao";
import OpenAI from "openai";

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

    console.log(`Saving ${fileUploadResponse.id} to firebase`);
    // Firebase save of file ID
    const map = new Map<string, string>();
    map.set('openAiFileId', fileUploadResponse.id);
    map.set('fileName', file.name);

    appendFileDataToUser(userId, map).then((response) => {
      if (response.error) {
        console.log("Firebase response fail: ", response);
        throw response.error;
      } else {
        console.log("Firebase response success: ", response);
      }
    })

    return NextResponse.json({message: `SUCCESS! Updated Vector store with uploaded file and saved to DB`})
  } catch (uploadError) {
    return NextResponse.json({ message: `ERROR! Error: ${uploadError}.` })
  }
}
