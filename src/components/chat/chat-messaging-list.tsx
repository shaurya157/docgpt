import { useRef, useEffect } from 'react';
import { Message } from '@/types';
import { Icons } from '@/components/icons';
import { DotAnimation } from '@/utils/animations';
import { Button } from '@/components/plate-ui/button';
import { ChatMessageItem } from './chat-messaging-item';

interface ChatMessageListProps {
  messages: Message[];
  streamingMessage: Message;
  streamingDocument: boolean;
  status: 'awaiting_message' | 'in_progress';
  uploadInProgress: boolean;
  onDocumentUpdate: (document: string, documentTitle: string) => () => Promise<void>;
}

export const ChatMessageList = ({
  messages,
  streamingMessage,
  streamingDocument,
  status,
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
            message={message}
            onDocumentUpdate={onDocumentUpdate}
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
            message={streamingMessage}
            onDocumentUpdate={onDocumentUpdate}
          />
        )}

        {status === 'in_progress' && streamingMessage.content === "" && (
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