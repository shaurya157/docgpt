import { useEffect, useRef, useState } from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/plate-ui/button';
import { Message, StreamingState } from '@/types';
import { DotAnimation } from '@/utils/animations';

import { ChatMessageItem } from './chat-messaging-item';

interface ChatMessageListProps {
  messages: Message[];
  status: 'awaiting_message' | 'in_progress';
  streamingState: StreamingState;
  onDocumentUpdate: (document: string, documentTitle: string) => () => Promise<void>;
  uploadInProgress?: boolean;
}

export const ChatMessageList = ({
  messages,
  status,
  streamingState,
  uploadInProgress = false,
  onDocumentUpdate
}: ChatMessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingState]);

  const showThinkingIndicator = status === 'in_progress' && 
    !streamingState.message.content && 
    !streamingState.document.isStreaming;

  const showDocumentCreationIndicator = streamingState.document.isStreaming;

  return (
    <div className="w-full flex-1 overflow-y-auto scroll-smooth whitespace-pre-wrap">
      <div className="mx-auto w-full space-y-6">
        {messages.map((message) => (
          <ChatMessageItem
            key={message.id}
            onDocumentUpdate={onDocumentUpdate}
            message={message}
            streamingState={message.id === 'streaming' ? streamingState : undefined}
          />
        ))}

        {showThinkingIndicator && (
          <div className="flex items-start">
            <div className="rounded-xl px-4 py-2 bg-gray-100">
              <div className="flex items-center space-x-2">
                <Icons.spinner className="size-4 animate-spin" />
                <span className="flex items-center">Thinking<DotAnimation /></span>
              </div>
            </div>
          </div>
        )}

        {showDocumentCreationIndicator && (
          <div className="flex justify-start">
            <Button variant="roundedClear" className="ml-2" disabled>
              <Icons.spinner className="size-5 animate-spin text-black" />
              <p>Creating document...</p>
            </Button>
          </div>
        )}

        {uploadInProgress && (
          <div className="flex justify-start">
            <Button variant="roundedClear" className="ml-2" disabled>
              <Icons.spinner className="size-5 animate-spin text-black" />
              <p>Uploading files...</p>
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}; 