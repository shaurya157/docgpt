import { useCallback, useEffect, useRef, useState } from 'react';

import { toast } from 'sonner';

import { storeMessage } from '@/firebase/firestore-dao';
import { useUserDataContext } from '@/providers/user-data-provider';
import { Message, StreamingState } from '@/types';
import { sendChatMessage } from '@/utils/chat-api';

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
    reasoning: ''
  });
  
  // Add ref to track current streaming state
  const streamingStateRef = useRef<StreamingState>(streamingState);

  // Update ref whenever streamingState changes
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
    
    // Add a temporary streaming message
    setMessages(prev => [...prev, {
      id: 'streaming',
      content: '',
      fileNames: [],
      role: 'assistant'
    }]);
    
    // Reset streaming state
    setStreamingState({
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
      reasoning: ''
    });

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
            setStreamingState(prev => ({
              ...prev,
              document: { content: '', isStreaming: false }
            }));
          },
          onStateUpdate: (newState: StreamingState) => {
            setStreamingState(prevState => {
              const nextState = {
                document: newState.document,
                message: {
                  ...prevState.message,
                  content: newState.message.content || prevState.message.content
                },
                reasoning: prevState.reasoning 
                  ? prevState.reasoning + (newState.reasoning || '')
                  : newState.reasoning || ''
              };
              return nextState;
            });
          },
          onStreamEnd: async (finalContent: string) => {
            const currentState = streamingStateRef.current;
            const timestamp = Date.now();
            
            // Add debug logs to understand what's happening
            console.log('finalContent received:', finalContent);
            console.log('currentState:', JSON.stringify(currentState));
            
            const finalMessage: Message = {
              id: timestamp.toString(),
              content: finalContent || '', // Ensure finalContent is never undefined
              fileNames: [],
              reasoning: currentState.reasoning,
              role: "assistant"
            };
        
            console.log('finalMessage', finalMessage);
            
            // Additional check to ensure content is populated
            if (!finalMessage.content && currentState.message.content) {
              console.log('Using content from streaming state instead');
              finalMessage.content = currentState.message.content;
            }
            
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
            
            // Reset streaming state
            setStreamingState({
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
              reasoning: ''
            });
          },
          onStreamStart: () => {
            setStreamingState({
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
              reasoning: ''
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
    }
  }, [chatId, userId, model, setUserChats]);

  return {
    addMessage,
    messages,
    sendMessage,
    setStatus,
    status,
    streamingState
 };
}; 