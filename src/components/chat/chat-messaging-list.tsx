import { useEffect, useRef } from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/plate-ui/button';
import { Message } from '@/types';
import { DotAnimation } from '@/utils/animations';

import { ChatMessageItem } from './chat-messaging-item';

interface ChatMessageListProps {
  messages: Message[];
  status: 'awaiting_message' | 'in_progress';
  streamingDocument: boolean;
  streamingMessage: Message;
  uploadInProgress: boolean;
  onDocumentUpdate: (document: string, documentTitle: string) => () => Promise<void>;
}

export const ChatMessageList = ({
  messages,
  status,
  streamingDocument,
  streamingMessage,
  uploadInProgress,
  onDocumentUpdate
}: ChatMessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="w-full flex-1 overflow-y-auto scroll-smooth whitespace-pre-wrap">
      <div className="mx-auto w-full space-y-6">
        {messages.map((message) => (
          <ChatMessageItem
            key={message.id}
            onDocumentUpdate={onDocumentUpdate}
            message={message}
          />
        ))}

        {streamingDocument ? (
          <div className="flex justify-start">
            <Button variant="roundedClear" className="ml-2" disabled>
              <Icons.spinner className="size-5 animate-spin text-black" />
              <p>Creating document...</p>
            </Button>
          </div>
        ) : null}

        {streamingMessage.content !== '' && (
          <ChatMessageItem
            onDocumentUpdate={onDocumentUpdate}
            message={streamingMessage}
          />
        )}

        {status === 'in_progress' && streamingMessage.content === "" && !streamingDocument && (
          <span className="flex gap-x-2 text-white">
            <Icons.spinner className="size-5 animate-spin text-black" />
            <p className="text-black">
              {uploadInProgress ? 'Uploading files...' : 'Thinking...'}
            </p>
            <DotAnimation />
          </span>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}; 