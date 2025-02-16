import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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
  const formData = await req.formData();
  const files = formData.getAll('files') as File[];
  // const prependString = formData.get("prependString") as string;

  const userId = formData.get('userId');
  const vectorStoreId = formData.get('vectorStoreId');

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
    // Prepare file for upload
    for (const file of files) {
      // OpenAI API file upload
      // TODO: add polling here similar to /chat route where we check upload status
      const fileUploadResponse = await openai.files.create({
        file,
        purpose: 'assistants',
      });

      result.push({
        fileName: file.name,
        openAiFileId: fileUploadResponse.id,
      });

      // TODO: add polling here similar to /chat route where we check upload status
      // @ts-ignore
      await openai.beta.vectorStores.files.create(vectorStoreId, {
        file_id: fileUploadResponse.id,
      });
    }

    return NextResponse.json({
      openAiFileIds: result,
    });
  } catch (uploadError) {
    return NextResponse.json({
      message: `ERROR! Error: ${uploadError}.`,
      status: 400,
    });
  }
}
