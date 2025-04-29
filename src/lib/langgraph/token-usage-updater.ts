import { TAccumulatedTokenNodeUsage } from "./schema";

interface LLMUsageInfo {
    inputTokens: number;
    modelName: string;
    outputTokens: number;
}

/**
 * Updates the accumulated token usage array within the agent state.
 * This function modifies the array directly for efficiency within node execution.
 * 
 * @param currentAccumulatedTokens The current accumulatedTokens array from the state.
 * @param nodeName The name of the node making the LLM call.
 * @param usageInfo The usage details returned by the LLM call.
 * @returns The updated accumulatedTokens array.
 */
export function updateAccumulatedTokens(
    currentAccumulatedTokens: TAccumulatedTokenNodeUsage[], 
    nodeName: string, 
    usageInfo: LLMUsageInfo
): TAccumulatedTokenNodeUsage[] {
    
    // Clone the array to avoid modifying the original state directly if passed by reference elsewhere unexpectedly
    // Although LangGraph state updates should handle this, defensive cloning is safer.
    const updatedTokens = currentAccumulatedTokens ? JSON.parse(JSON.stringify(currentAccumulatedTokens)) : [];

    let nodeEntry = updatedTokens.find((entry: TAccumulatedTokenNodeUsage) => entry.node === nodeName);

    if (!nodeEntry) {
        // Node entry doesn't exist, create it
        nodeEntry = {
            models: [
                {
                    inputTokens: usageInfo.inputTokens,
                    model: usageInfo.modelName,
                    outputTokens: usageInfo.outputTokens,
                }
            ],
            node: nodeName
        };
        updatedTokens.push(nodeEntry);
    } else {
        // Node entry exists, find the model entry
        const modelEntry = nodeEntry.models.find((model: any) => model.model === usageInfo.modelName);

        if (!modelEntry) {
            // Model entry doesn't exist, add it
            nodeEntry.models.push({
                inputTokens: usageInfo.inputTokens,
                model: usageInfo.modelName,
                outputTokens: usageInfo.outputTokens,
            });
        } else {
            // Model entry exists, increment tokens
            modelEntry.inputTokens += usageInfo.inputTokens;
            modelEntry.outputTokens += usageInfo.outputTokens;
        }
    }

    return updatedTokens;
} 