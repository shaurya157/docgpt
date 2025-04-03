import { toast } from 'sonner';

import { StreamingState } from '@/types';

import { StreamMessage } from './custom-stream';
import { StreamParser } from './parse-stream';

interface StreamCallbacks {
  onError: (error: Error) => void;
  onStateUpdate: (state: Pick<StreamingState, 'message' | 'reasoning' | 'isProcessingDocument'>) => void;
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
    const internalState: Pick<StreamingState, 'message' | 'reasoning' | 'isProcessingDocument'> = {
      message: {
        id: 'streaming',
        content: '',
        fileNames: [],
        role: 'assistant'
      },
      reasoning: '',
      isProcessingDocument: false
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
  state: Pick<StreamingState, 'message' | 'reasoning' | 'isProcessingDocument'>,
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
      message: { ...state.message },
      reasoning: currentReasoning,
      isProcessingDocument: state.isProcessingDocument
    });
    if (state.isProcessingDocument && state.message.content.includes('</Document>')) {
        state.isProcessingDocument = false;
    }
  }
} 