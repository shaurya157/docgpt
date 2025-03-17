import { START, END, StateGraph } from "@langchain/langgraph";
import { TAgentState } from "./schema";
import { ModelRouter } from "./models";
import { Pinecone } from "@pinecone-database/pinecone";

export class DocumentWorkflow {
  private model = new ModelRouter();
  private pinecone = new Pinecone();

  async buildGraph() {
    console.log("Building graph");
    const graph = new StateGraph<TAgentState>({
      channels: {
        userId: { value: (x) => x },
        chatId: { value: (x) => x },
        query: { value: (x) => x },
        context: { value: (x, y) => [...(x || []), ...(y || [])], default: () => [] },
        draft: { value: (x, y) => y || x, default: () => "" },
        feedback: { value: (x, y) => [...(x || []), ...(y || [])], default: () => [] }
      }
    });

    // Nodes
    graph.addNode("retrieve", this.retrieveNode.bind(this));
    graph.addNode("generate", this.generateNode.bind(this));
    // graph.addNode("review", this.reviewNode.bind(this));

    // Edges
    graph.addEdge(START, "retrieve" as any);
    graph.addEdge("retrieve" as any, "generate" as any);
    graph.addEdge("generate" as any, END);
    // graph.addConditionalEdges("review" as any, this.shouldRevise.bind(this));

    return graph.compile();
  }

  private async retrieveNode(state: TAgentState) {
    const index = this.pinecone.Index(process.env.PINECONE_INDEX || "");
    let results;

    try {
      results = await index.searchRecords({
          query: {
              topK: 2,
            inputs: { text: state.query },
            filter: { userId: state.userId },
        },
        fields: ["text", "userId", "fileName"]
      })
    } catch (error) {
      console.error("Error retrieving context:", error);
      return {
        ...state,
        context: []
      };
    }
    
    return {
      ...state,
      context: results.result.hits.map(m => ({
        content: m.fields["text"],
        score: m._score
      }))
    };
  }

  private async generateNode(state: TAgentState) {
    const prompt = this.createGenerationPrompt(state);
    const output = await this.model.generate("openai", prompt, state.query, true)
    return {
      ...state,
      draft: output
    };
  }

  private async reviewNode(state: TAgentState) {
    const reviewPrompt = `Review this document draft: ${state.draft}`;
    return {
      ...state,
      feedback: await this.model.generate("openai", reviewPrompt, "")
    };
  }

  private async shouldRevise(state: TAgentState) {
    return state.feedback.length > 0 ? "generate" : "end";
  }

  private createGenerationPrompt(state: TAgentState) {
    return `
      Context:
      ${state.context.map(c => `- ${c.content}`).join("\n")}

      User Query:
      ${state.query}

      Rules:
      - Always respond in markdown format.
      - When the user specifically asks to create a document or make edits to the existing document, prepend the document created with <Document> and append the end of the document with </Document>.
    `;
  }
}