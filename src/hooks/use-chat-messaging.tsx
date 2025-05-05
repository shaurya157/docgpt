import { useCallback, useEffect, useRef, useState } from 'react';

// Import types from plate (using type-only imports where applicable)
import type { TElement, TNode, TRange } from '@udecode/plate';

import { ElementApi, TextApi, TText } from '@udecode/plate'; // Keep runtime imports for things used as values (TText for instance checks if needed, TextApi for .isText)
import { MarkdownPlugin } from '@udecode/plate-markdown';
import { BaseSuggestionPlugin } from '@udecode/plate-suggestion';
import { SuggestionPlugin } from '@udecode/plate-suggestion/react';
import { useEditorRef, usePlateState } from '@udecode/plate/react';
import { nanoid } from 'nanoid';
import { toast } from 'sonner';

import { storeMessage } from '@/firebase/firestore-dao';
import { useCustomContext } from '@/providers/custom-context-provider';
import { useUserDataContext } from '@/providers/user-data-provider';
import { Message, StreamingState } from '@/types';
import { sendChatMessage } from '@/utils/chat-api';
import { parseAssistantResponse } from '@/utils/document-parser';
import { EditBlock, parseEdits } from '@/utils/edit-utils';

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
    editorRef.setOption(SuggestionPlugin, 'isSuggesting', true);
    const suggestionOptions = editorRef.getOptions(BaseSuggestionPlugin);
    const currentUserId = suggestionOptions?.currentUserId || 'placeholder-user';

    // --- Recursive Text Extraction Helpers ---
    const getTextRecursively = (node: TNode): string => {
      if (TextApi.isText(node)) {
        return node.text ?? ''; // Handle potentially null/undefined text
      }
      // Use ElementApi as requested by user for type guard
      if (ElementApi.isElement(node) && Array.isArray(node.children)) {
        // Join children's text content directly, preserving inline concatenation
        return (node.children as TNode[]).map(getTextRecursively).join('');
      }
      return '';
    };

    const getNodesString = (nodes: TNode[]): string => {
       // Map over the top-level nodes, get text recursively for each, and join with '\n' for block separation.
       const result = nodes.map(getTextRecursively).join('\n');
       return result;
    };
    // --- End Helpers ---


    editorRef.tf.withoutNormalizing(() => {
      suggestions.forEach(({ id, edit }) => {
        let foundRange: TRange | null = null;
        const trimmedOriginal = edit.original.trim();
        const trimmedNewText = edit.newText.trim();

        const markdownApi = editorRef.getApi(MarkdownPlugin).markdown;

        // 1. Verify Markdown Match
        const currentEditorMarkdown = markdownApi.serialize();
        const markdownMatchIndex = currentEditorMarkdown.indexOf(trimmedOriginal);
        if (markdownMatchIndex !== -1) {
          // 2. Find Plain Text Range
          try {
            // originalNodes is TDescendant[] which is TNode[]
            const originalNodes = markdownApi.deserialize(trimmedOriginal);
            const originalPlainText = getNodesString(originalNodes); // Use new helper

            // Get current editor plain text using new helper on editor children
            const currentPlainText = getNodesString(editorRef.children);
            const plainTextStartIndex = currentPlainText.indexOf(originalPlainText);

            if (plainTextStartIndex !== -1 && originalPlainText.length > 0) { 
               const plainTextEndIndex = plainTextStartIndex + originalPlainText.length;
               let currentOffset = 0;
               let startPath: number[] | null = null;
               let startNodeOffset = -1;
               let endPath: number[] | null = null;
               let endNodeOffset = -1;
               const separator = '\n'; // Separator used by getNodesString for top-level nodes

               // Iterate through editor *top-level* children to map plain text index to Slate path/offset
               const topLevelNodes = editorRef.children;
               for (let i = 0; i < topLevelNodes.length; i++) {
                 const node = topLevelNodes[i];
                 const path = [i]; // Path for top-level node
                 // Use recursive helper to get string content for the current top-level node
                 const nodeString = getTextRecursively(node);
                 const nodeLength = nodeString.length;
                 const nodeEndOffsetInPlainText = currentOffset + nodeLength;

                 // --- Start/End Path/Offset Calculation (Simplified) ---
                 // TODO: Refine mapping for nested structures.
                 if (startPath === null && plainTextStartIndex >= currentOffset && plainTextStartIndex < nodeEndOffsetInPlainText) {
                    startPath = path;
                    // This offset is relative to the start of this top-level node's plain text
                    startNodeOffset = plainTextStartIndex - currentOffset;
                 }
                 if (endPath === null && plainTextEndIndex > currentOffset && plainTextEndIndex <= nodeEndOffsetInPlainText) {
                    endPath = path;
                    // This offset is relative to the start of this top-level node's plain text
                    endNodeOffset = plainTextEndIndex - currentOffset;
                 }
                  // --- End Simplified Mapping ---


                 if (startPath !== null && endPath !== null) {
                     foundRange = {
                         anchor: { offset: startNodeOffset, path: startPath },
                         focus: { offset: endNodeOffset, path: endPath },
                     };
                   break; // Exit loop once range is found
                 }

                 // Move to the next top-level node's starting offset in the plain text string
                 currentOffset = nodeEndOffsetInPlainText + (i < topLevelNodes.length - 1 ? separator.length : 0);
               }

               // TODO: Revisit edge case handling if necessary

               if (!foundRange){
                   console.warn("Plain text match found, but failed to map back to node paths/offsets correctly (mapping logic might be incomplete).");
               }

            } else if (originalPlainText.length === 0) {
                 console.warn("Original plain text was empty, cannot find range.");
            } else {
               console.warn(`Could not find match for plain text "${originalPlainText}" in current editor plain text.`);
            }

          } catch (error) {
             console.error("Error during plain text range finding:", error);
             toast.error("Error processing edit text to find range.");
          }

        } else {
          console.warn(`Initial Markdown structure match failed for "${trimmedOriginal}". Suggestion cannot be applied.`);
        }

        // --- Apply Suggestion (using foundRange if valid) ---
        if (foundRange) {
          try {
            // WARNING: Applying suggestion with approximate range might lead to unexpected behavior.
            editorRef.tf.select(foundRange);
            editorRef.tf.setNodes<TElement | TText>(
              {
                [`suggestion_${id}`]: { id, createdAt: Date.now(), type: 'remove', userId: currentUserId },
                suggestion: true,
              },
              // Use ElementApi for match as requested
              { at: foundRange, split: true, match: (n): n is TElement | TText => TextApi.isText(n) || ElementApi.isElement(n) }
            );

            editorRef.tf.collapse({ edge: 'focus' });

            let newNodes: (TElement | TText)[] = [];
            try {
                if (trimmedNewText) {
                    const deserialized = markdownApi.deserialize(trimmedNewText);
                     newNodes = Array.isArray(deserialized) ? deserialized : [deserialized];
                }
            } catch (deserializeError) {
                console.error("Error deserializing newText:", edit.newText, deserializeError);
                toast.error(`Failed to deserialize new content for suggestion: "${edit.original}". Inserting as plain text.`);
                newNodes = [{ text: edit.newText }];
            }

            if (newNodes.length > 0) {
                // (Decoration and Insertion logic - map needs helper function)
                const decoratedNodes: (TElement | TText)[] = newNodes.map(node => decorateNode(node, id, currentUserId));
                editorRef.tf.insertNodes(decoratedNodes, { select: false });
            }

            editorRef.tf.deselect();

          } catch (error) {
             console.error(`Error applying suggestion ${id} for edit:`, edit, error);
             toast.error(`Failed to apply suggestion for: "${edit.original}"`);
          }
        } else {
           // (Failure logging - remains the same)
           console.warn(`Could not find text range to apply suggestion for: "${edit.original}" (ID: ${id})...`);
           console.log("Failed edit details:", JSON.stringify(edit));
           if (markdownMatchIndex !== -1) { /* ... */ } else { /* ... */ }
        }
      });
    });
    editorRef.setOption(SuggestionPlugin, 'isSuggesting', false);
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
              try {
                  const deserializedNodes = editorRef.getApi(MarkdownPlugin).markdown.deserialize(document);
                  editorRef.tf.setValue(deserializedNodes);
              } catch(e) {
                 console.error("Error deserializing final document content:", e);
                 toast.error("Failed to update document with final content.");
              }
            }

            if (finalContent.includes('<Edit>')) {
              try {
                  const parsedEditBlocks = parseEdits(finalContent);
                  generatedSuggestions = parsedEditBlocks.map(edit => ({
                      id: nanoid(),
                      edit: edit,
                  }));
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

// Helper function (for decoration logic inside applyEditsAsSuggestions) - needs TElement/TText types
const decorateNode = (node: TNode, id: string, currentUserId: string): TElement | TText => {
  const suggestionProps = {
      [`suggestion_${id}`]: { id, createdAt: Date.now(), type: 'insert', userId: currentUserId },
      suggestion: true,
  };

  if (TextApi.isText(node)) {
      return { ...node, ...suggestionProps, text: node.text ?? '' } as TText;
  } else if (ElementApi.isElement(node)) {
      // Ensure children array exists, even if empty, before mapping
      const children = (node.children && Array.isArray(node.children))
          ? node.children.map(child => decorateNode(child, id, currentUserId)) // Recursively decorate children
          : [];
      return { ...node, ...suggestionProps, children } as TElement;
  }
  // Should ideally not happen with valid TNode, but good practice
  console.warn("Decorating unexpected node type:", node);
  // Return a text node representation as a fallback if needed
  return { text: '[Unexpected Node]', ...suggestionProps } as TText;
}