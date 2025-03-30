import { toast } from 'sonner';

import { StreamingState } from '@/types';

import { StreamMessage } from './custom-stream';
import { StreamParser } from './parse-stream';

interface StreamCallbacks {
  onError: (error: Error) => void;
  onStateUpdate: (state: StreamingState) => void;
  onStreamEnd: (finalContent: string) => void;
  onStreamStart: () => void;
}

export const sendChatMessage = async (
  chatId: string,
  messages: string,
  userId: string,
  model: string,
  callbacks: StreamCallbacks
) => {
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  
  try {
    const result = await fetch('/api/ai/chat/agents', {
      body: JSON.stringify({
        chatId,
        messages,
        model,
        userId
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!result.ok) {
      throw new Error(`HTTP error! status: ${result.status}`);
    }

    if (result.body == null) {
      throw new Error('The response body is empty.');
    }

    reader = result.body.getReader();
    const streamParser = new StreamParser();
    let accumulatedContent = '';
    const newState: StreamingState = {
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
    };

    callbacks.onStreamStart();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // Process any remaining buffered content
        const remainingMessages = streamParser.flush();
        processMessages(remainingMessages, newState, callbacks, (content) => {
          accumulatedContent = content;
        });
        callbacks.onStreamEnd(accumulatedContent);
        break;
      }

      const messages = streamParser.parseChunk(value);
      processMessages(messages, newState, callbacks, (content) => {
        accumulatedContent = content;
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    callbacks.onError(new Error(`Stream error: ${errorMessage}`));
    toast.error(`Error: ${errorMessage}`);
  } finally {
    // Clean up the reader if it exists
    if (reader) {
      try {
        await reader.cancel();
      } catch (error) {
        console.error('Error canceling reader:', error);
      }
    }
  }
};

function processMessages(
  messages: StreamMessage[],
  state: StreamingState,
  callbacks: StreamCallbacks,
  onContentUpdate?: (content: string) => void
) {
  let hasUpdates = false;
  const newState = { ...state };
  let tempDocumentContent = newState.document.content;  // Store document content temporarily
  for (const message of messages) {
    try {
      switch (message.type) {
        case 'final_result':
          newState.message.content = message.content;
          hasUpdates = true;
          onContentUpdate?.(newState.message.content);
          break;

        case 'partial_result':
          // Accumulate content first
          const currentContent = message.content;
          
          // Check if we're already streaming a document
          if (newState.document.isStreaming) {
            // Check if this chunk contains the closing tag
            if (currentContent.includes('</Document>')) {
              const [documentContent, appendContent] = currentContent.split('</Document>');
              if (documentContent) {
                tempDocumentContent += documentContent;
              }
              if (appendContent) {
                newState.message.content += appendContent;
              }
              newState.document.isStreaming = false;
              // Only set the document content when streaming is complete
              newState.document.content = tempDocumentContent;
              newState.message.content = tempDocumentContent; // Also update message content
            } else {
              // Still in document, append to temporary content
              tempDocumentContent += currentContent;
            }
          } else {
            // Not currently streaming a document, check for opening tag
            if (currentContent.includes('<')) {
              let parts;
              if (currentContent.includes('<Document')) {
                parts = currentContent.split('<Document');
              } else {
                parts = currentContent.split('<');
              }
              
              if (parts[0]) {
                newState.message.content += parts[0];
              }
              if (parts[1]) {
                tempDocumentContent = parts[1];
                if (!currentContent.includes('<Document')) {
                  tempDocumentContent = 'Document' + tempDocumentContent;
                }
              }
              newState.document.isStreaming = true;
            } else {
              // Regular content
              newState.message.content += currentContent;
            }
          }
          hasUpdates = true;
          onContentUpdate?.(newState.message.content);
          break;

        case 'reasoning':
          newState.reasoning = newState.reasoning + message.content;
          hasUpdates = true;
          break;

        case 'system':
          newState.reasoning = newState.reasoning + `[System] ${message.content}\n`;
          hasUpdates = true;
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
      callbacks.onError(new Error('Error processing stream message'));
    }
  }

  // Only trigger state update if there were actual changes
  if (hasUpdates) {
    callbacks.onStateUpdate({ ...newState });
  }
} 