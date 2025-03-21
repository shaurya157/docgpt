import { useCallback, useEffect, useState } from 'react';

import { toast } from 'sonner';

import { storeMessage } from '@/firebase/firestore-dao';
import { Message } from '@/types';
import { sendChatMessage } from '@/utils/chat-api';

interface UseChatMessagingProps {
  chatId: string;
  model: string;
  userId: string;
  initialMessages?: Message[];
}

export const useChatMessaging = ({ chatId, initialMessages, model, userId }: UseChatMessagingProps) => {
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
        onChunkReceived: (content: string) => {
          setStreamingMessage(prev => ({
            ...prev,
            content
          }));
        },
        onError: (error: Error) => {
          toast.error(error.message);
          setStatus('awaiting_message');
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
        onStreamStart: () => {
          setStreamingMessage({
            id: "Thinking...",
            content: "",
            fileNames: [],
            role: "assistant"
          });
        }
      }
    );
  }, [chatId, userId, model]);

  return {
    addMessage,
    messages,
    sendMessage,
    setStatus,
    status,
    streamingMessage
  };
}; 