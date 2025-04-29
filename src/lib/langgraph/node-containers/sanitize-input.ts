import { LLMGenerationResult, ModelRouter } from "../models"; // Assuming models.ts is in the parent directory
import { TAgentState } from "../schema";
import { updateAccumulatedTokens } from "../token-usage-updater"; // Import the helper
import { IGraphNode } from "./base";

export class SanitizeInputContainer implements IGraphNode {
    private modelRouter: ModelRouter;
    private name = "sanitizeAndClassifyInput";

    constructor(modelRouter: ModelRouter) {
        this.modelRouter = modelRouter;
    }

    // Modified to return usage info along with intent
    private async classifyIntentNode(state: TAgentState): Promise<{ synthesizedIntent: 'create' | 'edit' | 'general', usage: LLMGenerationResult['usage'] }> {
        console.log("Classifying intent...");
        const { chatHistory, customContexts, query, streamController } = state;
        let intentResult: 'create' | 'edit' | 'general' = 'general'; // Default
        let usage: LLMGenerationResult['usage'] = null;

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
            const generationResult = await this.modelRouter.generate(
                "Open AI 4o", // Consider making model configurable or using state.model
                classificationPrompt,
                "Classify user intent internally",
                false // Non-streaming
            );
            usage = generationResult.usage; // Capture usage
            const cleanClassification = generationResult.output.trim().toLowerCase();
            console.log("Internal classification:", cleanClassification);

            if (['create', 'edit', 'general'].includes(cleanClassification)) {
                intentResult = cleanClassification as 'create' | 'edit' | 'general';
            } else {
                console.warn(`Unexpected classification result: '${generationResult.output}'. Defaulting to 'general'.`);
                streamController.writeSystemMessage("Warning: Could not reliably determine intent, proceeding with general query.");
                // Keep intentResult as 'general'
            }
        } catch (error) {
            console.error("Error in classify intent node:", error);
            streamController.writeSystemMessage("Error: Failed to classify user intent. Proceeding with general query.");
            // Keep intentResult as 'general' and usage as null
        }
        return { synthesizedIntent: intentResult, usage };
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
            query: queryPart ? queryPart : undefined,
        };
    }

    // --- Node Logic (moved from DocumentWorkflow) ---

    async execute(state: TAgentState): Promise<Partial<TAgentState>> {
        console.log(`--- Executing ${this.getName()} ---`);
        let accumulatedTokens = state.accumulatedTokens;
        let classifyUsageResultState: Partial<TAgentState> = {};

        // Run sanitize (no LLM call) and classify (LLM call) in parallel
        const [sanitizeResult, classifyResult] = await Promise.all([
            this.sanitizeQueryNode(state), // No LLM call here
            this.classifyIntentNode(state) // Makes LLM call
        ]);

        // If classifyIntentNode returned usage, update accumulatedTokens
        if (classifyResult.usage) {
            accumulatedTokens = updateAccumulatedTokens(
                accumulatedTokens,
                "classifyIntent", // Use specific node name here
                classifyResult.usage
            );
            classifyUsageResultState = { accumulatedTokens };
        }

        // Merge results
        return {
            ...sanitizeResult,
            synthesizedIntent: classifyResult.synthesizedIntent,
            ...classifyUsageResultState, // Include updated tokens
        };
    }

    getName(): string {
        return this.name;
    }
} 