import { LLMGenerationResult, ModelRouter } from "../models";
import { 
    createDocumentPrompt, 
    editDocumentPrompt, 
    summarizeCreationPrompt, 
    summarizeEditPrompt 
} from "../prompts";
import { TAgentState } from "../schema";
import { IGraphNode } from "./base";
import { updateAccumulatedTokens } from "./token_usage_updater"; // Import helper

export class DocumentSpecificContainer implements IGraphNode {
    private modelRouter: ModelRouter;
    private name = "documentActionAndFinalize";

    constructor(modelRouter: ModelRouter) {
        this.modelRouter = modelRouter;
    }

    // --- Node Logic --- 
    // Modified to return draft and usage
    private async createDocumentNode(state: TAgentState): Promise<{ draft: string, usage: LLMGenerationResult['usage'] }> {
        console.log("Creating document...");
        const { streamController } = state;
        let draft = "";
        let usage: LLMGenerationResult['usage'] = null;
        try {
            const summaryMessage = `Okay, based on the plan, I'll now generate the document content you requested.`;
            streamController.writePartialResult(summaryMessage);

            const finalPrompt = createDocumentPrompt(state);
            const generationResult = await this.modelRouter.generate(
                state.model, // Use model from state
                finalPrompt,
                state.query,
                true, // Streaming
                streamController,
                'partialResult'
            );
            draft = generationResult.output;
            usage = generationResult.usage;
        } catch (error) {
            console.error("Error in create document node:", error);
            streamController.writeSystemMessage("Failed to generate document\n");
            draft = "Error: Failed to generate document";
        }
        return { draft, usage };
    }

    // Modified to return draft and usage
    private async editDocumentNode(state: TAgentState): Promise<{ draft: string, usage: LLMGenerationResult['usage'] }> {
        console.log("Editing document...");
        const { streamController } = state;
        let draft = "";
        let usage: LLMGenerationResult['usage'] = null;
        try {
            const editFocus = state.customContexts.some(c => c.type === 'Selection') ? "the selection" : "the document";
            const summaryMessage = `Understood. I'll now apply the edits to ${editFocus} based on the plan.`;
            streamController.writePartialResult(summaryMessage);

            const finalPrompt = editDocumentPrompt(state);
            const generationResult = await this.modelRouter.generate(
                state.model, // Use model from state
                finalPrompt,
                state.query,
                true, // Streaming
                streamController,
                'partialResult'
            );
            draft = generationResult.output;
            usage = generationResult.usage;
        } catch (error) {
            console.error("Error in edit document node:", error);
            streamController.writeSystemMessage("Failed to edit document\n");
            draft = "Error: Failed to edit document";
        }
        return { draft, usage };
    }

    // Modified to return only usage (or null)
    private async finalizeActionNode(state: TAgentState): Promise<LLMGenerationResult['usage']> {
        const { draft, streamController, synthesizedIntent } = state;
        console.log(`FinalizeAction: Checking conditions. Intent: ${synthesizedIntent}, Draft starts with Error: ${draft?.startsWith("Error:")}`);
        
        const documentRegex = /<Document>[\s\S]*?<\/Document>/;
        const canSummarizeCreate = synthesizedIntent === 'create' && draft && !draft.startsWith("Error:") && documentRegex.test(draft);
        const canSummarizeEdit = synthesizedIntent === 'edit' && draft && !draft.startsWith("Error:");

        if (!canSummarizeCreate && !canSummarizeEdit) {
            console.log("FinalizeAction: Conditions not met for summary.");
            return null; 
        }

        let summaryPrompt: string | null = null;
        let summaryLog = "";

        if (canSummarizeCreate) {
            summaryPrompt = summarizeCreationPrompt(state);
            summaryLog = "Generating creation summary";
        } else { // Only remaining possibility is canSummarizeEdit
            summaryPrompt = summarizeEditPrompt(state);
            summaryLog = "Generating edit summary";
        }

        let usage: LLMGenerationResult['usage'] = null;

        if (summaryPrompt) {
            try {
                console.log(`FinalizeAction: ${summaryLog}. Prompt length: ${summaryPrompt.length}`);
                const generationResult = await this.modelRouter.generate(
                    state.model, // Use model from state
                    summaryPrompt,
                    summaryLog, // Context for generation
                    true,
                    streamController,
                    'partialResult' // Stream as part of the main result
                );
                usage = generationResult.usage;
                console.log("FinalizeAction: Summary generation call completed.");
            } catch (error) {
                console.error(`Error during ${summaryLog}:`, error);
                streamController.writeSystemMessage("Failed to generate final summary\n");
            }
        } else {
            // This case should technically be unreachable due to the checks above
            console.warn("FinalizeAction: Conditions met but no summary prompt generated.")
        }
        
        return usage; // Return usage or null
    }

    async execute(state: TAgentState): Promise<Partial<TAgentState>> {
        console.log(`--- Executing ${this.getName()} ---`);
        const { streamController } = state;
        let accumulatedTokens = state.accumulatedTokens; // Start with current tokens
        let actionResultState: Partial<TAgentState> = {}; // Holds draft + tokens from action
        let finalizeResultState: Partial<TAgentState> = {}; // Holds tokens from finalize
        let nodeNameForAction = ""; // Variable to hold the specific action node name
        
        try {
            const intent = state.synthesizedIntent;
            let actionUsage: LLMGenerationResult['usage'] = null;

            // --- 1. Perform Create or Edit Action --- 
            if (intent === "create") {
                nodeNameForAction = "createDocument"; // Set specific name
                const { draft, usage } = await this.createDocumentNode(state);
                actionResultState = { draft };
                actionUsage = usage;
            } else if (intent === "edit") {
                nodeNameForAction = "editDocument"; // Set specific name
                const { draft, usage } = await this.editDocumentNode(state);
                actionResultState = { draft };
                actionUsage = usage;
            } else {
                console.warn(`DocumentSpecificContainer executed with unexpected intent: ${intent}`);
                streamController.writeSystemMessage("Error: Unexpected state for document action.");
                actionResultState = { draft: "Error: Unexpected state" }; 
            }

            // Accumulate tokens from the main create/edit action using the specific name
            if (actionUsage && nodeNameForAction) { 
                accumulatedTokens = updateAccumulatedTokens(
                    accumulatedTokens,
                    nodeNameForAction, // Use specific node name
                    actionUsage
                );
                actionResultState.accumulatedTokens = accumulatedTokens; // Update state immediately
            }

            // --- 2. Finalize Action (Summarize) if successful --- 
            if (!actionResultState.draft?.startsWith("Error:")) {
                // Pass the state *including* the draft and updated tokens from the action
                const stateForFinalize = { ...state, ...actionResultState }; 
                const finalizeUsage = await this.finalizeActionNode(stateForFinalize);
                
                // Accumulate tokens from the finalization step under its own name
                if (finalizeUsage) {
                    accumulatedTokens = updateAccumulatedTokens(
                        accumulatedTokens,
                        "finalizeAction", // Use specific name for finalize step
                        finalizeUsage
                    );
                    finalizeResultState = { accumulatedTokens };
                }
            }
        } catch (error) {
             console.error(`Error during ${this.getName()} execution:`, error);
             streamController.writeSystemMessage("An internal error occurred during document processing.\n");
             // Ensure draft reflects error, keep accumulated tokens as they are
             actionResultState = { 
                 ...actionResultState, 
                 accumulatedTokens: accumulatedTokens, // Carry over tokens accumulated so far
                 draft: (actionResultState.draft || "") + "\nError during final processing."
             };
             finalizeResultState = {}; // Don't add finalize tokens if error occurred
        } finally {
            console.log(`Closing stream in ${this.getName()}.`);
            streamController.close();
        }

        // Merge results: Draft from action, tokens from finalize (which includes action tokens)
        return {
            ...actionResultState,
            ...finalizeResultState, // This will overwrite accumulatedTokens with the final version
        };
    }

    getName(): string {
        return this.name;
    }
} 