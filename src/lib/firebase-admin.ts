import { ServiceAccount } from 'firebase-admin';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, Transaction } from 'firebase-admin/firestore';

import FirebaseConfig from './firebase-creds.json';
import { TAccumulatedTokenNodeUsage } from './langgraph/schema';

// Initialize Firebase Admin
const apps = getApps();

const firebaseAdmin = apps.length === 0 
  ? initializeApp({
      credential: cert(FirebaseConfig as ServiceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    })
  : apps[0];

// Initialize Firestore
export const adminDb = getFirestore(firebaseAdmin);

// Helper function to get chat history
export async function getChatHistory(chatId: string) {
  try {
    const chatDoc = await adminDb.collection('chats').doc(chatId).get();
    if (!chatDoc.exists) {
      return [];
    }
    const chatData = chatDoc.data();
    return chatData?.messages || [];
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}

interface TokenUsage {
    inputTokens: number;
    modelName: string;
    outputTokens: number;
}

/**
 * Updates the token usage count for a specific node and model within a chat document.
 * Uses a transaction to ensure atomic updates.
 * 
 * @param chatId The ID of the chat document.
 * @param nodeName The name of the graph node/container that made the LLM call.
 * @param usage The token usage details (model, input, output tokens).
 */
export async function updateTokenUsage(chatId: string, nodeName: string, usage: TokenUsage): Promise<void> {
    if (!chatId || !nodeName || !usage || usage.inputTokens == null || usage.outputTokens == null) {
        console.error("Invalid arguments provided for updateTokenUsage", { chatId, nodeName, usage });
        return;
    }

    const chatRef = adminDb.collection('chats').doc(chatId);

    try {
        await adminDb.runTransaction(async (transaction: Transaction) => {
            const chatDoc = await transaction.get(chatRef);
            
            if (!chatDoc.exists) {
                console.error(`Chat document ${chatId} not found.`);
                // Optionally, create the document here if it's expected it might not exist yet
                // For now, we'll just exit if it doesn't exist.
                return; 
            }

            const data = chatDoc.data();
            // Use const as tokensUsedArray is not reassigned, only modified internally
            const tokensUsedArray = data?.tokensUsed || [];

            // Find the entry for the specific node
            let nodeEntry = tokensUsedArray.find((entry: any) => entry.node === nodeName);

            if (!nodeEntry) {
                // Node entry doesn't exist, create it
                nodeEntry = {
                    models: [
                        {
                            inputTokens: usage.inputTokens,
                            model: usage.modelName,
                            outputTokens: usage.outputTokens,
                        }
                    ],
                    node: nodeName
                };
                tokensUsedArray.push(nodeEntry);
            } else {
                // Node entry exists, find the model entry within it
                // Use const as modelEntry is not reassigned
                const modelEntry = nodeEntry.models.find((model: any) => model.model === usage.modelName);

                if (!modelEntry) {
                    // Model entry doesn't exist, create it
                    nodeEntry.models.push({
                        inputTokens: usage.inputTokens,
                        model: usage.modelName,
                        outputTokens: usage.outputTokens,
                    });
                } else {
                    // Model entry exists, calculate new totals
                    modelEntry.inputTokens = (modelEntry.inputTokens || 0) + usage.inputTokens;
                    modelEntry.outputTokens = (modelEntry.outputTokens || 0) + usage.outputTokens;
                }
            }

            // Update the document with the modified tokensUsed array
            transaction.update(chatRef, { tokensUsed: tokensUsedArray });
            console.log(`Updated token usage for chat ${chatId}, node ${nodeName}, model ${usage.modelName}`);
        });
    } catch (error) {
        console.error(`Error updating token usage for chat ${chatId}, node ${nodeName}:`, error);
    }
}

/**
 * Commits the accumulated token usage from the workflow state to the Firestore document.
 * Merges the usage with any existing data in the document using a transaction.
 * 
 * @param chatId The ID of the chat document.
 * @param accumulatedTokens The array of accumulated token usage from the final state.
 */
export async function commitTokenUsage(chatId: string, accumulatedTokens: TAccumulatedTokenNodeUsage[]): Promise<void> {
    if (!chatId || !accumulatedTokens || accumulatedTokens.length === 0) {
        console.log("Skipping token usage commit: No accumulated tokens or missing chatId.");
        return;
    }

    const chatRef = adminDb.collection('chats').doc(chatId);
    console.log(`Attempting to commit token usage for chat: ${chatId}`);

    try {
        await adminDb.runTransaction(async (transaction: Transaction) => {
            const chatDoc = await transaction.get(chatRef);
            
            if (!chatDoc.exists) {
                console.error(`Chat document ${chatId} not found during commit.`);
                // Decide if we should create the doc here, or just log.
                // For now, log and exit transaction.
                return; 
            }

            const data = chatDoc.data();
            const existingTokensUsed: TAccumulatedTokenNodeUsage[] = data?.tokensUsed || []; 
            const existingUsageMap = new Map<string, Map<string, { inputTokens: number, outputTokens: number }>>();
            existingTokensUsed.forEach(nodeEntry => {
                const modelMap = new Map<string, { inputTokens: number, outputTokens: number }>();
                nodeEntry.models.forEach(modelEntry => {
                    modelMap.set(modelEntry.model, { 
                        inputTokens: modelEntry.inputTokens || 0, 
                        outputTokens: modelEntry.outputTokens || 0 
                    });
                });
                existingUsageMap.set(nodeEntry.node, modelMap);
            });

            // Merge accumulated tokens into the map
            accumulatedTokens.forEach(accumulatedNode => {
                let nodeMap = existingUsageMap.get(accumulatedNode.node);
                if (!nodeMap) {
                    nodeMap = new Map<string, { inputTokens: number, outputTokens: number }>();
                    existingUsageMap.set(accumulatedNode.node, nodeMap);
                }
                
                accumulatedNode.models.forEach(accumulatedModel => {
                    const modelUsage = nodeMap.get(accumulatedModel.model);
                    if (!modelUsage) {
                        nodeMap.set(accumulatedModel.model, { 
                            inputTokens: accumulatedModel.inputTokens || 0,
                            outputTokens: accumulatedModel.outputTokens || 0
                        });
                    } else {
                        modelUsage.inputTokens += accumulatedModel.inputTokens || 0;
                        modelUsage.outputTokens += accumulatedModel.outputTokens || 0;
                    }
                });
            });

            // Convert the map back into the array structure for Firestore
            const finalTokensUsed: TAccumulatedTokenNodeUsage[] = [];
            existingUsageMap.forEach((modelMap, nodeName) => {
                const modelsArray: TAccumulatedTokenNodeUsage['models'] = [];
                modelMap.forEach((usage, modelName) => {
                    modelsArray.push({ model: modelName, ...usage });
                });
                if (modelsArray.length > 0) {
                    finalTokensUsed.push({ models: modelsArray, node: nodeName });
                }
            });

            // Update the document with the final merged tokensUsed array
            transaction.update(chatRef, { tokensUsed: finalTokensUsed });
            console.log(`Successfully committed token usage for chat ${chatId}.`);
        });
    } catch (error) {
        console.error(`Error committing token usage for chat ${chatId}:`, error);
        // Decide if we need to retry or handle this error further
    }
} 