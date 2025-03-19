import { useState, useCallback, useEffect } from 'react';
import { Message } from '@/types';
import { sendChatMessage } from '@/utils/chat-api';
import { storeMessage } from '@/firebase/firestore-dao';
import { toast } from 'sonner';

interface UseChatMessagingProps {
  chatId: string;
  userId: string;
  model: string;
  initialMessages?: Message[];
}

export const useChatMessaging = ({ chatId, userId, model, initialMessages }: UseChatMessagingProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [status, setStatus] = useState<'awaiting_message' | 'in_progress'>('awaiting_message');
  const [streamingMessage, setStreamingMessage] = useState<Message>({
    id: "Thinking...",
    content: "",
    fileNames: [],
    role: "assistant"
  });

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

    await sendChatMessage(
      chatId,
      serializedContent,
      userId,
      model,
      {
        onStreamStart: () => {
          setStreamingMessage({
            id: "Thinking...",
            content: "",
            fileNames: [],
            role: "assistant"
          });
        },
        onChunkReceived: (content: string) => {
          setStreamingMessage(prev => ({
            ...prev,
            content
          }));
        },
        onStreamEnd: async (finalContent: string) => {
          const timestamp = Date.now();
          const finalMessage: Message = {
            id: timestamp.toString(),
            content: finalContent,
            fileNames: [],
            role: "assistant"
          };

          // Store the assistant's message in Firestore
          await storeMessage(chatId, {
            id: timestamp,
            content: finalContent,
            fileNames: [],
            role: "assistant"
          });

          setMessages(prev => [...prev, finalMessage]);
          setStreamingMessage({
            id: "Thinking...",
            content: "",
            fileNames: [],
            role: "assistant"
          });
          setStatus('awaiting_message');
        },
        onError: (error: Error) => {
          toast.error(error.message);
          setStatus('awaiting_message');
        }
      }
    );
  }, [chatId, userId, model]);

  return {
    messages,
    status,
    streamingMessage,
    addMessage,
    sendMessage,
    setStatus
  };
}; 