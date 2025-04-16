import { END, START, StateGraph } from "@langchain/langgraph";
import { Pinecone } from "@pinecone-database/pinecone";

import { getChatHistory } from "./firebase-admin";
import { ModelRouter } from "./models";
import { createDocumentPrompt, editDocumentPrompt, generalQueryPrompt } from "./prompts";
import { TAgentState } from "./schema";

export class DocumentWorkflow {
  private model = new ModelRouter();
  private pinecone = new Pinecone();

  private async createDocumentNode(state: TAgentState) {
    console.log("Executing createDocumentNode...");
    let documentTitle: string | undefined = undefined;

    // --- Generate Document Title ---
    try {
      const titlePrompt = `Based on the following user query, generate a concise and descriptive document title (max 5-7 words). Respond ONLY with the title itself, no extra text or quotes.

User Query:
---
${state.query}
---

Document Title:`;

      console.log("Generating document title...");
      documentTitle = await this.model.generate(
        "Open AI 4o", // Use a capable model for title generation
        titlePrompt,
        "Generate document title",
        false // Non-streaming for a single title output
      );
      documentTitle = documentTitle.trim(); // Clean up potential whitespace
      console.log("Generated document title:", documentTitle);
    } catch (titleError) {
      console.error("Error generating document title:", titleError);
      // Proceed without a title if generation fails, don't block document creation
    }
    // --- End Generate Document Title ---

    const prompt = createDocumentPrompt(state);
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
        documentTitle: documentTitle, // Add the generated title to the state
        draft: output
      };
    } catch (error) {
      console.error("Error in create document node:", error);
      state.streamController.writeSystemMessage("Failed to generate document\n");
      state.streamController.close(); // Close stream on error
      return {
        ...state,
        documentTitle: documentTitle, // Also include title in error state if generated
        draft: "Error: Failed to generate document"
      };
    }
  }

  private async editDocumentNode(state: TAgentState) {
    console.log("Executing editDocumentNode...");
    // console.log("Editing document"); // Removing original log
    const prompt = editDocumentPrompt(state);
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
      console.error("Error in edit document node:", error);
      state.streamController.writeSystemMessage("Failed to edit document\n");
      state.streamController.close(); // Close stream on error
      return {
        ...state,
        draft: "Error: Failed to edit document"
      };
    }
  }

  // New node for handling general queries
  private async generalQueryNode(state: TAgentState) {
    console.log("Executing generalQueryNode...");
    const prompt = generalQueryPrompt(state);
    try {
      // Generate and stream the response directly
      await this.model.generate(
        state.model,
        prompt,
        state.query,
        true,
        state.streamController
      );

      // Close the stream as this node is terminal for this branch
      state.streamController.close();

      // Return the state, draft is not relevant here as output is streamed
      return { ...state, draft: "" }; // Clear draft potentially set by previous nodes
    } catch (error) {
      console.error("Error in general query node:", error);
      state.streamController.writeSystemMessage("Failed to answer query\\n");
      state.streamController.close(); // Close stream on error
      return {
        ...state,
        draft: "Error: Failed to answer query"
      };
    }
  }

  private async formatDocumentNode(state: TAgentState) {
    console.log("Executing formatDocumentNode...");
    const { draft, streamController } = state;

    // Check if draft contains a document
    const documentRegex = /<Document>([\s\S]*?)<\/Document>/;
    const documentMatch = draft.match(documentRegex);

    // If no document in draft, pass through
    if (!documentMatch) {
      console.log("[formatDocumentNode] Skipping: No document found in draft.");
      return state;
    }

    const originalContent = documentMatch[1].trim();

    // Avoid re-formatting if content is minimal or likely already formatted
    if (originalContent.length < 50 || originalContent.includes('\n##')) {
      console.log("[formatDocumentNode] Skipping: Content seems minimal or already formatted.");
      return state;
    }

    streamController.writeSystemMessage("Formatting document...\n");

    const formatPrompt = `
      Format the document below to make it more readable, using markdown and headers where applicable.
      Respond ONLY with the formatted Markdown content. Do not include any explanations or introductory text.

      Original Content:
      ---
      ${originalContent}
      ---

      Formatted Content:
    `;

    try {
      // Use a capable model for formatting, non-streaming as we need the full result
      const formattedContent = await this.model.generate(
        "Open AI 4o", // Or another suitable model
        formatPrompt,
        "Format document content",
        false // We need the complete formatted content back
        // No streamController needed here
      );

      const finalDraft = `<Document>\n${formattedContent.trim()}\n</Document>`;

      console.log("[formatDocumentNode] Successfully applied formatting.");
      return {
        ...state,
        draft: finalDraft
      };

    } catch (error) {
      console.error("[formatDocumentNode] Error during formatting:", error);
      streamController.writeSystemMessage("Failed to format document. Using original content.\n");
      // Return original state on error, allowing workflow to continue
      console.log("[formatDocumentNode] Failed: Error occurred during formatting attempt.");
      return state;
    }
  }

  private async retrieveChatHistoryNode(state: TAgentState) {
    console.log("Executing retrieveChatHistoryNode...");
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
    console.log("Executing retrievePineconeContextNode...");
    const index = this.pinecone.Index(process.env.PINECONE_INDEX || "");
    let results;

    try {
      results = await index.searchRecords({
        fields: ["text", "userId", "fileName"],
        query: {
            filter: { chatId: state.chatId, userId: state.userId },
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

  // Function to decide the next step based on synthesized intent
  private routeIntent(state: TAgentState): "createDocument" | "editDocument" | "generalQuery" {
    const intent = state.synthesizedIntent;
    if (intent === "create") {
      return "createDocument";
    } else if (intent === "edit") {
      return "editDocument";
    } else {
      // Default to generalQuery if intent is missing or 'general'
      console.log("Routing to general query node. Intent:", intent);
      return "generalQuery";
    }
  }

  private async sanitizeQueryNode(state: TAgentState) {
    console.log("Executing sanitizeQueryNode...");
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
      activeDocument: result["Document"],
      query: result["Query"],
    };
  }

  private async summarizeChangesNode(state: TAgentState) {
    console.log("Executing summarizeChangesNode...");
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

  private async synthesizeIntentNode(state: TAgentState): Promise<Partial<TAgentState>> {
    console.log("Executing synthesizeIntentNode...");
    const { streamController, userIntent } = state;

    // Default to 'general' if intent is missing or indicates an error
    if (!userIntent || userIntent.startsWith("Error:")) {
      return { ...state, synthesizedIntent: 'general' };
    }

    const synthesisPrompt = `
      Based on the following user intent description, classify the primary goal into ONE of the following categories:
      - "create": The user wants to generate a completely new document from scratch or with a template.
      - "edit": The user wants to modify an existing document or a specific part of it (like a selection).
      - "general": The user is asking for information, providing you with clarification, or performing an action not related to creating or editing document content directly.

      User Intent Description:
      ---
      ${userIntent}
      ---

      Respond with only ONE word: "create", "edit", or "general".
    `;

    try {
      // Use a non-streaming call as we expect a single word response
      const classification = await this.model.generate(
        "Open AI 4o", // Using the specified model
        synthesisPrompt,
        "Synthesize user intent",
        false // Explicitly set stream to false
        // No streamController needed here for a non-streaming call
      );

      const cleanClassification = classification.trim().toLowerCase();

      console.log("Synthesized intent:", cleanClassification);
      // Validate the response
      if (['create', 'edit', 'general'].includes(cleanClassification)) {
        return { ...state, synthesizedIntent: cleanClassification as 'create' | 'edit' | 'general' };
      } else {
        console.warn(`Unexpected classification result: '${classification}'. Defaulting to 'general'.`);
        return { ...state, synthesizedIntent: 'general' };
      }

    } catch (error) {
      console.error("Error in synthesize intent node:", error);
      // Don't write to stream here as this node isn't streaming user-facing content
      // streamController.writeSystemMessage("Failed to synthesize user intent\n");
      return { ...state, synthesizedIntent: 'general' }; // Default on error
    }
  }

  private async userIntentClassificationNode(state: TAgentState) {
    console.log("Executing userIntentClassificationNode...");
    const { chatHistory, customContexts, query } = state;

    // Use the last message from chat history if available, otherwise use the query
    const lastUserMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;
    const queryToAnalyze = lastUserMessage ? lastUserMessage.content : query;
    const uploadedFiles = lastUserMessage?.fileNames ?? [];

    const classificationPrompt = `
      Role:
        - You are a helpful assistant interpreting the user's request. Your goal is to understand what the user wants to do and explain the next action *you* (the assistant) will take.

      Formatting instructions:
       - Provide the classification in a concise, conversational format, addressing the user directly (e.g., "Okay, it looks like you want to...").
       - Always reply in markdown format.
       - NEVER add triple backticks to the beginning or end of your response unless referring to code.
       - Respond in a human-friendly format. Example: "Okay, it looks like you want to edit the active document." or "Got it, you're asking to create a new document."
       - ALWAYS add a new line at the end of your response.

      Analyze the user's query and classify their intent. Consider the chat history for context.

      User Query:
      ${queryToAnalyze}

      Custom context added by the user:
      ${customContexts.length > 0 ? customContexts.map(c => `- [${c.type}] ${c.content}`).join("\n") : 'None'}

      Uploaded Files with this message: ${uploadedFiles.length > 0 ? uploadedFiles.join(', ') : 'None'}

      Based on the query and any uploaded files, explain what you understand the user wants to do. Address the user directly using "you". Incorporate answers to these points naturally into your explanation:
        1.  Are you asking for information, requesting to create a new document, or asking to edit an existing document/selection?
        2.  Are you referring to any specific files uploaded with this message? (Mention them if yes).
        3.  If you used "this", does it refer to an uploaded file, the active document, or custom context?
        4.  What custom context did you provide? (Mention if relevant).

      Example explanation: "Okay, it looks like you want to edit the selection you provided from the active document, referring to the file 'report.docx' you uploaded."

      Finally, clearly state the next steps *I* (the assistant) will take based on your request. Use a direct, first-person perspective. Guidelines for next steps:
        - CRITICAL: If you are asking to create a new document, edit an existing document OR a selection, state that I will now proceed to generate the document with the requested changes. Example: "I will create a new version of the document with that section expanded."
        - If you are asking for information, state that I will research and provide the information. Example: "I will look up that information for you."

      Considerations:
        - When the user is asking you to write something, assume that they are asking to make changes to the active document and try and understand their intent.
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
        activeDocument: { default: () => "", value: (x, y) => y || x },
        chatHistory: { default: () => [], value: (x, y) => y || x },
        chatId: { value: (x) => x },
        context: { default: () => [], value: (x, y) => [...(x || []), ...(y || [])] },
        customContexts: { default: () => [], value: (x, y) => y || x },
        draft: { default: () => "", value: (x, y) => y || x },
        feedback: { default: () => [], value: (x, y) => [...(x || []), ...(y || [])] },
        model: { value: (x) => x },
        query: { value: (x) => x },
        streamController: { value: (x) => x },
        synthesizedIntent: { default: () => undefined, value: (x, y) => y || x },
        userId: { value: (x) => x },
        userIntent: { default: () => "", value: (x, y) => y || x }
      }
    });

    // Nodes
    graph.addNode("sanitizeQuery", this.sanitizeQueryNode.bind(this));
    graph.addNode("retrievePineconeContext", this.retrievePineconeContextNode.bind(this));
    graph.addNode("retrieveChatHistory", this.retrieveChatHistoryNode.bind(this));
    graph.addNode("userIntentClassification", this.userIntentClassificationNode.bind(this));
    graph.addNode("synthesizeIntent", this.synthesizeIntentNode.bind(this));
    graph.addNode("createDocument", this.createDocumentNode.bind(this));
    graph.addNode("editDocument", this.editDocumentNode.bind(this));
    graph.addNode("formatDocument", this.formatDocumentNode.bind(this)); // Add new node
    graph.addNode("summarizeChanges", this.summarizeChangesNode.bind(this));
    graph.addNode("generalQuery", this.generalQueryNode.bind(this));

    // Edges (Using 'any' to bypass potential typing issues)
    graph.addEdge(START, "sanitizeQuery" as any);
    graph.addEdge("sanitizeQuery" as any, "retrieveChatHistory" as any);
    graph.addEdge("retrieveChatHistory" as any, "userIntentClassification" as any);
    graph.addEdge("userIntentClassification" as any, "synthesizeIntent" as any);
    graph.addEdge("synthesizeIntent" as any, "retrievePineconeContext" as any);

    // Add conditional routing after retrieving context
    graph.addConditionalEdges(
      "retrievePineconeContext" as any, // Source node
      this.routeIntent.bind(this),      // Function to determine the route
      {                                  // Mapping from function output to target node names
        "createDocument": "createDocument" as any,
        "editDocument": "editDocument" as any,
        "generalQuery": "generalQuery" as any
      }
    );

    // Edges from conditional branches
    // graph.addEdge("createDocument" as any, "summarizeChanges" as any); // Old edge
    // graph.addEdge("editDocument" as any, "summarizeChanges" as any); // Old edge
    graph.addEdge("createDocument" as any, "formatDocument" as any); // New edge
    graph.addEdge("editDocument" as any, "formatDocument" as any); // New edge
    graph.addEdge("formatDocument" as any, "summarizeChanges" as any); // New edge
    graph.addEdge("generalQuery" as any, END);
    graph.addEdge("summarizeChanges" as any, END);

    return graph.compile();
  }
}