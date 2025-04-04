import { useCallback, useEffect, useRef, useState } from 'react';

import { toast } from 'sonner';

import { storeMessage } from '@/firebase/firestore-dao';
import { useUserDataContext } from '@/providers/user-data-provider';
import { Message, StreamingState } from '@/types';
import { sendChatMessage } from '@/utils/chat-api';
import { useEditorRef, usePlateState } from '@udecode/plate/react';
import { MarkdownPlugin } from '@udecode/plate-markdown';
import { parseAssistantResponse } from '@/utils/document-parser';

interface UseChatMessagingProps {
  chatId: string;
  model: string;
  userId: string;
  initialMessages?: Message[];
}

export const useChatMessaging = ({ chatId, initialMessages, model, userId }: UseChatMessagingProps) => {
  const { setUserChats, userChats } = useUserDataContext();
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [status, setStatus] = useState<'awaiting_message' | 'in_progress'>('awaiting_message');
  const [readOnly, setReadOnly] = usePlateState('readOnly');
  const editorRef = useEditorRef();
  const [streamingState, setStreamingState] = useState<StreamingState>({
    document: {
      content: '',
      isStreaming: false
    },
    message: {
      id: 'streaming',
      content: '',
      fileNames: [],
      role: 'assistant'
    },
    reasoning: '',
    isProcessingDocument: false
  });
  
  const streamingStateRef = useRef<StreamingState>(streamingState);
  const lastUpdateTimeRef = useRef<number>(0);
  const pendingDocUpdateRef = useRef<string | null>(null);

  // Throttle function for editor updates
  const throttleEditorUpdate = useCallback(() => {
    if (!pendingDocUpdateRef.current) return;
    
    const now = Date.now();
    if (now - lastUpdateTimeRef.current >= 1200) {
      try {
        const deserializedNodes = editorRef.getApi(MarkdownPlugin).markdown.deserialize(pendingDocUpdateRef.current);
        if (Array.isArray(deserializedNodes) && deserializedNodes.length > 0) {
          editorRef.tf.setValue(deserializedNodes);
        }
      } catch (e) {
        console.warn("Error deserializing document content:", e);
      }
      
      lastUpdateTimeRef.current = now;
      pendingDocUpdateRef.current = null;
    }
  }, [editorRef]);

  // Set up interval for throttled updates
  useEffect(() => {
    const intervalId = setInterval(throttleEditorUpdate, 1200);
    return () => clearInterval(intervalId);
  }, [throttleEditorUpdate]);

  useEffect(() => {
    streamingStateRef.current = streamingState;
  }, [streamingState]);

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  const addMessage = async (content: string, fileNames: string[] = []) => {
    const timestamp = Date.now();
    const newMessage: Message = {
      id: timestamp.toString(),
      content: content.trim(),
      fileNames,
      role: 'user'
    };

    // Store the message in Firestore
    await storeMessage(chatId, {
      id: timestamp,
      content: content.trim(),
      fileNames,
      role: 'user'
    });

    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const sendMessage = useCallback(async (serializedContent: string) => {
    setStatus('in_progress');
    
    setMessages(prev => [...prev, {
      id: 'streaming',
      content: '',
      fileNames: [],
      role: 'assistant'
    }]);

    try {
      await sendChatMessage(
        chatId,
        serializedContent,
        userId,
        model,
        {
          onError: (error: Error) => {
            toast.error(error.message);
            setStatus('awaiting_message');
            // Remove the streaming message on error
            setMessages(prev => prev.filter(m => m.id !== 'streaming'));
            setStreamingState({
              document: { content: '', isStreaming: false }, // Stream ends
              message: { id: 'streaming', content: '', fileNames: [], role: 'assistant' },
              reasoning: '',
              isProcessingDocument: false
            });
          },
          // Use the extended state update type
          onStateUpdate: (newStateUpdate: Pick<StreamingState, 'message' | 'reasoning' | 'isProcessingDocument'>) => {
            setStreamingState(prevState => {
              const nextState: StreamingState = {
                // Update all parts based on the incoming update
                document: prevState.document, // Keep document content until end
                message: newStateUpdate.message, 
                reasoning: newStateUpdate.reasoning,
                isProcessingDocument: newStateUpdate.isProcessingDocument,
              };

              // --- Live Editor Update Logic --- 
              if (nextState.isProcessingDocument) {
                // Attempt to parse partial document content
                const docRegex = /<Document>([\s\S]*)/;
                const match = nextState.message.content.match(docRegex);
                if (match && match[1]) {
                  let partialDocContent = match[1];
                  // Remove closing tag if present for cleaner parsing
                  partialDocContent = partialDocContent.replace(/<\/Document>[\s\S]*$/, '');
                  
                  // Instead of updating immediately, store for throttled update
                  pendingDocUpdateRef.current = partialDocContent;
                }
              }
              // --- End Live Editor Update Logic ---

              return nextState;
            });
          },
          onStreamEnd: async (finalContent: string) => {
            const currentState = streamingStateRef.current; // Use ref for final reasoning
            const timestamp = Date.now();
            let finalDocumentContent = '';
            let isDocumentPresent = false;

            // Parse the *final* content here
            if (finalContent.includes('<Document>')) {
              isDocumentPresent = true;
              const { document } = parseAssistantResponse({ 
                id: 'temp', 
                content: finalContent, 
                role: 'assistant', 
                fileNames: []
              });
              finalDocumentContent = document;
              // Update the editor with the final document content
              const deserializedNodes = editorRef.getApi(MarkdownPlugin).markdown.deserialize(document);
              editorRef.tf.setValue(deserializedNodes);
            }

            const finalMessage: Message = {
              id: timestamp.toString(),
              content: finalContent, // Store the raw final content
              fileNames: [],
              reasoning: currentState.reasoning, // Use reasoning from ref
              role: "assistant"
            };
        
            setStatus('awaiting_message');

            // Store the assistant's message in Firestore
            await storeMessage(chatId, {
              id: timestamp,
              content: finalMessage.content,
              fileNames: [],
              reasoning: currentState.reasoning,
              role: "assistant"
            });

            // Replace the streaming message with the final message
            setMessages(prev => prev.map(m => 
              m.id === 'streaming' ? finalMessage : m
            ));

            // Update userChats with the new message
            setUserChats(prevChats => {
              if (!prevChats) return prevChats;
              return prevChats.map(chat => {
                if (chat.id === chatId) {
                  return {
                    ...chat,
                    messages: [...(chat.messages || []), finalMessage]
                  };
                }
                return chat;
              });
            });

            // Final state reset
            setStreamingState({
              document: { 
                content: finalDocumentContent, 
                isStreaming: false // Stream ended
              },
              message: { id: 'streaming', content: '', fileNames: [], role: 'assistant' },
              reasoning: '',
              isProcessingDocument: false
            });
            setReadOnly(false);
          },
          onStreamStart: () => {
            setReadOnly(true);
            lastUpdateTimeRef.current = 0;
            pendingDocUpdateRef.current = null;
            setStreamingState({
              document: { content: '', isStreaming: true }, // Stream starts
              message: { id: 'streaming', content: '', fileNames: [], role: 'assistant' },
              reasoning: '',
              isProcessingDocument: false
            });
          }
        }
      );
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast.error('Failed to send message');
      setStatus('awaiting_message');
      // Remove the streaming message on error
      setMessages(prev => prev.filter(m => m.id !== 'streaming'));
      // Reset state on catch
      setStreamingState({
        document: { content: '', isStreaming: false }, // Stream ends
        message: { id: 'streaming', content: '', fileNames: [], role: 'assistant' },
        reasoning: '',
        isProcessingDocument: false
      });
    }
  }, [chatId, userId, model, setUserChats, editorRef]); // Added editorRef dependency

  return {
    addMessage,
    messages,
    sendMessage,
    setStatus,
    status,
    streamingState
 };
}; 