import { ModelRouter } from "../models";
import { createThinkingPrompt } from "../prompts"; // Assuming prompts.ts is in the parent directory
import { TAgentState } from "../schema";
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

        const thinkingContext = synthesizedIntent === 'create'
            ? "Generate detailed thinking for document creation"
            : "Generate detailed thinking for document edits";

        try {
            const thinkingPrompt = createThinkingPrompt(state);
            streamController.writeSystemMessage("Generating detailed plan...");
            await this.modelRouter.generate(
                "Open AI 4o", // Consider making model configurable
                thinkingPrompt,
                thinkingContext,
                true,
                streamController,
                'reasoning'
            );
            // No state change needed, just pass through after streaming reasoning
            return {}; 
        } catch (error) {
            console.error("Error in planning node:", error);
            streamController.writeSystemMessage("Failed to generate planning steps\n");
            // Allow workflow to continue, but log error.
            // We might add an error field to the state later if needed.
            return {}; 
        }
    }

    getName(): string {
        return this.name;
    }
} 