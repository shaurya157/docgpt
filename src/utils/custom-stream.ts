export type StreamMessageType = 'reasoning' | 'partial_result' | 'system' | 'final_result';

export interface StreamMessage {
  type: StreamMessageType;
  content: string;
  agent?: string;
  timestamp: number;
}

export class CustomStreamController {
  private encoder = new TextEncoder();
  private controller: ReadableStreamDefaultController<Uint8Array>;
  private stream: ReadableStream<Uint8Array>;
  private isClosed = false;

  constructor() {
    this.stream = new ReadableStream({
      start: (controller) => {
        this.controller = controller;
      },
      cancel: () => {
        // Only close if not already closed
        this.closeStream();
      },
    });
  }

  private writeToStream(message: StreamMessage) {
    try {
        if (this.isClosed) {
            return;
        } else {
            // Convert message to NDJSON format
            const jsonString = JSON.stringify(message) + '\n';
            const chunk = this.encoder.encode(jsonString);
            this.controller.enqueue(chunk);
        }
    } catch (error) {
      console.error('Error writing to stream:', error);
      this.closeStream();
    }
  }

  private closeStream() {
    if (!this.isClosed) {
      try {
        this.controller.close();
        this.isClosed = true;
      } catch (error) {
        console.error('Error closing stream:', error);
      }
    }
  }

  public writeReasoning(content: string, agent: string) {
    this.writeToStream({
      type: 'reasoning',
      content,
      agent,
      timestamp: Date.now(),
    });
  }

  public writeSystemMessage(content: string) {
    this.writeToStream({
      type: 'system',
      content,
      timestamp: Date.now(),
    });
  }

  public writePartialResult(content: string) {
    this.writeToStream({
      type: 'partial_result',
      content,
      timestamp: Date.now(),
    });
  }

  public writeFinalResult(content: string) {
    this.writeToStream({
      type: 'final_result',
      content,
      timestamp: Date.now(),
    });
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
          type,
          content: text,
          timestamp: Date.now(),
        };

        yield this.encoder.encode(JSON.stringify(message) + '\n');
      }
    } catch (error) {
      console.error('Error in external stream:', error);
      const errorMessage: StreamMessage = {
        type: 'system',
        content: 'Error processing external stream',
        timestamp: Date.now(),
      };
      yield this.encoder.encode(JSON.stringify(errorMessage) + '\n');
    } finally {
      reader.releaseLock();
    }
  }
} 