import { END, START, StateGraph } from "@langchain/langgraph";
import { Pinecone } from "@pinecone-database/pinecone";

import { getChatHistory } from "./firebase-admin";
import { ModelRouter } from "./langgraph/models";
import { 
  createDocumentPrompt, 
  createThinkingPrompt, 
  editDocumentPrompt, 
  generalQueryPrompt, 
  summarizeCreationPrompt,
  summarizeEditPrompt
} from "./langgraph/prompts";
import { TAgentState } from "./langgraph/schema";
import { getValidSlackToken } from "./slack-auth-helper";

// Define expected message structure from Slack conversations.history
interface SlackHistoryMessage {
    ts: string;   // Timestamp
    type: string;
    text?: string; // Message content
    user?: string; // User ID might not always be present (e.g., bot messages)
    // Add other fields if needed
}

export class DocumentWorkflow {
  private model = new ModelRouter();
  private pinecone = new Pinecone();

  private async classifyIntentNode(state: TAgentState): Promise<Partial<TAgentState>> {
    const { chatHistory, customContexts, query, streamController } = state; // Keep streamController for potential error messages

    // Use the last message from chat history if available, otherwise use the query
    const lastUserMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;
    const queryToAnalyze = lastUserMessage ? lastUserMessage.content : query;
    const uploadedFiles = lastUserMessage?.fileNames ?? [];

    const classificationPrompt = `
      Analyze the user's query, considering chat history, custom context, and uploaded files, and classify the primary goal into ONE of the following categories:
      - "create": The user wants to generate a completely new document.
      - "edit": The user wants to modify an existing document or a specific part of it (like a selection or using uploaded files as reference/input for edits).
      - "general": The user is asking for information, clarification, or performing an action not directly related to creating or editing document content (e.g., asking about capabilities, summarizing history, general questions).

      User Query:
      ---
      ${queryToAnalyze}
      ---

      Custom context added by the user:
      ---
      ${customContexts.length > 0 ? customContexts.map(c => `- [${c.type}] ${c.content}`).join("\n") : 'None'}
      ---
      
      Uploaded Files with this message: ${uploadedFiles.length > 0 ? uploadedFiles.join(', ') : 'None'}

      Chat History (Last few messages):
      ---
      ${chatHistory.slice(-3).map(m => `${m.role}: ${m.content}`).join("\n")}
      ---

      Respond with only ONE word: "create", "edit", or "general".
    `;

    try {
      const classification = await this.model.generate(
        "Open AI 4o", // Or a faster/cheaper model if suitable for simple classification
        classificationPrompt,
        "Classify user intent internally",
        false // Non-streaming
        // No streamController needed here unless we add system messages on failure
      );

      const cleanClassification = classification.trim().toLowerCase();

      console.log("Internal classification:", cleanClassification);
      // Validate the response
      if (['create', 'edit', 'general'].includes(cleanClassification)) {
        return { ...state, synthesizedIntent: cleanClassification as 'create' | 'edit' | 'general' };
      } else {
        console.warn(`Unexpected classification result: '${classification}'. Defaulting to 'general'.`);
        streamController.writeSystemMessage("Warning: Could not reliably determine intent, proceeding with general query."); // Inform user about fallback
        return { ...state, synthesizedIntent: 'general' };
      }

    } catch (error) {
      console.error("Error in classify intent node:", error);
      streamController.writeSystemMessage("Error: Failed to classify user intent. Proceeding with general query."); // Inform user
      return { ...state, synthesizedIntent: 'general' }; // Default on error
    }
  }

  private async createDocumentNode(state: TAgentState) {
    console.log("Creating document");
    const { streamController } = state;

    try {
      // Thinking step moved to thinkingNode

      // === Send Intermediate Summary ===
      const summaryMessage = `Okay, based on the plan, I'll now generate the document content you requested.`;
      streamController.writePartialResult(summaryMessage);
      // === End Intermediate Summary ===

      // === Generate and Stream Final Document ===
      const finalPrompt = createDocumentPrompt(state);
      // streamController.writeSystemMessage("Generating document content..."); // Removing optional system messages
      const output = await this.model.generate(
        state.model,
        finalPrompt,
        state.query, // Keep original query context if needed by model
        true, // Streaming
        streamController,
        'partialResult'
      );
      // === End Final Document Generation ===
      
      // Don't close stream here; finalizeActionNode might need it.
      
      return { ...state, draft: output }; // Store potentially incomplete streamed output in draft

    } catch (error) {
      console.error("Error in create document node:", error);
      streamController.writeSystemMessage("Failed to generate document\n");
      streamController.close(); // Close stream on error
      return { ...state, draft: "Error: Failed to generate document" };
    }
  }
  
  private async editDocumentNode(state: TAgentState) {
    console.log("Editing document");
    const { streamController } = state;
    
    try {
      // Thinking step moved to thinkingNode

      // === Send Intermediate Summary ===
      const editFocus = state.customContexts.some(c => c.type === 'Selection') ? "the selection" : "the document";
      const summaryMessage = `Understood. I'll now apply the edits to ${editFocus} based on the plan.`;
      streamController.writePartialResult(summaryMessage);
      // === End Intermediate Summary ===

      // === Generate and Stream Final Edits ===
      const finalPrompt = editDocumentPrompt(state);
      // streamController.writeSystemMessage("Generating edits..."); // Optional feedback
      const output = await this.model.generate(
        state.model,
        finalPrompt,
        state.query,
        true, // Streaming
        streamController,
        'partialResult'
      );
      // === End Final Edit Generation ===
      
      // Don't close stream here; finalizeActionNode might need it.

      return { ...state, draft: output };

    } catch (error) {
      console.error("Error in edit document node:", error);
      streamController.writeSystemMessage("Failed to edit document\n");
      streamController.close(); // Close stream on error
      return { ...state, draft: "Error: Failed to edit document" };
    }
  }

  // Renamed from summarizeChangesNode
  private async finalizeActionNode(state: TAgentState) {
    const { draft, streamController, synthesizedIntent } = state;
    
    // Determine if the previous action produced a valid output for summary
    // For edit, just check if intent was edit. For create, check for <Document> tag.
    const documentRegex = /<Document>[\s\S]*?<\/Document>/;
    const canSummarizeCreate = synthesizedIntent === 'create' && draft && !draft.startsWith("Error:") && documentRegex.test(draft);
    const canSummarizeEdit = synthesizedIntent === 'edit' && draft && !draft.startsWith("Error:"); // Simpler check for edits

    if (!canSummarizeCreate && !canSummarizeEdit) {
        console.log("FinalizeActionNode: No summary needed or previous step failed, closing stream.");
        streamController.close();
        return state;
    }

    let summaryPrompt: string | null = null;
    let summaryLog = "";

    if (canSummarizeCreate) {
        summaryPrompt = summarizeCreationPrompt(state);
        summaryLog = "Generating creation summary";
    } else if (canSummarizeEdit) {
        summaryPrompt = summarizeEditPrompt(state);
        summaryLog = "Generating edit summary";
    }

    // If we have a valid prompt string, generate and stream the summary
    if (summaryPrompt !== null) {
        try {
            console.log(`FinalizeActionNode: ${summaryLog}`);
            await this.model.generate(
                state.model,
                summaryPrompt,
                summaryLog,
                true, 
                streamController,
                'partialResult'
            );
        } catch (error) {
             console.error(`Error in finalizeActionNode (${summaryLog}):`, error);
             streamController.writeSystemMessage("Failed to generate final summary\n");
        }
    } else {
        console.log("FinalizeActionNode: Conditions met, but no appropriate summary prompt found (should not happen).");
    }

    console.log("FinalizeActionNode: Closing stream.");
    streamController.close(); 
    return state;
  }

  // New node for handling general queries
  private async generalQueryNode(state: TAgentState) {
    const { streamController } = state;

    try {
      // No separate thinking step needed for general query as per requirement

      // === Send Intermediate Summary ===
      // const summaryMessage = `Right, proceeding to answer your query based on the plan.`; // Can remove if thinking isn't done here
      // streamController.writePartialResult(summaryMessage);
      // === End Intermediate Summary ===
      
      // === Generate and Stream Final Answer ===
      const finalPrompt = generalQueryPrompt(state);
      streamController.writeSystemMessage("Generating answer..."); // Optional feedback
      await this.model.generate(
        state.model,
        finalPrompt,
        state.query,
        true, // Streaming
        streamController,
        'partialResult'
      );
      // === End Final Answer Generation ===

      streamController.close();
      return { ...state, draft: "" };

    } catch (error) {
      console.error("Error in general query node:", error);
      streamController.writeSystemMessage("Failed to answer query\n");
      streamController.close(); // Close stream on error
      return { ...state, draft: "Error: Failed to answer query" };
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

  private async retrieveSlackMessagesNode(state: TAgentState): Promise<Partial<TAgentState>> {
      const { customContexts, streamController, userId } = state;
      const slackContexts = customContexts.filter(
          (ctx) => ctx.type === 'slack_channel' && ctx.metadata?.channelId
      );

      if (slackContexts.length === 0) {
          console.log("No Slack channels found in custom context.");
          return { ...state, slackMessages: [] }; // No Slack context to process
      }

      console.log(`Found ${slackContexts.length} Slack channel(s) in context. Fetching messages...`);
      streamController.writeSystemMessage(`Fetching messages from ${slackContexts.length} Slack channel(s)...`);

      const allFetchedMessages: { channelName: string; messages: string[] }[] = [];
      let fetchErrorOccurred = false;

      for (const context of slackContexts) {
          const channelId = context.metadata!.channelId as string;
          const channelName = context.content; // Use the display name from context

          try {
              // 1. Get valid token (handles refresh)
              const tokenResult = await getValidSlackToken(userId);
              if (!tokenResult.accessToken) {
                  console.error(`Failed to get valid Slack token for user ${userId} to fetch channel ${channelId}: ${tokenResult.error}`);
                  streamController.writeSystemMessage(`Error: Could not get authorization for Slack to fetch #${channelName}. ${tokenResult.needsReAuth ? 'Please reconnect Slack.' : ''}`);
                  fetchErrorOccurred = true;
                  continue; // Skip this channel
              }
              const accessToken = tokenResult.accessToken;

              // 2. Attempt to join the channel first
              try {
                const joinParams = new URLSearchParams({ channel: channelId });
                const joinResponse = await fetch(`https://slack.com/api/conversations.join`, {
                   body: joinParams.toString(),
                   headers: {
                       'Authorization': `Bearer ${accessToken}`,
                       'Content-Type': 'application/x-www-form-urlencoded' // Required for join
                   },
                   method: 'POST' // Use POST for joining
                });
                const joinData = await joinResponse.json();
                if (!joinData.ok && joinData.error !== 'already_in_channel') {
                    console.warn(`Bot couldn't join channel ${channelId} (${channelName}): ${joinData.error}. Skipping history fetch.`);
                    streamController.writeSystemMessage(`Warning: Could not join #${channelName} (${joinData.error}). Skipping messages.`);
                    continue; // Skip this channel if join failed for reasons other than already being there
                }
              } catch (joinError) {
                  console.error(`Exception trying to join channel ${channelId} (${channelName}):`, joinError);
                  streamController.writeSystemMessage(`Error: Exception while trying to join #${channelName}. Skipping messages.`);
                  fetchErrorOccurred = true;
                  continue; // Skip on exception
              }

              // 3. Fetch channel history (if join succeeded or was already member)
              const limit = 20; // Fetch latest X messages
              const params = new URLSearchParams({
                  channel: channelId,
                  limit: limit.toString(),
              });

              const response = await fetch(`https://slack.com/api/conversations.history?${params.toString()}`, {
                  headers: { 'Authorization': `Bearer ${accessToken}` },
                  method: 'GET',
              });

              const data = await response.json();

              if (!data.ok) {
                  console.error(`Slack API error fetching history for channel ${channelId} (${channelName}):`, data.error);
                   streamController.writeSystemMessage(`Error fetching messages from #${channelName}: ${data.error}`);
                   fetchErrorOccurred = true;
                   if (data.error === 'invalid_auth' || data.error === 'token_revoked') {
                       // Optionally clear token here too, though getValidSlackToken might handle it on next try
                   }
                  continue; // Skip this channel
              }

              // 4. Extract and store messages
              const messages = (data.messages as SlackHistoryMessage[] || [])
                  .map(msg => msg.text || '') // Get text content, default to empty string
                  .filter(text => text.trim() !== ''); // Filter out empty messages

              if (messages.length > 0) {
                   allFetchedMessages.push({ channelName: channelName, messages: messages.reverse() }); // Reverse to get chronological order (oldest first)
                   console.log(`Fetched ${messages.length} messages from Slack channel ${channelId} (${channelName})`);
              } else {
                  console.log(`No messages found or fetched from Slack channel ${channelId} (${channelName})`);
                  streamController.writeSystemMessage(`No recent messages found in #${channelName}.`);
              }

          } catch (error) {
              console.error(`Exception fetching messages for channel ${channelId} (${channelName}):`, error);
              streamController.writeSystemMessage(`Error: An exception occurred while fetching messages from #${channelName}.`);
              fetchErrorOccurred = true;
          }
      }
       if (!fetchErrorOccurred && allFetchedMessages.length > 0) {
            streamController.writeSystemMessage("Finished fetching Slack messages.");
       } else if (fetchErrorOccurred) {
            streamController.writeSystemMessage("Finished fetching Slack messages (some channels might have failed).");
       }

      return { ...state, slackMessages: allFetchedMessages };
  }

  // Function to decide the next step AFTER the thinking node (if applicable)
  private routeIntentToAction(state: TAgentState): "createDocument" | "editDocument" {
    // This router is only hit after the thinkingNode, so intent must be create or edit
    const intent = state.synthesizedIntent;
    if (intent === "create") {
      return "createDocument";
    } else { // Must be "edit" if we got here via routeToThinkingOrAction
      return "editDocument";
    }
    // No need for 'generalQuery' here as it bypasses the thinkingNode
  }

  // New function to decide whether to go to thinking or directly to action
  private routeToThinkingOrAction(state: TAgentState): "generalQuery" | "thinkingNode" {
      const intent = state.synthesizedIntent;
      if (intent === "create" || intent === "edit") {
          return "thinkingNode";
      } else {
          // Default to generalQuery if intent is missing or 'general'
          console.log("Routing directly to general query node. Intent:", intent);
          return "generalQuery";
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
      activeDocument: result["Document"],
      query: result["Query"],
    };
  }

  // New node for generating thinking steps for create/edit
  private async thinkingNode(state: TAgentState) {
    const { streamController, synthesizedIntent } = state;

    // Determine context for the thinking prompt
    const thinkingContext = synthesizedIntent === 'create'
      ? "Generate detailed thinking for document creation"
      : "Generate detailed thinking for document edits";

    try {
        const thinkingPrompt = createThinkingPrompt(state);
        streamController.writeSystemMessage("Generating detailed plan..."); // Optional feedback
        await this.model.generate(
            "Open AI 4o", 
            thinkingPrompt,
            thinkingContext,
            true,
            streamController,
            'reasoning'
        );

        return state; // No state modification needed, just pass through
    } catch (error) {
        console.error("Error in thinking node:", error);
        streamController.writeSystemMessage("Failed to generate thinking plan\n");
        // Let the workflow continue, but log the error.
        // Depending on desired behavior, we could add error handling or stop the flow.
        return state;
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
        slackMessages: { default: () => [], value: (x, y) => y ?? x },
        streamController: { value: (x) => x },
        synthesizedIntent: { default: () => undefined, value: (x, y) => y || x },
        userId: { value: (x) => x },
      }
    });

    // Nodes
    graph.addNode("sanitizeQuery", this.sanitizeQueryNode.bind(this));
    graph.addNode("retrievePineconeContext", this.retrievePineconeContextNode.bind(this));
    graph.addNode("retrieveChatHistory", this.retrieveChatHistoryNode.bind(this));
    graph.addNode("retrieveSlackMessages", this.retrieveSlackMessagesNode.bind(this));
    graph.addNode("classifyIntent", this.classifyIntentNode.bind(this));
    graph.addNode("thinkingNode", this.thinkingNode.bind(this)); // Add the new node
    graph.addNode("createDocument", this.createDocumentNode.bind(this));
    graph.addNode("editDocument", this.editDocumentNode.bind(this));
    graph.addNode("finalizeAction", this.finalizeActionNode.bind(this));
    graph.addNode("generalQuery", this.generalQueryNode.bind(this));

    // Edges
    graph.addEdge(START, "sanitizeQuery" as any);
    graph.addEdge("sanitizeQuery" as any, "retrieveChatHistory" as any);
    graph.addEdge("retrieveChatHistory" as any, "retrieveSlackMessages" as any);
    graph.addEdge("retrieveSlackMessages" as any, "classifyIntent" as any);
    graph.addEdge("classifyIntent" as any, "retrievePineconeContext" as any);

    // Conditional routing: After Pinecone, decide if thinking is needed or go straight to general query
    graph.addConditionalEdges(
      "retrievePineconeContext" as any,
      this.routeToThinkingOrAction.bind(this), // Use the new router
      {
        "generalQuery": "generalQuery" as any,      // If general, go to general query
        "thinkingNode": "thinkingNode" as any     // If create/edit, go to thinking
      }
    );

    // After thinkingNode, route to the specific action (create or edit)
    graph.addConditionalEdges(
        "thinkingNode" as any,
        this.routeIntentToAction.bind(this), // Use the action router
        {
            "createDocument": "createDocument" as any,
            "editDocument": "editDocument" as any
            // No generalQuery branch here
        }
    );

    // Edges from action nodes to finalization/end
    graph.addEdge("createDocument" as any, "finalizeAction" as any);
    graph.addEdge("editDocument" as any, "finalizeAction" as any);
    graph.addEdge("generalQuery" as any, END);             // General query goes directly to END
    graph.addEdge("finalizeAction" as any, END);         // Finalize action goes to END

    return graph.compile();
  }
}