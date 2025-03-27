import { useState } from 'react';
import Markdown from 'react-markdown';

import { FileText } from 'lucide-react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/plate-ui/button';
import { Message, StreamingState } from '@/types';
import { parseAssistantResponse } from '@/utils/document-parser';

interface ChatMessageItemProps {
  message: Message;
  onDocumentUpdate: (document: string, documentTitle: string) => () => Promise<void>;
  streamingState?: StreamingState;
}

export const ChatMessageItem = ({ message, streamingState, onDocumentUpdate }: ChatMessageItemProps) => {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);
  const content = streamingState ? streamingState.message.content : message.content;
  const reasoning = streamingState ? streamingState.reasoning : message.reasoning;

  const renderMessageContent = () => {
    if (message.role === 'assistant' && content.includes('<Document>')) {
      const { appending, document, documentTitle, prepending } = parseAssistantResponse({
        ...message,
        content
      });

      return (
        <div className="space-y-4">
          <div className="whitespace-normal">{prepending}</div>
          <Button
            variant="roundedClear"
            className="h-auto w-auto cursor-pointer rounded-lg bg-black bg-opacity-50 p-2"
            onClick={onDocumentUpdate(document, documentTitle)}
          >
            <div className="flex items-center">
              <FileText className='h-full w-auto'/>
              <div className="mx-1 truncate max-w-[200px]">{documentTitle}</div>
            </div>
          </Button>
          <div className="whitespace-normal">{appending}</div>
        </div>
      );
    }

    return (
      <div className="whitespace-pre-wrap">
        <Markdown className="react-markdown">{content}</Markdown>
        {message.fileNames && message.fileNames.map((fileName) => (
          <div key={fileName} className="flex items-center gap-2">
            <FileText className="size-5" />
            <span>{fileName}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col text-sm ${
        message.role === 'user' ? 'items-end' : 'items-start'
      }`}
    >
      <div
        className={`rounded-xl px-4 py-2 ${
          message.role === 'user' ? 'bg-gray-200 text-black' : ''
        }`}
      >
        {renderMessageContent()}
        {reasoning && typeof reasoning === 'string' && reasoning.trim() !== '' && (
          <div className="mt-2">
            <Button
              variant="ghost"
              className="flex w-full items-center justify-between p-2 text-sm"
              onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
            >
              <span>View Reasoning</span>
              <Icons.chevronDown className={`size-4 transform transition-transform ${isReasoningExpanded ? 'rotate-180' : ''}`} />
            </Button>
            {isReasoningExpanded && (
              <div className="space-y-2 rounded-md bg-gray-50 p-2 text-sm text-gray-500">
                {reasoning}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 