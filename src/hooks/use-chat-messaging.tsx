import { useCallback, useEffect, useRef, useState } from 'react';

import { TextApi, TRange, TText } from '@udecode/plate';
import { MarkdownPlugin } from '@udecode/plate-markdown';
import { BaseSuggestionPlugin } from '@udecode/plate-suggestion';
import { useEditorRef, usePlateState } from '@udecode/plate/react';
import { nanoid } from 'nanoid';
import { toast } from 'sonner';

import { storeMessage } from '@/firebase/firestore-dao';
import { useCustomContext } from '@/providers/custom-context-provider';
import { useUserDataContext } from '@/providers/user-data-provider';
import { Message, StreamingState } from '@/types';
import { sendChatMessage } from '@/utils/chat-api';
import { parseAssistantResponse } from '@/utils/document-parser';
import { EditBlock, parseEdits } from '@/utils/edit-parser';

export interface SuggestionEdit {
  id: string;
  edit: EditBlock;
}

type MessageWithSuggestions = Message & { suggestions?: SuggestionEdit[] };

interface UseChatMessagingProps {
  chatId: string;
  model: string;
  userId: string;
  initialMessages?: Message[];
}

export const useChatMessaging = ({ chatId, initialMessages, model, userId }: UseChatMessagingProps) => {
  const { setUserChats } = useUserDataContext();
  const { clearCustomContexts, customContexts } = useCustomContext();
  const [messages, setMessages] = useState<MessageWithSuggestions[]>(initialMessages || []);
  const [status, setStatus] = useState<'awaiting_message' | 'in_progress'>('awaiting_message');
  const [readOnly, setReadOnly] = usePlateState('readOnly');
  const editorRef = useEditorRef();
  const [streamingState, setStreamingState] = useState<StreamingState>({
    document: {
      content: '',
      isStreaming: false
    },
    isProcessingDocument: false,
    isProcessingEdit: false,
    message: {
      id: 'streaming',
      content: '',
      fileNames: [],
      role: 'assistant'
    },
    reasoning: ''
  });
  
  const streamingStateRef = useRef<StreamingState>(streamingState);
  const lastUpdateTimeRef = useRef<number>(0);
  const pendingDocUpdateRef = useRef<string | null>(null);

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

    await storeMessage(chatId, {
      id: timestamp,
      content: content.trim(),
      fileNames,
      role: 'user'
    });

    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const applyEditsAsSuggestions = useCallback(async (suggestions: SuggestionEdit[]) => {
    const suggestionOptions = editorRef.getOptions(BaseSuggestionPlugin);
    const currentUserId = suggestionOptions?.currentUserId || 'placeholder-user';
    editorRef.tf.withoutNormalizing(() => {
      suggestions.forEach(({ id, edit }) => {
        const textNodes = Array.from(editorRef.api.nodes<TText>({ at: [], match: (n): n is TText => TextApi.isText(n) }));
        let foundRange: TRange | null = null;
        let path: number[] | null = null;
        let startOffset = -1;

        for (const [node, nodePath] of textNodes) {
          const index = node.text.indexOf(edit.original);
          if (index !== -1) {
            path = nodePath;
            startOffset = index;
            foundRange = {
              anchor: { offset: index, path: nodePath },
              focus: { offset: index + edit.original.length, path: nodePath },
            };
            break;
          }
        }

        if (foundRange && path !== null && startOffset !== -1) {
          try {
            editorRef.tf.select(foundRange);
            editorRef.tf.setNodes<TText>(
              {
                [`suggestion_${id}`]: {
                  id: id,
                  createdAt: Date.now(),
                  type: 'remove',
                  userId: currentUserId,
                },
                suggestion: true,
              },
              { at: foundRange, split: true, match: (n): n is TText => TextApi.isText(n) }
            );

            editorRef.tf.collapse({ edge: 'focus' });
            editorRef.tf.insertNodes<TText>(
              {
                [`suggestion_${id}`]: {
                  id: id,
                  createdAt: Date.now(),
                  type: 'insert',
                  userId: currentUserId,
                },
                suggestion: true,
                 text: edit.newText,
              },
              { select: false }
            );

            editorRef.tf.deselect();

          } catch (error) {
             console.error(`Error applying suggestion ${id} for edit:`, edit, error);
             toast.error(`Failed to apply suggestion for: "${edit.original}"`);
          }
        } else {
           console.warn(`Could not find text to apply suggestion for: "${edit.original}"`);
           toast.warning(`Could not apply suggestion for: "${edit.original}". Original text may have changed.`);
        }
      });
    });
  }, [editorRef]);

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
        customContexts,
        chatId,
        serializedContent,
        userId,
        model,
        {
          onError: (error: Error) => {
            toast.error(error.message);
            setStatus('awaiting_message');
            setMessages(prev => prev.filter(m => m.id !== 'streaming'));
            setStreamingState({
              document: { content: '', isStreaming: false },
              isProcessingDocument: false,
              isProcessingEdit: false,
              message: { id: 'streaming', content: '', fileNames: [], role: 'assistant' },
              reasoning: ''
            });
          },
          onStateUpdate: (newStateUpdate: Pick<StreamingState, 'isProcessingDocument' | 'isProcessingEdit' | 'message' | 'reasoning'>) => {
            setStreamingState(prevState => {
              const nextState: StreamingState = {
                document: prevState.document,
                isProcessingDocument: newStateUpdate.isProcessingDocument,
                isProcessingEdit: newStateUpdate.isProcessingEdit,
                message: newStateUpdate.message,
                reasoning: newStateUpdate.reasoning,
              };

              if (nextState.isProcessingDocument) {
                const docRegex = /<Document>([\s\S]*)/;
                const match = nextState.message.content.match(docRegex);
                if (match && match[1]) {
                  let partialDocContent = match[1];
                  partialDocContent = partialDocContent.replace(/<\/Document>[\s\S]*$/, '');
                  
                  pendingDocUpdateRef.current = partialDocContent;
                }
              }

              return nextState;
            });
          },
          onStreamEnd: async (finalContent: string) => {
            clearCustomContexts();
            const currentState = streamingStateRef.current;
            const timestamp = Date.now();
            let finalDocumentContent = '';
            let isDocumentPresent = false;
            let generatedSuggestions: SuggestionEdit[] = [];

            if (finalContent.includes('<Document>')) {
              isDocumentPresent = true;
              const { document } = parseAssistantResponse({ 
                id: 'temp', 
                content: finalContent, 
                fileNames: [], 
                role: 'assistant'
              });
              finalDocumentContent = document;
              const deserializedNodes = editorRef.getApi(MarkdownPlugin).markdown.deserialize(document);
              editorRef.tf.setValue(deserializedNodes);
            }

            if (finalContent.includes('<Edit>')) {
              try {
                  const parsedEditBlocks = parseEdits(finalContent);
                  generatedSuggestions = parsedEditBlocks.map(edit => ({
                      id: nanoid(),
                      edit: edit,
                  }));
                  console.log("Generated suggestions:", generatedSuggestions);
              } catch (error) {
                  console.error("Error parsing edits:", error);
                  toast.error("Failed to parse edits from the response.");
              }
            }

            const finalMessage: MessageWithSuggestions = {
              id: timestamp.toString(),
              content: finalContent,
              fileNames: [],
              reasoning: currentState.reasoning,
              role: "assistant",
              suggestions: generatedSuggestions,
            };

            setStatus('awaiting_message');

            await storeMessage(chatId, {
              id: timestamp,
              content: finalMessage.content,
              fileNames: [],
              reasoning: currentState.reasoning,
              role: "assistant",
            });

            setMessages(prev => prev.map(m =>
              m.id === 'streaming' ? finalMessage : m
            ));

            setUserChats(prevChats => {
              if (!prevChats) return prevChats;
              return prevChats.map(chat => {
                if (chat.id === chatId) {
                  const messagesWithoutStreaming = chat.messages?.filter(m => m.id !== 'streaming') || [];
                  return {
                    ...chat,
                    messages: [...messagesWithoutStreaming, finalMessage]
                  };
                }
                return chat;
              });
            });

            if (generatedSuggestions.length > 0) {
               await applyEditsAsSuggestions(generatedSuggestions);
            }

            setStreamingState({
              document: {
                content: finalDocumentContent,
                isStreaming: false
              },
              isProcessingDocument: false,
              isProcessingEdit: false,
              message: { id: 'streaming', content: '', fileNames: [], role: 'assistant' },
              reasoning: ''
            });
            setReadOnly(false);
          },
          onStreamStart: () => {
            setReadOnly(true);
            lastUpdateTimeRef.current = 0;
            pendingDocUpdateRef.current = null;
            setStreamingState({
              document: { content: '', isStreaming: true },
              isProcessingDocument: false,
              isProcessingEdit: false,
              message: { id: 'streaming', content: '', fileNames: [], role: 'assistant' },
              reasoning: ''
            });
          }
        }
      );
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast.error('Failed to send message');
      setStatus('awaiting_message');
      setMessages(prev => prev.filter(m => m.id !== 'streaming'));
      setStreamingState({
        document: { content: '', isStreaming: false },
        isProcessingDocument: false,
        isProcessingEdit: false,
        message: { id: 'streaming', content: '', fileNames: [], role: 'assistant' },
        reasoning: ''
      });
    }
  }, [chatId, userId, model, setUserChats, editorRef, customContexts, clearCustomContexts, applyEditsAsSuggestions]);

  return {
    addMessage,
    messages,
    sendMessage,
    setStatus,
    status,
    streamingState
 };
}; 