import { toast } from 'sonner';

interface StreamCallbacks {
  onChunkReceived: (content: string) => void;
  onStreamStart: () => void;
  onStreamEnd: (finalContent: string) => void;
  onError: (error: Error) => void;
}

export const sendChatMessage = async (
  chatId: string,
  messages: string,
  userId: string,
  model: string,
  callbacks: StreamCallbacks
) => {
  try {
    const result = await fetch('/api/ai/chat/agents', {
      body: JSON.stringify({
        chatId,
        messages,
        userId,
        model
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (result.body == null) {
      throw new Error('The response body is empty.');
    }

    const reader = result.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedContent = '';

    callbacks.onStreamStart();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        callbacks.onStreamEnd(accumulatedContent);
        break;
      }

      // Decode the chunk and update the streaming message
      const chunk = decoder.decode(value, { stream: true });

      // Split by newlines to handle multiple JSON objects in a single chunk
      const jsonStrings = chunk.split('\n').filter(str => str.trim() !== '');

      for (const jsonStr of jsonStrings) {
        try {
          const jsonChunk = JSON.parse(jsonStr);
          // Extract only the content from the delta field if it exists
          if (jsonChunk.choices && jsonChunk.choices[0]?.delta?.content) {
            accumulatedContent += jsonChunk.choices[0].delta.content;
            callbacks.onChunkReceived(accumulatedContent);
          }
        } catch (e) {
          // If not valid JSON, skip this part
          console.warn("Failed to parse JSON chunk:", e);
        }
      }
    }
  } catch (error) {
    callbacks.onError(error);
    toast.error(error.message);
  }
}; 