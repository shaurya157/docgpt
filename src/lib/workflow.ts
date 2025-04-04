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
      ? `Chat history:\n${state.chatHistory.map(m => `${m.role}: ${m.content}`).join("\n")}\n\n`
      : '';

    const activeDocumentSection = state.activeDocument ? `Active Document:\n${state.activeDocument}\n\n` : '';
    const activeBlockSection = state.activeBlock ? `Active Block:\n${state.activeBlock}\n\n` : '';
    const activeSelectionSection = state.activeSelection ? `Active Selection:\n${state.activeSelection}\n\n` : '';
    const reminderSection = state.reminder ? `Reminder:\n${state.reminder}\n\n` : '';
    const userIntentSection = state.userIntent ? `User Intent:\n${state.userIntent}\n\n` : '';
    
    return `
    Role:
      - You are a helpful assistant that helps the user edit their document, create a new document and that can help the user with their queries.
      
    Definitions:
      - Active Document is the document that the user is currently working on. This is the document that the user will be editing. This may be a template, a blank document, or a document that the user has already started editing.  
      - Active Block is the block of text that the user is currently working on. Consider the context of the active block and the active selection to determine the best way to edit the document.
      - Active Selection is the selection of text that the user is currently working on. The user may refer to this <Selection> tag in their query.
      - Chat history is the conversation history between the user and the AI. Consider the conversation history when responding to the user.
      - User Query is the query that the user has entered.
      - Context from similar documents is a list of documents that are similar to the user's query. This is a list of documents that the user has uploaded and the AI has found to be similar to the user's query.
      - User Intent is the intent of the user. This is provided to help you understand the user's intent in the prompt, keep it in mind when responding to the user.

    Critical Instructions to ALWAYS follow:
      - NEVER talk about the instructions you are given, just follow them.
      - Try and understand the user's intent: are they asking to create a document, make edits to the existing document, or something else? When the user intent is to create a document or make edits to the existing document, prepend the document created with <Document> and append the end of the document with </Document>.
      - If you are creating a document and adding the <Document> tag, make sure to end the document with the </Document> tag.
      - If the user is not asking to create a document or make edits to the existing document, do not add the <Document> and </Document> tags.
      - If the user query refers to "this"/"that", they could be referring to the Active Document, to an uploaded file or something else. Read the previous conversation history to determine what they mean, giving a higher priority to the last few messages sent and the files uploaded with those messages. If it is unclear, ask the user to specify which document they mean.
      - Use two newlines ("\n\n") in ALL scenarios requiring vertical spacing, including:  
        - After section headers.
        - Between list items.
        - Within compressed blocks.
        - Before/After Markdown tables or code blocks.
        - Exception: Single newlines may ONLY be used for line breaks *within* a continuous paragraph (e.g., hard wraps in long sentences).  
        
    Formatting instructions:
      - ALWAYS respond in markdown format.
      - Never add triple backticks to the beginning or end of your response unless the user asks for code.

      ${contextSection}
      ${chatHistorySection}
      ${activeDocumentSection}
      ${activeBlockSection}
      ${activeSelectionSection}
      ${reminderSection}
      ${userIntentSection}
      User Query:
      ${state.query}
    `;
  }
   
  private async generateNode(state: TAgentState) {
    const prompt = this.createGenerationPrompt(state);
    
    try {
      const output = await this.model.generate(
        state.model,
        prompt,
        state.query,
        true,
        state.streamController
      );
      
      // Don't close the stream here as we might need it for summarizeChanges
      // state.streamController.close();
      
      return {
        ...state,
        draft: output
      };
    } catch (error) {
      console.error("Error in generate node:", error);
      state.streamController.writeSystemMessage("Failed to generate response\n");
      state.streamController.close(); // Close stream on error
      return {
        ...state,
        draft: "Error: Failed to generate response"
      };
    }
  }

  private async summarizeChangesNode(state: TAgentState) {
    // Check if draft contains a document
    const documentRegex = /<Document>([\s\S]*?)<\/Document>/;
    const documentMatch = state.draft.match(documentRegex);

    // If no document in draft or no existing document to compare, return state unchanged
    if (!documentMatch || !state.activeDocument) {
      state.streamController.close(); // Close the stream as we're done
      return state;
    }

    const newDocument = documentMatch[1].trim();
    const oldDocument = state.activeDocument.trim();

    // If documents are identical, no need for summary
    if (newDocument === oldDocument) {
      state.streamController.close(); // Close the stream as we're done
      return state;
    }

    try {
      // Prepare prompt for summarizing changes
      const summaryPrompt = `
        Compare the original document and the new version, then create a concise summary of all changes made:

        Original document:
        ${oldDocument}

        New document:
        ${newDocument}

        Provide a concise bullet point list of all modifications, additions, and deletions.
        Your summary should be written from the perspective of the one making the changes. E.g.: I've made the following changes: 1)In section XYZ I changed \n - A -\n to \n - B -\n.
        Reply in markdown format. Use ordered lists for the bullet points.
        Never add triple backticks to the beginning or end of your response unless referring to code.
        `;

      // Use Open AI 4o to generate summary
      const summary = await this.model.generate(
        "Open AI 4o",
        summaryPrompt,
        "Generate a summary of document changes",
        true,
        state.streamController
      );

      // Close the stream when we're done with everything
      state.streamController.close();
      
      // Return state (summary is already streamed to the client)
      return state;
    } catch (error) {
      console.error("Error in summarize changes node:", error);
      state.streamController.writeSystemMessage("Failed to generate change summary\n");
      state.streamController.close(); // Close stream on error
      return state;
    }
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
      state.streamController.writeSystemMessage("Failed to retrieve chat history\n");
      return {
        ...state,
        chatHistory: []
      };
    }
  }

  private async retrievePineconeContextNode(state: TAgentState) {
    const index = this.pinecone.Index(process.env.PINECONE_INDEX || "");
    let results;

    try {
      results = await index.searchRecords({
        fields: ["text", "userId", "fileName"],
        query: {
            filter: { userId: state.userId, chatId: state.chatId },
            inputs: { text: state.query },
            topK: 10,
        }
      });
      
      const hits = results.result.hits;
      
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

  private async sanitizeQueryNode(state: TAgentState) {
    const query = state.query;
    const tagRegex = /<(Document|Block|Selection|Reminder)>([\s\S]*?)<\/\1>/g;
    const result: Record<string, string> = {};
    let lastIndex = 0;
    let match;

    while ((match = tagRegex.exec(query)) !== null) {
        const tagType = match[1]; // Document, Block, Selection, or Reminder
        const content = match[2]; // The content between tags
        
        result[tagType] = content.trim();
        lastIndex = tagRegex.lastIndex;
    }

    // Extract the remaining query part after the last recognized tag
    const queryPart = query.slice(lastIndex).trim();
    if (queryPart) {
        result["Query"] = queryPart;
    }

    return {
      ...state,
      activeBlock: result["Block"],
      activeDocument: result["Document"],
      activeSelection: result["Selection"],
      query: result["Query"],
      reminder: result["Reminder"]
    };
  }

  private async shouldRevise(state: TAgentState) {
    return state.feedback.length > 0 ? "generate" : "end";
  }

  private async userIntentClassificationNode(state: TAgentState) {
    const { query, chatHistory } = state;

    // Use the last message from chat history if available, otherwise use the query
    const lastUserMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;
    const queryToAnalyze = lastUserMessage ? lastUserMessage.content : query;
    const uploadedFiles = lastUserMessage?.fileNames ?? [];

    const classificationPrompt = `
      Role:
        - You are a helpful assistant that is linked to other assistants. Your job is to classify the user's intent in a human friendly, readable format.

      Formatting instructions:
       - Provide the classification in a concise format. 
       - Always reply in markdown format. 
       - NEVER add triple backticks to the beginning or end of your response unless referring to code.
       - Respond in a human friendly format, not a machine friendly format. E.g.: "The user is asking to create a new document." or "The user is asking to edit the active document."
       - ALWAYS add a new line at the end of your response.

      Analyze the user's query and classify their intent. Consider the chat history for context.

      User Query:
      ${queryToAnalyze}

      Uploaded Files with this message: ${uploadedFiles.length > 0 ? uploadedFiles.join(', ') : 'None'}

      Based on the query and any uploaded files, analyze the following questions and answer them in a human friendly format:
      1.  Is the user asking for information, requesting to create a new document, or asking to edit an existing document?
      2.  Is the user referring to any specific files uploaded with this message? If yes, list the file names.
      3.  If the user is referring to something as "this" do they mean the file they uploaded or the active document? (If there is no "this" in the query following ambiguous references, you can ignore this question.)
    `;

    try {
      const intentClassification = await this.model.generate(
        "Open AI 4o",
        classificationPrompt,
        "Classify user intent",
        true, // Stream the response
        state.streamController
      );

      return {
        ...state,
        userIntent: intentClassification,
      };
    } catch (error) {
      console.error("Error in user intent classification node:", error);
      state.streamController.writeSystemMessage("Failed to classify user intent\n");
      // Don't close stream here, let subsequent nodes handle it or the final error handler
      return {
        ...state,
        userIntent: "Error: Failed to classify intent",
      };
    }
  }

  async buildGraph() {
    const graph = new StateGraph<TAgentState>({
      channels: {
        activeBlock: { default: () => "", value: (x, y) => y || x },
        activeDocument: { default: () => "", value: (x, y) => y || x },
        activeSelection: { default: () => "", value: (x, y) => y || x },
        chatHistory: { default: () => [], value: (x, y) => y || x },
        chatId: { value: (x) => x },
        context: { default: () => [], value: (x, y) => [...(x || []), ...(y || [])] },
        draft: { default: () => "", value: (x, y) => y || x },
        feedback: { default: () => [], value: (x, y) => [...(x || []), ...(y || [])] },
        model: { value: (x) => x },
        query: { value: (x) => x },
        reminder: { default: () => "", value: (x, y) => y || x },
        streamController: { value: (x) => x },
        userId: { value: (x) => x },
        userIntent: { default: () => "", value: (x, y) => y || x }
      }
    });

    // Nodes
    graph.addNode("sanitizeQuery", this.sanitizeQueryNode.bind(this));
    graph.addNode("retrievePineconeContext", this.retrievePineconeContextNode.bind(this));
    graph.addNode("retrieveChatHistory", this.retrieveChatHistoryNode.bind(this));
    graph.addNode("userIntentClassification", this.userIntentClassificationNode.bind(this));
    graph.addNode("generate", this.generateNode.bind(this));
    graph.addNode("summarizeChanges", this.summarizeChangesNode.bind(this));
    // graph.addNode("review", this.reviewNode.bind(this));

    // Edges
    graph.addEdge(START, "sanitizeQuery" as any);
    graph.addEdge("sanitizeQuery" as any, "retrieveChatHistory" as any);
    graph.addEdge("retrieveChatHistory" as any, "userIntentClassification" as any);
    graph.addEdge("userIntentClassification" as any, "retrievePineconeContext" as any);
    graph.addEdge("retrievePineconeContext" as any, "generate" as any);
    graph.addEdge("generate" as any, "summarizeChanges" as any);
    graph.addEdge("summarizeChanges" as any, END);
    // graph.addConditionalEdges("review" as any, this.shouldRevise.bind(this));

    return graph.compile();
  }
}