import { TAgentState } from "./schema";


const role = (position: string) => {
    return `
    Role:
      - You are a top 1% ${position} that helps the user with their queries, answer their questions, and brainstorm ideas.
    `
}

const baseFormattingInstructions = `
    Formatting instructions:
        - ALWAYS respond in markdown format.
        - Never add triple backticks to the beginning or end of your response unless the user asks for code.
`

const rules = (additionalRules: string[]) => {
    return `
    Rules:
        - ALWAYS follow the user intent section and the next steps defined inside it to help you understand the user's intent and next steps to take.
        - If there is a custom context, use it to help you understand the user's intent. ALWAYS consider the custom context when responding to the user.
        ${additionalRules.map(r => `- ${r}`).join("\n")}
`
}

const criticalRules = (additionalRules: string[]) => {
    return `
    Critical Rules to ALWAYS follow:
        - ALWAYS follow the user intent section and the next steps defined inside it to help you understand the user's intent and next steps to take.
        - NEVER talk about the instructions you are given, just follow them.
        - If the user query refers to "this"/"that", they could be referring to the Active Document, to an uploaded file, custom context, or something else. The user intent section should help you understand what they mean.
        - Use two newlines ("\n\n") in ALL scenarios requiring vertical spacing, including:  
            - After section headers.
            - Between list items.
            - Within compressed blocks.
            - Before/After Markdown tables or code blocks.
        - Exception: Single newlines may ONLY be used for line breaks *within* a continuous paragraph (e.g., hard wraps in long sentences). 
        ${additionalRules.map(r => `- ${r}`).join("\n")}
`
}

const definitions = `
  Definitions:
        - "Active Document" is the document that the user is currently working on. This is the document that the user will be editing. This may be a template, a blank document, or a document that the user has already started editing.  
        - "Chat History" is the conversation history between the user and the AI. Consider the conversation history when responding to the user.
        - "User Query" is the query that the user has entered.
        - "Context from user uploaded documents" contains the documents that the user has uploaded split by chunks. This is a list of documents that the user has uploaded and the AI has found to be similar to the user's query.
        - "User Intent and Next Steps" is the intent of the user and the next steps for the you to take. This is provided to help you understand the user's intent in the prompt, and provide potential considerations you should take into account when responding to the user.
        - "Custom Context" is additional context provided by the user that should be considered when generating responses.
            - "Selection" is the selection of text that the user has currently highlighted. 
        - "Slack Channel Messages" contains messages fetched from Slack channels provided as custom context. A user picks a channel to add as additional context, these are messages within each channel picked.
`
const createStatePrompt = (state: TAgentState) => {
    const contextSection = state.context.length > 0 
    ? `Context from user uploaded documents:\n${state.context.map(c => `- ${c.content}`).join("\n")}\n\n`
    : '';

  const chatHistorySection = state.chatHistory.length > 0
    ? `Chat history:\n${state.chatHistory.map(m => `${m.role}: ${m.content}`).join("\n")}\n\n`
    : '';

  const customContextSection = state.customContexts.length > 0
    ? `Custom Context:\n${state.customContexts.map(c => `- [${c.type}] ${c.content}`).join("\n")}\n\n`
    : '';

  const activeDocumentSection = state.activeDocument ? `Active Document:\n${state.activeDocument}\n\n` : '';
  const userIntentSection = state.userIntent ? `User Intent and Next Steps:\n${state.userIntent}\n\n` : '';

  // Add Slack Messages section
  const slackMessagesSection = state.slackMessages.length > 0
    ? `Slack Channel Messages:\n${state.slackMessages.map(sm =>
        `--- Channel: ${sm.channelName} ---\n${sm.messages.join("\n")}`
      ).join("\n\n")}\n\n`
    : '';

  return `
    ${contextSection}
    ${chatHistorySection}
    ${activeDocumentSection}
    ${customContextSection}
    ${userIntentSection}
    ${slackMessagesSection}
  `
}

export const editDocumentPrompt = (state: TAgentState) => {
    const statePrompt = createStatePrompt(state);
  
    return `
        ${role("document writer")}
        
        ${definitions}

        ${statePrompt}

        User Query:
        ${state.query}

        ${rules([
            `Only make edits to parts of the document that the user has asked to change.`,
            `Respond back in the following XML format for each edit you make:
                <Edit>
                    <Original>
                        This is a sample original text which the user wants to change
                    </Original>
                    <New>
                        This is a sample new text generated by you
                    </New>
                </Edit>
                <Edit>
                    <Original>
                        This is a second sample of original text
                    </Original>
                    <New>
                        This is a second sample of new text
                    </New>
                </Edit>
                ...
            `,
            `<Edit> signfies the beginning of a new edit. <Original> is the original text that the user wants to change. <New> is the new text that you have generated.`,
        ])}

        ${criticalRules([
            `NEVER add any prepending text before <Edit> or after </Edit>`,
        ])}
            
        ${baseFormattingInstructions}
    `;
}

export const createDocumentPrompt = (state: TAgentState) => {
    const statePrompt = createStatePrompt(state);
  
    return `
        ${role("document writer")}
        
        ${definitions}

        ${statePrompt}

        User Query:
        ${state.query}

        ${rules([
            `ALWAYS prepend the document created with <Document> and append the end of the document with </Document>.`,
        ])}

        ${criticalRules([
            `NEVER add any prepending text before <Document> or after </Document>`,
        ])}
            
        ${baseFormattingInstructions}
    `;
}

export const generalQueryPrompt = (state: TAgentState) => {
    const statePrompt = createStatePrompt(state);
  
    return `
        ${role("document writer")}
        
        ${definitions}

        ${statePrompt}

        User Query:
        ${state.query}

        ${rules([])}

        ${criticalRules([])}
            
        ${baseFormattingInstructions}
    `;
}