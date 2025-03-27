import { toast } from 'sonner';
import { StreamMessage } from './custom-stream';
import { StreamParser } from './parse-stream';
import { StreamingState } from '@/types';

interface StreamCallbacks {
  onStateUpdate: (state: StreamingState) => void;
  onError: (error: Error) => void;
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
      message: {
        id: 'streaming',
        content: '',
        fileNames: [],
        role: 'assistant'
      },
      reasoning: '',
      document: {
        isStreaming: false,
        content: ''
      }
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

  for (const message of messages) {
    try {
      switch (message.type) {
        case 'reasoning':
          newState.reasoning = newState.reasoning + message.content;
          hasUpdates = true;
          break;

        case 'system':
          newState.reasoning = newState.reasoning + `[System] ${message.content}\n`;
          hasUpdates = true;
          break;

        case 'partial_result':
          // Check for document tags
          if (message.content.includes('<Document>') && !newState.document.isStreaming) {
            newState.document.isStreaming = true;
            const [prependContent, documentContent] = message.content.split('<Document>');
            newState.message.content += prependContent;
            if (documentContent) {
              newState.document.content = documentContent;
            }
          } else if (message.content.includes('</Document>') && newState.document.isStreaming) {
            newState.document.isStreaming = false;
            const [documentContent, appendContent] = message.content.split('</Document>');
            if (documentContent) {
              newState.document.content += documentContent;
            }
            if (appendContent) {
              newState.message.content += appendContent;
            }
          } else if (newState.document.isStreaming) {
            newState.document.content += message.content;
          } else {
            newState.message.content += message.content;
          }
          hasUpdates = true;
          onContentUpdate?.(newState.message.content);
          break;

        case 'final_result':
          newState.message.content = message.content;
          hasUpdates = true;
          onContentUpdate?.(newState.message.content);
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