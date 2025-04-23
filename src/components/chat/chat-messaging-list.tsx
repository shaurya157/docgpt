import { useEffect, useRef } from 'react';

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
  // No changes needed here, logic is handled during map
}

export const ChatMessageList = ({
  messages,
  status,
  streamingState,
  uploadInProgress = false,
  onDocumentUpdate
}: ChatMessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom when messages change if user was already at bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages, status, streamingState]);

  // Also scroll when streaming state changes if already at bottom
  useEffect(() => {
    if ( streamingState?.message?.content) {
      scrollToBottom();
    }
  }, [streamingState?.message?.content]);

  return (
    <div 
      ref={containerRef}
      className="w-full flex-1 overflow-y-auto scroll-smooth whitespace-pre-wrap"
    >
      <div className="mx-auto w-full space-y-2">
        {messages.length === 0 && status !== 'in_progress' && !uploadInProgress ? (
          <div className="flex flex-col items-left justify-left h-full p-4 text-left">
            <h2 className="text-xl font-semibold mb-1">What can I help you write?</h2>
            <p className="text-muted-foreground">
              Give me some context about the document you want to write and I will write a draft for your review.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isLastMessage = index === messages.length - 1;
              return (
                <ChatMessageItem
                  key={message.id}
                  onDocumentUpdate={onDocumentUpdate}
                  isLastMessage={isLastMessage && status !== 'in_progress'} // Only enable buttons on the *final* last message
                  message={message}
                  streamingState={message.id === 'streaming' && status === 'in_progress' ? streamingState : undefined}
                />
              );
            })}

            {status === 'in_progress' && (
              <div className="flex items-start">
                <div className="rounded-xl px-4 py-2 bg-gray-100">
                  <div className="flex items-center space-x-2">
                    <Icons.spinner className="size-4 animate-spin" />
                    <span className="flex items-center text-xs">Thinking<DotAnimation /></span>
                  </div>
                </div>
              </div>
            )}

            {uploadInProgress && (
              <div className="flex justify-start">
                <Button variant="roundedClear" className="ml-2" disabled>
                  <Icons.spinner className="size-5 animate-spin text-black" />
                  <p className="text-xs">Uploading files...</p>
                </Button>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}; 