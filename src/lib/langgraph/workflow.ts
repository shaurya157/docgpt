import { END, START, StateGraph } from "@langchain/langgraph";
import { Pinecone } from "@pinecone-database/pinecone";

import { ModelRouter } from "./models";
import { CommitUsageNode } from "./node-containers/commit-usage";
import { DocumentSpecificContainer } from "./node-containers/document-modifications";
import { GeneralContainer } from "./node-containers/general";
import { PlanningContainer } from "./node-containers/planning";
import { RAGContainer } from "./node-containers/rag";
// Import the new containers
import { SanitizeInputContainer } from "./node-containers/sanitize-input";
import { TAgentState } from "./schema";

export class DocumentWorkflow {
  private commitUsageNode = new CommitUsageNode();
  private modelRouter = new ModelRouter();

  private documentSpecificContainer = new DocumentSpecificContainer(this.modelRouter);
  private generalContainer = new GeneralContainer(this.modelRouter);
  private pinecone = new Pinecone();
  private planningContainer = new PlanningContainer(this.modelRouter);
  private ragContainer = new RAGContainer(this.pinecone);
  // Instantiate containers
  private sanitizeInputContainer = new SanitizeInputContainer(this.modelRouter);

  // Keep the routing logic (Strategy Pattern part)
  private routeToThinkingOrAction(state: TAgentState): string {
      const intent = state.synthesizedIntent;
      if (intent === "create" || intent === "edit") {
          console.log("Routing to planning container.");
          return this.planningContainer.getName();
      } else {
          console.log("Routing directly to general query container. Intent:", intent);
          return this.generalContainer.getName();
      }
  }

  // This router is now effectively handled *inside* DocumentSpecificContainer
  // but we keep the conditional edge logic in buildGraph targeting the container.
  // private routeIntentToAction(state: TAgentState): "createDocument" | "editDocument" { ... }

  async buildGraph() {
    const graph = new StateGraph<TAgentState>({
      channels: {
        accumulatedTokens: { default: () => [], value: (x, y) => y || x }, 
        activeDocument: { default: () => "", value: (x, y) => y ?? x },
        chatHistory: { default: () => [], value: (x, y) => y || x },
        chatId: { value: (x) => x },
        context: { default: () => [], value: (x, y) => y || x },
        customContexts: { default: () => [], value: (x, y) => y || x },
        draft: { default: () => "", value: (x, y) => y || x },
        feedback: { default: () => [], value: (x, y) => [...(x || []), ...(y || [])] },
        model: { value: (x) => x },
        query: { value: (x, y) => y ?? x },
        slackMessages: { default: () => [], value: (x, y) => y ?? x },
        streamController: { value: (x) => x },
        synthesizedIntent: { default: () => undefined, value: (x, y) => y || x },
        userId: { value: (x) => x },
      }
    });

    // Add nodes using the container instances
    graph.addNode(this.sanitizeInputContainer.getName(), this.sanitizeInputContainer.execute.bind(this.sanitizeInputContainer));
    graph.addNode(this.ragContainer.getName(), this.ragContainer.execute.bind(this.ragContainer));
    graph.addNode(this.generalContainer.getName(), this.generalContainer.execute.bind(this.generalContainer));
    graph.addNode(this.planningContainer.getName(), this.planningContainer.execute.bind(this.planningContainer));
    graph.addNode(this.documentSpecificContainer.getName(), this.documentSpecificContainer.execute.bind(this.documentSpecificContainer));
    graph.addNode(this.commitUsageNode.getName(), this.commitUsageNode.execute.bind(this.commitUsageNode));

    // Define the workflow edges connecting the containers
    graph.addEdge(START, this.sanitizeInputContainer.getName() as any);
    graph.addEdge(this.sanitizeInputContainer.getName() as any, this.ragContainer.getName() as any);

    // Conditional routing after RAG: Go to General or Planning
    graph.addConditionalEdges(
      this.ragContainer.getName() as any,
      this.routeToThinkingOrAction.bind(this),
      {
        [this.generalContainer.getName()]: this.generalContainer.getName() as any,
        [this.planningContainer.getName()]: this.planningContainer.getName() as any
      }
    );

    // After Planning, go to Document Specific actions
    graph.addEdge(this.planningContainer.getName() as any, this.documentSpecificContainer.getName() as any);

    // General Query goes directly to Commit Usage
    graph.addEdge(this.generalContainer.getName() as any, this.commitUsageNode.getName() as any);
    
    // Document Specific Actions container goes to Commit Usage
    graph.addEdge(this.documentSpecificContainer.getName() as any, this.commitUsageNode.getName() as any);

    // Commit Usage goes to END
    graph.addEdge(this.commitUsageNode.getName() as any, END);

    return graph.compile();
  }
}

// --- Removed Node Methods ---
// private async classifyIntentNode(...) { ... }
// private async createDocumentNode(...) { ... }
// private async editDocumentNode(...) { ... }
// private async finalizeActionNode(...) { ... }
// private async generalQueryNode(...) { ... }
// private async retrieveChatHistoryNode(...) { ... }
// private async retrievePineconeContextNode(...) { ... }
// private async retrieveSlackMessagesNode(...) { ... }
// private async sanitizeQueryNode(...) { ... }
// private async thinkingNode(...) { ... }
// private routeIntentToAction(...) { ... } 