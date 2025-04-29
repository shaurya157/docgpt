import { ModelRouter } from "../models"; // Assuming models.ts is in the parent directory
import { TAgentState } from "../schema";
import { IGraphNode } from "./base";

export class SanitizeInputContainer implements IGraphNode {
    private modelRouter: ModelRouter;
    private name = "sanitizeAndClassifyInput";

    constructor(modelRouter: ModelRouter) {
        this.modelRouter = modelRouter;
    }

    private async classifyIntentNode(state: TAgentState): Promise<Partial<TAgentState>> {
        console.log("Classifying intent...");
        const { chatHistory, customContexts, query, streamController } = state;

        // Use the last message from chat history if available, otherwise use the original query
        const lastUserMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;
        const queryToAnalyze = lastUserMessage ? lastUserMessage.content : query;
        const uploadedFiles = lastUserMessage?.fileNames ?? [];

        const classificationPrompt = `
          Analyze the user's query, considering chat history, custom context, and uploaded files, and classify the primary goal into ONE of the following categories:
          - "create": The user wants to generate a completely new document.
          - "edit": The user wants to modify an existing document or a specific part of it (like a selection or using uploaded files as reference/input for edits).
          - "general": The user is asking for information, clarification, or performing an action not directly related to creating or editing document content (e.g., asking about capabilities, summarizing history, general questions).

          User Query:
          ---
          ${queryToAnalyze}
          ---

          Custom context added by the user:
          ---
          ${customContexts.length > 0 ? customContexts.map(c => `- [${c.type}] ${c.content}`).join("\n") : 'None'}
          ---
          
          Uploaded Files with this message: ${uploadedFiles.length > 0 ? uploadedFiles.join(', ') : 'None'}

          Chat History (Last few messages):
          ---
          ${chatHistory.slice(-3).map(m => `${m.role}: ${m.content}`).join("\n")}
          ---

          Respond with only ONE word: "create", "edit", or "general".
        `;

        try {
            const classification = await this.modelRouter.generate(
                "Open AI 4o", // Consider making model configurable
                classificationPrompt,
                "Classify user intent internally",
                false // Non-streaming
            );

            const cleanClassification = classification.trim().toLowerCase();
            console.log("Internal classification:", cleanClassification);

            if (['create', 'edit', 'general'].includes(cleanClassification)) {
                return { synthesizedIntent: cleanClassification as 'create' | 'edit' | 'general' };
            } else {
                console.warn(`Unexpected classification result: '${classification}'. Defaulting to 'general'.`);
                streamController.writeSystemMessage("Warning: Could not reliably determine intent, proceeding with general query.");
                return { synthesizedIntent: 'general' };
            }
        } catch (error) {
            console.error("Error in classify intent node:", error);
            streamController.writeSystemMessage("Error: Failed to classify user intent. Proceeding with general query.");
            return { synthesizedIntent: 'general' };
        }
    }

    private async sanitizeQueryNode(state: Pick<TAgentState, 'query'>): Promise<Partial<TAgentState>> {
        const { query } = state;
        console.log("Sanitizing query...");
        const tagRegex = /<(Document|Block|Selection|Reminder)>([\s\S]*?)<\/\1>/g;
        const result: Record<string, string> = {};
        let lastIndex = 0;
        let match;

        while ((match = tagRegex.exec(query)) !== null) {
            const tagType = match[1];
            const content = match[2];
            result[tagType] = content.trim();
            lastIndex = tagRegex.lastIndex;
        }

        const queryPart = query.slice(lastIndex).trim();
        return {
            activeDocument: result["Document"],
            query: queryPart ? queryPart : undefined, // Keep original if no query part extracted? Or set to empty? Let's set to undefined for now to signal removal.
        };
    }

    // --- Node Logic (moved from DocumentWorkflow) ---

    async execute(state: TAgentState): Promise<Partial<TAgentState>> {
        console.log(`--- Executing ${this.getName()} ---`);
        // Run sanitize and classify in parallel
        const [sanitizeResult, classifyResult] = await Promise.all([
            this.sanitizeQueryNode(state),
            // Pass the initial state to classify, it will use the original query before sanitization
            this.classifyIntentNode(state) 
        ]);

        // Merge results - prioritize classifyResult's synthesizedIntent
        // and sanitizeResult's query/activeDocument changes
        return {
            ...sanitizeResult,
            synthesizedIntent: classifyResult.synthesizedIntent,
        };
    }

    getName(): string {
        return this.name;
    }
} 