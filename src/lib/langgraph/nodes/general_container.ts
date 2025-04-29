import { ModelRouter } from "../models";
import { generalQueryPrompt } from "../prompts";
import { TAgentState } from "../schema";
import { IGraphNode } from "./base";
import { updateAccumulatedTokens } from "./token_usage_updater"; // Import helper

export class GeneralContainer implements IGraphNode {
    private modelRouter: ModelRouter;
    private name = "generalQuery";

    constructor(modelRouter: ModelRouter) {
        this.modelRouter = modelRouter;
    }

    async execute(state: TAgentState): Promise<Partial<TAgentState>> {
        console.log(`--- Executing ${this.getName()} ---`);
        const { streamController } = state;
        let resultState: Partial<TAgentState> = {};

        try {
            const finalPrompt = generalQueryPrompt(state);
            const generationResult = await this.modelRouter.generate(
                state.model, // Use model specified in state
                finalPrompt,
                state.query,
                true, // Streaming
                streamController,
                'partialResult'
            );
            
            // Start with draft clearing
            resultState = { draft: "" }; 

            // Update accumulated tokens if usage info is available
            if (generationResult.usage) {
                const accumulatedTokens = updateAccumulatedTokens(
                    state.accumulatedTokens,
                    this.getName(),
                    generationResult.usage
                );
                 // Merge token updates into resultState
                resultState = { ...resultState, accumulatedTokens };
            }

        } catch (error) {
            console.error("Error in general query node:", error);
            streamController.writeSystemMessage("Failed to answer query\n");
            resultState = { draft: "Error: Failed to answer query" };
             // Don't update tokens on error
        } finally {
            console.log(`Closing stream in ${this.getName()}.`);
            streamController.close();
        }
        return resultState;
    }

    getName(): string {
        return this.name;
    }
} 