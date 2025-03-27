import { StreamMessage, StreamMessageType } from './custom-stream';

export class StreamParser {
  private decoder = new TextDecoder();
  private buffer = '';

  public parseChunk(chunk: Uint8Array): StreamMessage[] {
    // Decode the chunk and add it to our buffer
    const text = this.decoder.decode(chunk, { stream: true });
    this.buffer += text;

    // Split by newlines and parse complete messages
    const messages: StreamMessage[] = [];
    const lines = this.buffer.split('\n');
    
    // Keep the last line in the buffer if it's incomplete
    this.buffer = lines[lines.length - 1];

    // Parse complete lines
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (line) {
        try {
          const message = JSON.parse(line) as StreamMessage;
          this.validateMessage(message);
          messages.push(message);
        } catch (error) {
          console.error('Error parsing stream message:', error);
        }
      }
    }

    return messages;
  }

  private validateMessage(message: any): asserts message is StreamMessage {
    if (!message || typeof message !== 'object') {
      throw new Error('Invalid message format');
    }

    if (!this.isValidMessageType(message.type)) {
      throw new Error(`Invalid message type: ${message.type}`);
    }

    if (typeof message.content !== 'string') {
      throw new Error('Message content must be a string');
    }

    if (typeof message.timestamp !== 'number') {
      throw new Error('Message timestamp must be a number');
    }

    if (message.agent !== undefined && typeof message.agent !== 'string') {
      throw new Error('Message agent must be a string if provided');
    }
  }

  private isValidMessageType(type: any): type is StreamMessageType {
    return ['reasoning', 'partial_result', 'system', 'final_result'].includes(type);
  }

  public flush(): StreamMessage[] {
    // Parse any remaining data in the buffer
    const messages: StreamMessage[] = [];
    if (this.buffer.trim()) {
      try {
        const message = JSON.parse(this.buffer) as StreamMessage;
        this.validateMessage(message);
        messages.push(message);
      } catch (error) {
        console.error('Error parsing remaining buffer:', error);
      }
    }
    this.buffer = '';
    return messages;
  }
} 