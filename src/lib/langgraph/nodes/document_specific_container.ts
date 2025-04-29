import { ModelRouter } from "../models";
import { 
    createDocumentPrompt, 
    editDocumentPrompt, 
    summarizeCreationPrompt, 
    summarizeEditPrompt 
} from "../prompts";
import { TAgentState } from "../schema";
import { IGraphNode } from "./base";

export class DocumentSpecificContainer implements IGraphNode {
    private modelRouter: ModelRouter;
    private name = "documentActionAndFinalize";

    constructor(modelRouter: ModelRouter) {
        this.modelRouter = modelRouter;
    }

    private async createDocumentNode(state: TAgentState): Promise<Partial<TAgentState>> {
        console.log("Creating document...");
        const { streamController } = state;
        try {
            const summaryMessage = `Okay, based on the plan, I'll now generate the document content you requested.`;
            streamController.writePartialResult(summaryMessage);

            const finalPrompt = createDocumentPrompt(state);
            const output = await this.modelRouter.generate(
                state.model, // Use model from state
                finalPrompt,
                state.query,
                true, // Streaming
                streamController,
                'partialResult'
            );
            return { draft: output };
        } catch (error) {
            console.error("Error in create document node:", error);
            streamController.writeSystemMessage("Failed to generate document\n");
            return { draft: "Error: Failed to generate document" };
        }
    }

    private async editDocumentNode(state: TAgentState): Promise<Partial<TAgentState>> {
        console.log("Editing document...");
        const { streamController } = state;
        try {
            const editFocus = state.customContexts.some(c => c.type === 'Selection') ? "the selection" : "the document";
            const summaryMessage = `Understood. I'll now apply the edits to ${editFocus} based on the plan.`;
            streamController.writePartialResult(summaryMessage);

            const finalPrompt = editDocumentPrompt(state);
            const output = await this.modelRouter.generate(
                state.model, // Use model from state
                finalPrompt,
                state.query,
                true, // Streaming
                streamController,
                'partialResult'
            );
            return { draft: output };
        } catch (error) {
            console.error("Error in edit document node:", error);
            streamController.writeSystemMessage("Failed to edit document\n");
            return { draft: "Error: Failed to edit document" };
        }
    }

    // --- Node Logic (moved from DocumentWorkflow) ---

    private async finalizeActionNode(state: TAgentState): Promise<Partial<TAgentState>> {
        const { draft, query, streamController, synthesizedIntent } = state;
        console.log(`FinalizeAction: Checking conditions. Intent: ${synthesizedIntent}, Draft starts with Error: ${draft?.startsWith("Error:")}`);
        
        const documentRegex = /<Document>[\s\S]*?<\/Document>/;
        const canSummarizeCreate = synthesizedIntent === 'create' && draft && !draft.startsWith("Error:") && documentRegex.test(draft);
        const canSummarizeEdit = synthesizedIntent === 'edit' && draft && !draft.startsWith("Error:");

        if (!canSummarizeCreate && !canSummarizeEdit) {
            console.log("FinalizeAction: Conditions not met for summary.");
            return {}; 
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

        if (summaryPrompt) {
            try {
                console.log(`FinalizeAction: ${summaryLog}. Prompt length: ${summaryPrompt.length}`);
                await this.modelRouter.generate(
                    state.model, // Use model from state
                    summaryPrompt,
                    summaryLog, // Context for generation
                    true,
                    streamController,
                    'partialResult' // Stream as part of the main result
                );
                console.log("FinalizeAction: Summary generation call completed.");
            } catch (error) {
                console.error(`Error during ${summaryLog}:`, error);
                streamController.writeSystemMessage("Failed to generate final summary\n");
            }
        } else {
            // This case should technically be unreachable due to the checks above
            console.warn("FinalizeAction: Conditions met but no summary prompt generated.")
        }
        
        return {}; // Finalize doesn't modify state, just streams the summary.
    }

    async execute(state: TAgentState): Promise<Partial<TAgentState>> {
        console.log(`--- Executing ${this.getName()} ---`);
        const { streamController } = state;
        let actionResult: Partial<TAgentState> = {};
        let finalizeResult: Partial<TAgentState> = {};
        
        try {
            const intent = state.synthesizedIntent;
            // --- 1. Perform Create or Edit Action --- 
            if (intent === "create") {
                actionResult = await this.createDocumentNode(state);
            } else if (intent === "edit") {
                actionResult = await this.editDocumentNode(state);
            } else {
                console.warn(`DocumentSpecificContainer executed with unexpected intent: ${intent}`);
                streamController.writeSystemMessage("Error: Unexpected state for document action.");
                actionResult = { draft: "Error: Unexpected state" }; // Set error state
            }

            // --- 2. Finalize Action (Summarize) if successful --- 
            // Only proceed if the action didn't result in an error draft
            if (!actionResult.draft?.startsWith("Error:")) {
                const stateAfterAction = { ...state, ...actionResult }; 
                finalizeResult = await this.finalizeActionNode(stateAfterAction);
            }
        } catch (error) {
             console.error(`Error during ${this.getName()} execution:`, error);
             streamController.writeSystemMessage("An internal error occurred during document processing.\n");
             actionResult = { ...actionResult, draft: actionResult.draft + "\nError during final processing." };
        } finally {
            // Ensure stream is closed after execution finishes or errors
            console.log(`Closing stream in ${this.getName()}.`);
            streamController.close();
        }

        // Merge results from action and finalization
        return {
            ...actionResult,
            ...finalizeResult, 
        };
    }

    getName(): string {
        return this.name;
    }
} 