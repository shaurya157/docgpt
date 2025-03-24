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
  const [streamingDocument, setStreamingDocument] = useState(false);
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
          // Check if we're starting to receive a document
          if (content.includes('<Document>') && !streamingDocument) {
            setStreamingDocument(true);
            // Extract any content before the document tag
            const prependContent = content.split('<Document>')[0];
            setStreamingMessage(prev => ({
              ...prev,
              content: prependContent
            }));
            return;
          }

          // Check if we've finished receiving a document
          if (content.includes('</Document>') && streamingDocument) {
            setStreamingDocument(false);
            // Extract any content after the document tag
            const parts = content.split('</Document>');
            if (parts[1]) {
              setStreamingMessage(prev => ({
                ...prev,
                content: prev.content + parts[1]
              }));
            }
            return;
          }

          // If we're not in document streaming mode, update message normally
          if (!streamingDocument) {
            setStreamingMessage(prev => ({
              ...prev,
              content
            }));
          }
        },
        onError: (error: Error) => {
          toast.error(error.message);
          setStatus('awaiting_message');
          setStreamingDocument(false);
        },
        onStreamEnd: async (finalContent: string) => {
          const timestamp = Date.now();
          const finalMessage: Message = {
            id: timestamp.toString(),
            content: finalContent, // Remove document content from chat
            fileNames: [],
            role: "assistant"
          };

          // Store the assistant's message in Firestore
          await storeMessage(chatId, {
            id: timestamp,
            content: finalMessage.content,
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
          setStreamingDocument(false);
        },
        onStreamStart: () => {
          setStreamingMessage({
            id: "Thinking...",
            content: "",
            fileNames: [],
            role: "assistant"
          });
          setStreamingDocument(false);
        }
      }
    );
  }, [chatId, userId, model, streamingDocument]);

  return {
    addMessage,
    messages,
    sendMessage,
    setStatus,
    status,
    streamingMessage,
    streamingDocument
  };
}; 