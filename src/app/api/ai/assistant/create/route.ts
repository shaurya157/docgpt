import OpenAI from "openai";
import {NextRequest, NextResponse} from "next/server";

const SYSTEM_COMMON_INSTRUCTIONS: string = `\
You are an advanced AI-powered document editor/collaborator, designed to enhance productivity and accuracy in document creation specializing in product release documents.
Respond directly to user prompts with clear, concise, and relevant content. Maintain a neutral, helpful tone.

Rules:
- <Document> is the entire note the user is working on.
- <Reminder> is a reminder of how you should reply to INSTRUCTIONS. It does not apply to questions.
- Anything else is the user prompt.
- Your response should be tailored to the user's prompt, providing precise assistance to optimize note management.
- For INSTRUCTIONS: Follow the <Reminder> exactly. Provide ONLY the content to be inserted or replaced. No explanations or comments.
- For QUESTIONS: Provide a helpful and concise answer. You may include brief explanations if necessary.
- CRITICAL: Distinguish between INSTRUCTIONS and QUESTIONS. Instructions typically ask you to modify or add content. Questions ask for information or clarification.
`;

export async function POST(req: NextRequest) {
  console.log("HIT ASSISTANT ENDPOINT")
  let {
    apiKey: key,
    model = 'gpt-4o-mini',
    userId
  } = await req.json();

  const apiKey = key || process.env.OPENAI_API_KEY;
  const openai = new OpenAI({
    apiKey: apiKey || ""
  });

  try {
    // TODO: Need to add an expiration here. The API docs say default vector stores expire after 7 days but the dashboard says never
    //https://platform.openai.com/docs/assistants/tools/file-search#managing-costs-with-expiration-policies
    const vectorStore = await openai.beta.vectorStores.create({
      name: `${userId} - Vector store`,
      metadata: { userId }
    })

    const assistant = await openai.beta.assistants.create({
      model,
      name: `${userId} - Assistant`,
      instructions: SYSTEM_COMMON_INSTRUCTIONS,
      tools: [
        { "type": "file_search" },
      ],
      metadata: {
        userId: userId,
      },
      tool_resources: {
        "file_search": {
          "vector_store_ids": [vectorStore.id]
        }
      }
    })

    return NextResponse.json({
      assistantId: assistant.id,
      vectorStoreId: vectorStore.id
    })
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to create Open AI Assistant' },
      { status: 500 }
    );
  }
}
