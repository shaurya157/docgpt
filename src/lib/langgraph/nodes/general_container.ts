import { ModelRouter } from "../models";
import { generalQueryPrompt } from "../prompts";
import { TAgentState } from "../schema";
import { IGraphNode } from "./base";

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
            await this.modelRouter.generate(
                state.model, // Use model specified in state
                finalPrompt,
                state.query,
                true, // Streaming
                streamController,
                'partialResult'
            );
            resultState = { draft: "" }; // Clear draft after general query
        } catch (error) {
            console.error("Error in general query node:", error);
            streamController.writeSystemMessage("Failed to answer query\n");
            resultState = { draft: "Error: Failed to answer query" };
        } finally {
            // Ensure stream is closed after execution finishes or errors
            console.log(`Closing stream in ${this.getName()}.`);
            streamController.close();
        }
        return resultState;
    }

    getName(): string {
        return this.name;
    }
} 