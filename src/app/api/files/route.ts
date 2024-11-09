import fs from 'fs';
import {NextRequest, NextResponse} from "next/server";
import {appendFileDataToUser} from "@/firebase/firestore-dao";

export const config = {
  api: {
    bodyParser: false,
  },
};

type Data = {
  file_id?: string;
  error?: string;
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const userId = formData.get('user_id');

  try {
    if (userId == null) {
      throw new Error('No user ID provided with upload. Please login before uploading files.');
    }

    // Prepare file for upload
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append("purpose", "assistants")

    // OpenAI API file upload
    const openAiResponse = await fetch('https://api.openai.com/v1/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: formData as unknown as BodyInit, // Type assertion to bypass TypeScript mismatch
    });

    const openAiResult = await openAiResponse.json();

    if (!openAiResponse.ok) {
      return NextResponse.json({ message: `FAILURE! Status: ${openAiResponse.status}. Error message: ${openAiResult.error.message}` })
    }

    console.log(`Saving ${openAiResult.id} to firebase`);
    // Firebase save of file ID
    const map = new Map<string, string>();
    map.set('openAiFileId', openAiResult.id);
    map.set('fileName', file.name);

    appendFileDataToUser(userId, map).then((response) => {
      if (response.error) {
        console.log("Firebase response fail: ", response);
        throw response.error;
      } else {
        console.log("Firebase response success: ", response);
      }
    })

    return NextResponse.json({message: `SUCCESS! Status: ${openAiResult.status}. File ID: ${openAiResult.id}`})
  } catch (uploadError) {
    return NextResponse.json({ message: `ERROR! Error: ${uploadError}.` })
  }
}
