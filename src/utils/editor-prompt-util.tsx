// Exists in the api/assistant/create route now

// export const SYSTEM_COMMON_INSTRUCTIONS = `\
// You are an advanced AI-powered note-taking assistant, designed to enhance productivity and creativity in note management.
// Respond directly to user prompts with clear, concise, and relevant content. Maintain a neutral, helpful tone.
//
// Rules:
// - <Document> is the entire note the user is working on.
// - <Reminder> is a reminder of how you should reply to INSTRUCTIONS. It does not apply to questions.
// - Anything else is the user prompt.
// - Your response should be tailored to the user's prompt, providing precise assistance to optimize note management.
// - For INSTRUCTIONS: Follow the <Reminder> exactly. Provide ONLY the content to be inserted or replaced. No explanations or comments.
// - For QUESTIONS: Provide a helpful and concise answer. You may include brief explanations if necessary.
// - CRITICAL: Distinguish between INSTRUCTIONS and QUESTIONS. Instructions typically ask you to modify or add content. Questions ask for information or clarification.
// `;

// System settings are now inside /api/ai/assistant/create

// const systemDefault = `\
// - <Block> is the current block of text the user is working on.
// - Ensure your output can seamlessly fit into the existing <Block> structure.
// <!-- - CRITICAL: Provide only a single block of text. DO NOT create multiple paragraphs or separate blocks.-->
//  - CRITICAL: if generating a whole document (not editing a specific block), make sure to format correctly by adding a new line after section headers
// <Block>
// {block}
// </Block>
// `;
//
// const systemSelecting = `\
// - <Block> is the block of text containing the user's selection, providing context.
// - Ensure your output can seamlessly fit into the existing <Block> structure.
// - <Selection> is the specific text the user has selected in the block and wants to modify or ask about.
// - Consider the context provided by <Block>, but only modify <Selection>. Your response should be a direct replacement for <Selection>.
// <Block>
// {block}
// </Block>
// <Selection>
// {selection}
// </Selection>
// `;
//
// const systemBlockSelecting = `\
// - <Selection> represents the full blocks of text the user has selected and wants to modify or ask about.
// - Your response should be a direct replacement for the entire <Selection>.
// - Maintain the overall structure and formatting of the selected blocks, unless explicitly instructed otherwise.
// - CRITICAL: Provide only the content to replace <Selection>. Do not add additional blocks or change the block structure unless specifically requested.
// <Selection>
// {block}
// </Selection>
// `;

// IMPORTANT!!!
// We need to split this by new line here.
// This is because when making the get call in the threads api route, we are parsing user prompt by split lines and removing the below stuff, returning
// only the user prompt. DO NOT change this to not have new lines.
const userDefault = `\
<Reminder>
- CRITICAL: If a <Document> is provided, consider the added context while preparing your response. The <Document> provided might be empty, contain a template OR contain the current state of the user's document.
  - For documents containing non template content: consider the context while generating a new document/response.
- CRITICAL: if a <SectionInstruction> is provided, use the section instruction while generating content for the section. DO NOT use the same section instruction for other sections.
- CRITICAL: DO NOT use block formatting. You can only use Markdown formatting.
- NEVER write <Block>.
</Reminder>
<Document>
{editor}
</Document>
{prompt}`;

const userSelecting = `\
<Reminder>
- If this is a question, provide a helpful and concise answer about <Selection>.
- If this is an instruction, provide ONLY the text to replace <Selection>. No explanations.
- Ensure it fits seamlessly within <Block>. If <Block> is empty, write ONE random sentence.
- NEVER write <Block> or <Selection>.
- Consider the context provided by <Block>, but only modify <Selection>. Your response should be a direct replacement for <Selection>
</Reminder>
<Document>
{editor}
</Document>
<Block>
{block}
</Block>
<Selection>
{selection}
</Selection>
{prompt} about <Selection>`;

const userBlockSelecting = `\
<Reminder>
- If this is a question, provide a helpful and concise answer about <Selection>.
- If this is an instruction, provide ONLY the content to replace the entire <Selection>. No explanations.
- Maintain the overall structure unless instructed otherwise.
- NEVER write <Block> or <Selection>.
- Consider the context provided by <Block>, but only modify <Selection>. Your response should be a direct replacement for <Selection>
</Reminder>
<Document>
{editor}
</Document>
<Block>
{block}
</Block>
<Selection>
{selection}
</Selection>
{prompt} about <Selection>`;

const selectionBlock = `\
Selection:
{selection}
`

const documentAndPrompt = `\
<Document>
{editor}
</Document>
{prompt}
`

const PROMPT_TEMPLATES = {
  documentAndPrompt,
  selectionBlock,
  // systemBlockSelecting,
  // systemDefault,
  // systemSelecting,
  userBlockSelecting,
  userDefault,
  userSelecting,
};

export const editorPromptTemplate = ({ isBlockSelecting, isSelecting }) => {
  return isBlockSelecting
    ? PROMPT_TEMPLATES.userBlockSelecting
    : isSelecting
      ? PROMPT_TEMPLATES.userSelecting
      : PROMPT_TEMPLATES.userDefault;
};

export const editorSelectionBlockTemplate = () => {
  return PROMPT_TEMPLATES.selectionBlock;
};

export const editorDocumentAndPromptTemplate = () => {
  return PROMPT_TEMPLATES.documentAndPrompt;
};
