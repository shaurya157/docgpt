import { TAgentState } from "../schema";

/**
 * Represents a node or a container of nodes in the workflow graph.
 */
export interface IGraphNode {
    /**
     * Executes the node's or container's logic.
     * @param state The current agent state.
     * @returns A promise resolving to a partial state update.
     */
    execute(state: TAgentState): Promise<Partial<TAgentState>>;

    /**
     * Gets the unique name of the node/container for graph identification.
     */
    getName(): string;
} 