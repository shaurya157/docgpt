import { END, START, StateGraph } from "@langchain/langgraph";
import { Pinecone } from "@pinecone-database/pinecone";

// Remove unused imports
// import { getChatHistory } from "./firebase-admin"; 
import { ModelRouter } from "./langgraph/models";
import { CommitUsageNode } from "./langgraph/nodes/commit_usage_node";
// import { getValidSlackToken } from "./slack-auth-helper";
import { DocumentSpecificContainer } from "./langgraph/nodes/document_specific_container";
import { GeneralContainer } from "./langgraph/nodes/general_container";
import { PlanningContainer } from "./langgraph/nodes/planning_container";
import { RAGContainer } from "./langgraph/nodes/rag_container";
// Import the containers and the commit node from the correct relative path
import { SanitizeInputContainer } from "./langgraph/nodes/sanitize_input_container";
// import { 
//   createDocumentPrompt, 
//   createThinkingPrompt, 
//   editDocumentPrompt, 
//   generalQueryPrompt, 
//   summarizeCreationPrompt,
//   summarizeEditPrompt
// } from "./langgraph/prompts";
import { TAgentState } from "./langgraph/schema";

export class DocumentWorkflow {
  private commitUsageNode = new CommitUsageNode();
  // Only instantiate routers/clients needed here
  private modelRouter = new ModelRouter();

  private documentSpecificContainer = new DocumentSpecificContainer(this.modelRouter);
  private generalContainer = new GeneralContainer(this.modelRouter);
  private pinecone = new Pinecone();
  private planningContainer = new PlanningContainer(this.modelRouter);
  private ragContainer = new RAGContainer(this.pinecone);
  // Instantiate containers and commit node
  private sanitizeInputContainer = new SanitizeInputContainer(this.modelRouter);

  // Routing logic
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

  async buildGraph() {
    const graph = new StateGraph<TAgentState>({
      channels: {
        // Ensure all state fields used by nodes are defined here
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

    // Add nodes using container instances
    graph.addNode(this.sanitizeInputContainer.getName(), this.sanitizeInputContainer.execute.bind(this.sanitizeInputContainer));
    graph.addNode(this.ragContainer.getName(), this.ragContainer.execute.bind(this.ragContainer));
    graph.addNode(this.generalContainer.getName(), this.generalContainer.execute.bind(this.generalContainer));
    graph.addNode(this.planningContainer.getName(), this.planningContainer.execute.bind(this.planningContainer));
    graph.addNode(this.documentSpecificContainer.getName(), this.documentSpecificContainer.execute.bind(this.documentSpecificContainer));
    graph.addNode(this.commitUsageNode.getName(), this.commitUsageNode.execute.bind(this.commitUsageNode)); 

    // Define workflow edges
    graph.addEdge(START, this.sanitizeInputContainer.getName() as any);
    graph.addEdge(this.sanitizeInputContainer.getName() as any, this.ragContainer.getName() as any);

    // Conditional routing after RAG
    graph.addConditionalEdges(
      this.ragContainer.getName() as any,
      this.routeToThinkingOrAction.bind(this),
      {
        [this.generalContainer.getName()]: this.generalContainer.getName() as any,
        [this.planningContainer.getName()]: this.planningContainer.getName() as any
      }
    );

    // Planning -> Document Specific
    graph.addEdge(this.planningContainer.getName() as any, this.documentSpecificContainer.getName() as any);

    // General Query -> Commit Usage
    graph.addEdge(this.generalContainer.getName() as any, this.commitUsageNode.getName() as any);
    
    // Document Specific -> Commit Usage
    graph.addEdge(this.documentSpecificContainer.getName() as any, this.commitUsageNode.getName() as any);

    // Commit Usage -> END
    graph.addEdge(this.commitUsageNode.getName() as any, END);

    return graph.compile();
  }

  // All old node methods (classifyIntentNode, createDocumentNode, etc.) are removed.
}