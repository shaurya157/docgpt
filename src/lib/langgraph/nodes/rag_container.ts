import { Pinecone } from "@pinecone-database/pinecone";

import { getChatHistory } from "../../firebase-admin"; // Adjust path as needed
import { getValidSlackToken } from "../../slack-auth-helper"; // Adjust path as needed
// Assuming for embedding if needed later
import { TAgentState } from "../schema";
import { IGraphNode } from "./base";

// Define expected message structure from Slack conversations.history
interface SlackHistoryMessage {
    ts: string;   // Timestamp
    type: string;
    text?: string; // Message content
    user?: string; // User ID might not always be present (e.g., bot messages)
}

export class RAGContainer implements IGraphNode {
    // private modelRouter: ModelRouter; // If needed for embedding queries
    private name = "retrieveExternalKnowledge";
    private pinecone: Pinecone;

    // constructor(pinecone: Pinecone, modelRouter: ModelRouter) {
    constructor(pinecone: Pinecone) {
        this.pinecone = pinecone;
        // this.modelRouter = modelRouter;
    }

    private async retrieveChatHistoryNode(state: Pick<TAgentState, 'chatId' | 'streamController'>): Promise<Partial<TAgentState>> {
        console.log("Retrieving chat history...");
        try {
            const messages = await getChatHistory(state.chatId);
            console.log(`Retrieved ${messages.length} chat history messages.`);
            return { chatHistory: messages };
        } catch (error) {
            console.error("Error retrieving chat history:", error);
            state.streamController.writeSystemMessage("Failed to retrieve chat history\n");
            return { chatHistory: [] };
        }
    }

    private async retrievePineconeContextNode(state: Pick<TAgentState, 'query' | 'streamController'>): Promise<Partial<TAgentState>> {
        console.log("Retrieving Pinecone context...");
        const { query, streamController } = state;
        
        if (!query || query.trim() === "") {
            console.log("Skipping Pinecone retrieval due to empty query.");
            return { context: [] };
        }

        try {
            // Assuming ModelRouter has an embedding method, or we need it passed in.
            // For now, let's pretend embedding isn't needed for this example refactor.
            // const queryEmbedding = await this.modelRouter.embed(query);
            
            // Placeholder for actual Pinecone query logic
            streamController.writeSystemMessage("Searching knowledge base...");
            console.log(`Querying Pinecone with: "${query}"`); 
            // const results = await this.pinecone.index("your-index-name").query({ vector: queryEmbedding, topK: 5 });
            // Mock result:
            const mockResults = [
                { id: "doc1", metadata: { text: "This is relevant context from Pinecone about " + query }, score: 0.9 },
                { id: "doc2", metadata: { text: "Another piece of context related to " + query }, score: 0.8 }
            ];
            console.log(`Retrieved ${mockResults.length} contexts from Pinecone.`);

            const contexts = mockResults.map(r => ({
                content: r.metadata?.text || "",
                score: r.score,
                source: r.id
            }));
            
            return { context: contexts };

        } catch (error) {
            console.error("Error retrieving Pinecone context:", error);
            streamController.writeSystemMessage("Failed to retrieve context from knowledge base.\n");
            return { context: [] };
        }
    }

    // --- Node Logic (moved and adapted from DocumentWorkflow) ---

    private async retrieveSlackMessagesNode(state: Pick<TAgentState, 'customContexts' | 'streamController' | 'userId'>): Promise<Partial<TAgentState>> {
        console.log("Retrieving Slack messages...");
        const { customContexts, streamController, userId } = state;
        const slackContexts = customContexts.filter(
            (ctx) => ctx.type === 'slack_channel' && ctx.metadata?.channelId
        );

        if (slackContexts.length === 0) {
            console.log("No Slack channels found in custom context.");
            return { slackMessages: [] };
        }

        console.log(`Found ${slackContexts.length} Slack channel(s) in context. Fetching messages...`);
        streamController.writeSystemMessage(`Fetching messages from ${slackContexts.length} Slack channel(s)...`);

        const allFetchedMessages: { channelName: string; messages: string[] }[] = [];
        let fetchErrorOccurred = false;

        // Consider Promise.allSettled if one channel failure shouldn't stop others
        for (const context of slackContexts) {
            const channelId = context.metadata!.channelId as string;
            const channelName = context.content;

            try {
                const tokenResult = await getValidSlackToken(userId);
                if (!tokenResult.accessToken) {
                    console.error(`Failed to get valid Slack token for user ${userId} to fetch channel ${channelId}: ${tokenResult.error}`);
                    streamController.writeSystemMessage(`Error: Could not get authorization for Slack to fetch #${channelName}. ${tokenResult.needsReAuth ? 'Please reconnect Slack.' : ''}`);
                    fetchErrorOccurred = true;
                    continue;
                }
                const accessToken = tokenResult.accessToken;

                // Join channel (best effort)
                try {
                    const joinParams = new URLSearchParams({ channel: channelId });
                    const joinResponse = await fetch(`https://slack.com/api/conversations.join`, {
                        body: joinParams.toString(),
                        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/x-www-form-urlencoded' },
                        method: 'POST',
                    });
                    const joinData = await joinResponse.json();
                    if (!joinData.ok && joinData.error !== 'already_in_channel') {
                        console.warn(`Bot couldn't join channel ${channelId} (${channelName}): ${joinData.error}. Skipping history fetch.`);
                        streamController.writeSystemMessage(`Warning: Could not join #${channelName} (${joinData.error}). Skipping messages.`);
                        continue;
                    }
                } catch (joinError) {
                    console.error(`Exception trying to join channel ${channelId} (${channelName}):`, joinError);
                    streamController.writeSystemMessage(`Error: Exception while trying to join #${channelName}. Skipping messages.`);
                    fetchErrorOccurred = true;
                    continue;
                }

                // Fetch history
                const limit = 20;
                const params = new URLSearchParams({ channel: channelId, limit: limit.toString() });
                const response = await fetch(`https://slack.com/api/conversations.history?${params.toString()}`, {
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                    method: 'GET',
                });
                const data = await response.json();

                if (!data.ok) {
                    console.error(`Slack API error fetching history for channel ${channelId} (${channelName}):`, data.error);
                    streamController.writeSystemMessage(`Error fetching messages from #${channelName}: ${data.error}`);
                    fetchErrorOccurred = true;
                    continue;
                }

                const messages = (data.messages as SlackHistoryMessage[] || [])
                    .map(msg => msg.text || '')
                    .filter(text => text.trim() !== '');

                if (messages.length > 0) {
                    allFetchedMessages.push({ channelName: channelName, messages: messages.reverse() });
                    console.log(`Fetched ${messages.length} messages from Slack channel ${channelId} (${channelName})`);
                } else {
                    console.log(`No messages found or fetched from Slack channel ${channelId} (${channelName})`);
                    // streamController.writeSystemMessage(`No recent messages found in #${channelName}.`); // Reduce noise
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
        } else if (slackContexts.length > 0) {
             streamController.writeSystemMessage("Finished checking Slack channels (no new messages found).");
        }

        return { slackMessages: allFetchedMessages };
    }

    async execute(state: TAgentState): Promise<Partial<TAgentState>> {
        console.log(`--- Executing ${this.getName()} ---`);
        // Run retrievers in parallel
        const [chatHistoryResult, slackMessagesResult, pineconeResult] = await Promise.all([
            this.retrieveChatHistoryNode(state),
            this.retrieveSlackMessagesNode(state),
            this.retrievePineconeContextNode(state) // Assumes query is ready after sanitize step
        ]);

        // Merge results
        return {
            ...chatHistoryResult,
            ...slackMessagesResult,
            ...pineconeResult,
        };
    }

    getName(): string {
        return this.name;
    }
} 