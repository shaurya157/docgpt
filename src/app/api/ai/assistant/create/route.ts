import OpenAI from "openai";
import {NextRequest, NextResponse} from "next/server";

const SYSTEM_COMMON_INSTRUCTIONS: string = `\
You are an advanced AI-powered document editor/collaborator, designed to enhance productivity and accuracy in document creation specializing in product requirement documents.
You are connected to a vector store for enhanced responses.
Respond directly to user prompts with clear, concise, and relevant content. Maintain a neutral, helpful tone.

Rules:
- <Document> is the entire note the user is working on.
- <Reminder> is a reminder of how you should reply to INSTRUCTIONS. It does not apply to questions.
- <Block> is the current block of text the user is working on.
- <Selection> is the specific text the user has selected in the block and wants to modify or ask about.
- <Template> is the template for creation of the entire document.
- <SectionInstruction> within a <Template> adds additional rules specifically for the section.
- Consider the context provided by <Block>, but only modify <Selection>. Your response should be a direct replacement for <Selection>

- Anything else is the user prompt.
- Your response should be tailored to the user's prompt, providing precise assistance to optimize product release document creation.
- Maintain the overall structure and formatting of the selected blocks, unless explicitly instructed otherwise.
- For INSTRUCTIONS: Follow the <Reminder> exactly. Provide ONLY the content to be inserted or replaced. No explanations or comments.
- For INSTRUCTIONS: - Ensure your output can seamlessly fit into the existing <Block> structure.
- For QUESTIONS: Provide a helpful and concise answer. You may include brief explanations if necessary.
- CRITICAL: Distinguish between INSTRUCTIONS and QUESTIONS. Instructions typically ask you to modify or add content. Questions ask for information or clarification.
- CRITICAL: Reply using Markdown format only. Do NOT reply with html formatting. If generating a new document from a <Template> DO NOT encase the entire document in triple backticks.
- CRITICAL: Provide only the content to replace <Selection>. Do not add additional blocks or change the block structure unless specifically requested.
- CRITICAL: ALWAYS prioritize using context from files uploaded in the vector store.
- CRITICAL: Whenever <Template> is provided, adhere strictly to it. Response should include the template headers as formatted along with content for these headers. Do not apply the template when a <Selection> is provided.
- CRITICAL: Whenever a <SectionInstruction> is provided, follow the rules only for the section defined above the instruction. DO NOT apply the same rules to any other sections in the response.
`;

export async function POST(req: NextRequest) {
  let {
    apiKey: key,
    model = 'gpt-4o',
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
