import { toast } from 'sonner';

import { CustomContextItem } from '@/providers/custom-context-provider';
import { StreamingState } from '@/types';
 
import { StreamMessage } from './custom-stream';
import { StreamParser } from './parse-stream';
interface StreamCallbacks {
  onError: (error: Error) => void;
  // Extend the state update type to include edit processing status
  onStateUpdate: (state: Pick<StreamingState, 'isProcessingDocument' | 'isProcessingEdit' | 'message' | 'reasoning'>) => void;
  onStreamEnd: (finalContent: string) => void;
  onStreamStart: () => void;
}

export const sendChatMessage = async (
  customContexts: CustomContextItem[],
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
        customContexts,
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
    // Include isProcessingEdit in the internal state
    const internalState: Pick<StreamingState, 'isProcessingDocument' | 'isProcessingEdit' | 'message' | 'reasoning'> = {
      isProcessingDocument: false,
      isProcessingEdit: false, // Initialize edit processing state
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
        const remainingMessages = streamParser.flush();
        processMessages(remainingMessages, internalState, callbacks, (content) => {
          accumulatedContent = content;
        });
        callbacks.onStreamEnd(accumulatedContent);
        break;
      }

      const messages = streamParser.parseChunk(value);
      processMessages(messages, internalState, callbacks, (content) => {
        accumulatedContent = content;
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    callbacks.onError(new Error(`Stream error: ${errorMessage}`));
    toast.error(`Error: ${errorMessage}`);
  } finally {
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
  // Update state type to include isProcessingEdit
  state: Pick<StreamingState, 'isProcessingDocument' | 'isProcessingEdit' | 'message' | 'reasoning'>,
  callbacks: StreamCallbacks,
  onContentUpdate?: (content: string) => void
) {
  let hasUpdates = false;
  let currentReasoning = state.reasoning;

  for (const message of messages) {
    try {
      switch (message.type) {
        case 'partial_result':
          const chunkContent = message.content;
          state.message.content += chunkContent;
          
          if (!state.isProcessingDocument && state.message.content.includes('<Document')) {
            state.isProcessingDocument = true;
          }
          // Detect start of edit processing
          if (!state.isProcessingEdit && state.message.content.includes('<Edit>')) {
            state.isProcessingEdit = true;
          }
          hasUpdates = true;
          onContentUpdate?.(state.message.content);
          break;

        case 'reasoning':
          state.reasoning += message.content;
          currentReasoning = state.reasoning;
          hasUpdates = true;
          break;

        case 'system':
          state.reasoning += `[System] ${message.content}\n`;
          currentReasoning = state.reasoning;
          hasUpdates = true;
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
      callbacks.onError(new Error('Error processing stream message'));
    }
  }

  if (hasUpdates) {
    callbacks.onStateUpdate({
      isProcessingDocument: state.isProcessingDocument,
      isProcessingEdit: state.isProcessingEdit, // Pass edit state
      message: { ...state.message },
      reasoning: currentReasoning
    });
    // Reset flags when closing tags appear
    if (state.isProcessingDocument && state.message.content.includes('</Document>')) {
        state.isProcessingDocument = false;
    }
    if (state.isProcessingEdit && state.message.content.includes('</Edit>')) {
        // We might have multiple edits, so don't reset isProcessingEdit until the stream ends.
        // It will be reset in use-chat-messaging onStreamEnd.
        // We just need to know *if* edits were processed.
    }
  }
} 