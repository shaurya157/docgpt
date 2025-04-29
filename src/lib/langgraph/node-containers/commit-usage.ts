import { commitTokenUsage } from "../../firebase-admin"; // Adjust path if needed
import { TAgentState } from "../schema";
import { IGraphNode } from "./base";

export class CommitUsageNode implements IGraphNode {
    private name = "commitUsage";

    async execute(state: TAgentState): Promise<Partial<TAgentState>> {
        console.log(`--- Executing ${this.getName()} ---`);
        const { accumulatedTokens, chatId } = state;

        if (accumulatedTokens && accumulatedTokens.length > 0) {
            try {
                // Call the Firestore function to commit the accumulated tokens
                await commitTokenUsage(chatId, accumulatedTokens);
            } catch (error) {
                // Log error, but don't necessarily stop the workflow from ending
                console.error("Error during token usage commit:", error);
            }
        } else {
            console.log("No accumulated tokens to commit.");
        }

        // This node doesn't modify the state further, just performs a side effect.
        // We clear the accumulated tokens just in case the state object is reused (though unlikely in typical LangGraph runs)
        return { accumulatedTokens: [] }; 
    }

    getName(): string {
        return this.name;
    }
} 