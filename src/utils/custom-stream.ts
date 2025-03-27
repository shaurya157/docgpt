export interface StreamMessage {
  content: string;
  timestamp: number;
  type: StreamMessageType;
  agent?: string;
}

export type StreamMessageType = 'final_result' | 'partial_result' | 'reasoning' | 'system';

export class CustomStreamController {
  private controller: ReadableStreamDefaultController<Uint8Array>;
  private encoder = new TextEncoder();
  private isClosed = false;
  private stream: ReadableStream<Uint8Array>;

  constructor() {
    this.stream = new ReadableStream({
      cancel: () => {
        // Only close if not already closed
        this.closeStream();
      },
      start: (controller) => {
        this.controller = controller;
      },
    });
  }

  private closeStream() {
    if (!this.isClosed && this.controller) {
        try {
            this.controller.close();
        } catch (error) {
            console.debug('Error while closing stream (may already be closed):', error);
        } finally {
            this.isClosed = true;
        }
    }
  }

  private writeToStream(message: StreamMessage) {
    try {
        // Check if stream is closed or controller is not available
        if (this.isClosed || !this.controller) {
            return;
        }

        // Convert message to NDJSON format
        const jsonString = JSON.stringify(message) + '\n';
        const chunk = this.encoder.encode(jsonString);
        
        try {
            this.controller.enqueue(chunk);
        } catch (enqueueError) {
            // If enqueue fails, the stream is likely closed
            console.debug('Failed to enqueue chunk, stream may be closed:', enqueueError);
            this.closeStream();
            return;
        }
    } catch (error) {
        console.error('Error writing to stream:', error);
        this.closeStream();
    }
  }

  public close() {
    this.closeStream();
  }

  public getStream(): ReadableStream<Uint8Array> {
    return this.stream;
  }

  // Helper method to wrap external streams (like from OpenAI) into our format
  public async *wrapExternalStream(
    stream: ReadableStream<Uint8Array>,
    type: StreamMessageType = 'partial_result'
  ): AsyncGenerator<Uint8Array> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done || this.isClosed) break;

        const text = decoder.decode(value);
        const message: StreamMessage = {
          content: text,
          timestamp: Date.now(),
          type,
        };

        yield this.encoder.encode(JSON.stringify(message) + '\n');
      }
    } catch (error) {
      console.error('Error in external stream:', error);
      const errorMessage: StreamMessage = {
        content: 'Error processing external stream',
        timestamp: Date.now(),
        type: 'system',
      };
      yield this.encoder.encode(JSON.stringify(errorMessage) + '\n');
    } finally {
      reader.releaseLock();
    }
  }

  public writeFinalResult(content: string) {
    this.writeToStream({
      content,
      timestamp: Date.now(),
      type: 'final_result',
    });
  }

  public writePartialResult(content: string) {
    this.writeToStream({
      content,
      timestamp: Date.now(),
      type: 'partial_result',
    });
  }

  public writeReasoning(content: string, agent: string) {
    this.writeToStream({
      agent,
      content,
      timestamp: Date.now(),
      type: 'reasoning',
    });
  }

  public writeSystemMessage(content: string) {
    this.writeToStream({
      content,
      timestamp: Date.now(),
      type: 'system',
    });
  }
} 