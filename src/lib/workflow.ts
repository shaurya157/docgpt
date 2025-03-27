import { END, START, StateGraph } from "@langchain/langgraph";
import { Pinecone } from "@pinecone-database/pinecone";

import { getChatHistory } from "./firebase-admin";
import { ModelRouter } from "./models";
import { TAgentState } from "./schema";
import { CustomStreamController } from "@/utils/custom-stream";

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

    const activeDocumentSection = state.activeDocument ? `Active Document:\n${state.activeDocument}\n\n` : '';
    const activeBlockSection = state.activeBlock ? `Active Block:\n${state.activeBlock}\n\n` : '';
    const activeSelectionSection = state.activeSelection ? `Active Selection:\n${state.activeSelection}\n\n` : '';
    const reminderSection = state.reminder ? `Reminder:\n${state.reminder}\n\n` : '';
      
    return `
    Definitions:
      - Active Document is the document that the user is currently working on. This is the document that the user will be editing. This may be a template, a blank document, or a document that the user has already started editing.  
      - Active Block is the block of text that the user is currently working on. Consider the context of the active block and the active selection to determine the best way to edit the document.
      - Active Selection is the selection of text that the user is currently working on. The user may refer to this <Selection> tag in their query.
      - Previous Conversation is the conversation history between the user and the AI. Consider the conversation history when responding to the user.
      - User Query is the query that the user has entered.
      - Context from similar documents is a list of documents that are similar to the user's query. This is a list of documents that the user has uploaded and the AI has found to be similar to the user's query.

    Critical Instructions to ALWAYS follow:
      - Try and understand the user's intent: are they asking to create a document, make edits to the existing document, or something else? When the user intent is to create a document or make edits to the existing document, prepend the document created with <Document> and append the end of the document with </Document>.
      - If you are creating a document and adding the <Document> tag, make sure to end the document with the </Document> tag.
      - If the user query refers to "this"/"that", they could be referring to the Active Document, to an uploaded file or something else. Read the previous conversation history to determine what they mean, giving a higher priority to the last few messages sent and the files uploaded with those messages. If it is unclear, ask the user to specify which document they mean.
      - Always respond in markdown format.
      - Never add triple backticks to the beginning or end of your response unless the user asks for code.


      ${contextSection}
      ${chatHistorySection}
      ${activeDocumentSection}
      ${activeBlockSection}
      ${activeSelectionSection}
      ${reminderSection}

      User Query:
      ${state.query}
    `;
  }
   
  private async sanitizeQueryNode(state: TAgentState) {
    state.streamController.writeSystemMessage("Processing query...\n");
    const query = state.query;
    const tagRegex = /<(Document|Block|Selection|Reminder)>([\s\S]*?)<\/\1>/g;
    const result: Record<string, string> = {};
    let lastIndex = 0;
    let match;

    while ((match = tagRegex.exec(query)) !== null) {
        const [tagName, content] = match;
        result[tagName] = content.trim();
        lastIndex = tagRegex.lastIndex;
    }

    // Extract the remaining query part after the last recognized tag
    const queryPart = query.slice(lastIndex).trim();
    if (queryPart) {
        result["Query"] = queryPart;
    }

    state.streamController.writeReasoning("Query processed and sanitized\n", "sanitizer");
    return {
      ...state,
      query: result["Query"],
      reminder: result["Reminder"],
      activeDocument: result["Document"],
      activeBlock: result["Block"],
      activeSelection: result["Selection"]
    };
  }

  private async generateNode(state: TAgentState) {
    state.streamController.writeReasoning("Generating response...\n", "generator");
    const prompt = this.createGenerationPrompt(state);
    
    try {
      const output = await this.model.generate(
        state.model,
        prompt,
        state.query,
        true,
        state.streamController
      );
      
      // Close the stream after generation is complete
      state.streamController.close();
      
      return {
        ...state,
        draft: output
      };
    } catch (error) {
      console.error("Error in generate node:", error);
      state.streamController.writeSystemMessage("Failed to generate response\n");
      state.streamController.close(); // Close stream on error too
      return {
        ...state,
        draft: "Error: Failed to generate response"
      };
    }
  }

  private async retrieveChatHistoryNode(state: TAgentState) {
    state.streamController.writeSystemMessage("Retrieving chat history...\n");
    try {
      const messages = await getChatHistory(state.chatId);
      state.streamController.writeReasoning(`Found ${messages.length} previous messages\n`, "chat-history");
      return {
        ...state,
        chatHistory: messages
      };
    } catch (error) {
      console.error("Error retrieving chat history:", error);
      state.streamController.writeSystemMessage("Failed to retrieve chat history\n");
      return {
        ...state,
        chatHistory: []
      };
    }
  }

  private async retrievePineconeContextNode(state: TAgentState) {
    state.streamController.writeSystemMessage("Searching for relevant context from uploaded documents...\n");
    const index = this.pinecone.Index(process.env.PINECONE_INDEX || "");
    let results;

    try {
      results = await index.searchRecords({
        fields: ["text", "userId", "fileName"],
        query: {
            filter: { userId: state.userId },
            inputs: { text: state.query },
            topK: 10,
        }
      });
      
      const hits = results.result.hits;
      state.streamController.writeReasoning(
        `Found ${hits.length} relevant documents. ${hits.map(h => h.fields["fileName"]).join(", ")}\n`,
        "context-retrieval"
      );
      
      return {
        ...state,
        context: hits.map(m => ({
          content: m.fields["text"],
          score: m._score
        }))
      };
    } catch (error) {
      console.error("Error retrieving context:", error);
      state.streamController.writeSystemMessage("Failed to retrieve context\n");
      return {
        ...state,
        context: []
      };
    }
  }

  private async reviewNode(state: TAgentState) {
    const reviewPrompt = `Review this document draft: ${state.draft}\n`;
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
        userId: { value: (x) => x },
        activeDocument: { default: () => "", value: (x, y) => y || x },
        activeBlock: { default: () => "", value: (x, y) => y || x },
        activeSelection: { default: () => "", value: (x, y) => y || x },
        reminder: { default: () => "", value: (x, y) => y || x },
        streamController: { value: (x) => x }
      }
    });

    // Nodes
    graph.addNode("sanitizeQuery", this.sanitizeQueryNode.bind(this));
    graph.addNode("retrievePineconeContext", this.retrievePineconeContextNode.bind(this));
    graph.addNode("retrieveChatHistory", this.retrieveChatHistoryNode.bind(this));
    graph.addNode("generate", this.generateNode.bind(this));
    // graph.addNode("review", this.reviewNode.bind(this));

    // Edges
    graph.addEdge(START, "sanitizeQuery" as any);
    graph.addEdge("sanitizeQuery" as any, "retrievePineconeContext" as any);
    graph.addEdge("retrievePineconeContext" as any, "retrieveChatHistory" as any);
    graph.addEdge("retrieveChatHistory" as any, "generate" as any);
    graph.addEdge("generate" as any, END);
    // graph.addConditionalEdges("review" as any, this.shouldRevise.bind(this));

    return graph.compile();
  }
}