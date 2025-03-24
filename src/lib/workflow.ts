import { END, START, StateGraph } from "@langchain/langgraph";
import { Pinecone } from "@pinecone-database/pinecone";

import { getChatHistory } from "./firebase-admin";
import { ModelRouter } from "./models";
import { TAgentState } from "./schema";

export class DocumentWorkflow {
  private model = new ModelRouter();
  private pinecone = new Pinecone();

  private createGenerationPrompt(state: TAgentState) {
    const contextSection = state.context.length > 0 
      ? `Context from similar documents:\n${state.context.map(c => `- ${c.content}`).join("\n")}\n\n`
      : '';

    const chatHistorySection = state.chatHistory.length > 0
      ? `Previous conversation:\n${state.chatHistory.map(m => `${m.role}: ${m.content}`).join("\n")}\n\n`
      : '';
    return `
      ${contextSection}
      ${chatHistorySection}
      User Query:
      ${state.query}

      Rules:
      - Always respond in markdown format.
      - Never add triple backticks to the beginning or end of your response unless the user asks for code.
      - When the user specifically asks to create a document or make edits to the existing document, prepend the document created with <Document> and append the end of the document with </Document>.
    `;
  }

  private async generateNode(state: TAgentState) {
    const prompt = this.createGenerationPrompt(state);
    const output = await this.model.generate(state.model, prompt, state.query, true)
    return {
      ...state,
      draft: output
    };
  }

  private async retrieveChatHistoryNode(state: TAgentState) {
    try {
      const messages = await getChatHistory(state.chatId);
      return {
        ...state,
        chatHistory: messages
      };
    } catch (error) {
      console.error("Error retrieving chat history:", error);
      return {
        ...state,
        chatHistory: []
      };
    }
  }

  private async retrieveNode(state: TAgentState) {
    const index = this.pinecone.Index(process.env.PINECONE_INDEX || "");
    let results;

    try {
      results = await index.searchRecords({
          fields: ["text", "userId", "fileName"],
        query: {
              filter: { userId: state.userId },
            inputs: { text: state.query },
            topK: 2,
        }
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

  async buildGraph() {
    const graph = new StateGraph<TAgentState>({
      channels: {
        chatHistory: { default: () => [], value: (x, y) => y || x },
        chatId: { value: (x) => x },
        context: { default: () => [], value: (x, y) => [...(x || []), ...(y || [])] },
        draft: { default: () => "", value: (x, y) => y || x },
        feedback: { default: () => [], value: (x, y) => [...(x || []), ...(y || [])] },
        model: { value: (x) => x },
        query: { value: (x) => x },
        userId: { value: (x) => x }
      }
    });

    // Nodes
    graph.addNode("retrieve", this.retrieveNode.bind(this));
    graph.addNode("retrieveChatHistory", this.retrieveChatHistoryNode.bind(this));
    graph.addNode("generate", this.generateNode.bind(this));
    // graph.addNode("review", this.reviewNode.bind(this));

    // Edges
    graph.addEdge(START, "retrieve" as any);
    graph.addEdge("retrieve" as any, "retrieveChatHistory" as any);
    graph.addEdge("retrieveChatHistory" as any, "generate" as any);
    graph.addEdge("generate" as any, END);
    // graph.addConditionalEdges("review" as any, this.shouldRevise.bind(this));

    return graph.compile();
  }
}