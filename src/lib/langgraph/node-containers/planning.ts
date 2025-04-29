import { ModelRouter } from "../models";
import { createThinkingPrompt } from "../prompts"; // Assuming prompts.ts is in the parent directory
import { TAgentState } from "../schema";
import { updateAccumulatedTokens } from "../token-usage-updater"; // Import helper
import { IGraphNode } from "./base";

export class PlanningContainer implements IGraphNode {
    private modelRouter: ModelRouter;
    private name = "planning"; // Changed from thinkingNode for clarity

    constructor(modelRouter: ModelRouter) {
        this.modelRouter = modelRouter;
    }

    async execute(state: TAgentState): Promise<Partial<TAgentState>> {
        console.log(`--- Executing ${this.getName()} ---`);
        const { streamController, synthesizedIntent } = state;
        let updatedState: Partial<TAgentState> = {};

        const thinkingContext = synthesizedIntent === 'create'
            ? "Generate detailed thinking for document creation"
            : "Generate detailed thinking for document edits";

        try {
            const thinkingPrompt = createThinkingPrompt(state);
            streamController.writeSystemMessage("Generating detailed plan...");
            
            const generationResult = await this.modelRouter.generate(
                "Open AI 4o", // Consider making model configurable
                thinkingPrompt,
                thinkingContext,
                true, // Streaming
                streamController,
                'reasoning'
            );

            // Update accumulated tokens if usage info is available
            if (generationResult.usage) {
                const accumulatedTokens = updateAccumulatedTokens(
                    state.accumulatedTokens,
                    this.getName(),
                    generationResult.usage
                );
                updatedState = { accumulatedTokens };
            }

        } catch (error) {
            console.error("Error in planning node:", error);
            streamController.writeSystemMessage("Failed to generate planning steps\n");
            // Don't update tokens on error
        }
        // Return the updated token state (or empty object if error/no usage)
        return updatedState; 
    }

    getName(): string {
        return this.name;
    }
} 