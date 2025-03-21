import Markdown from 'react-markdown';

import { FileText } from 'lucide-react';

import { Button } from '@/components/plate-ui/button';
import { Message } from '@/types';
import { parseAssistantResponse } from '@/utils/document-parser';

interface ChatMessageItemProps {
  message: Message;
  onDocumentUpdate: (document: string, documentTitle: string) => () => Promise<void>;
}

export const ChatMessageItem = ({ message, onDocumentUpdate }: ChatMessageItemProps) => {
  const renderMessageContent = () => {
    if (message.role !== 'user' && message.content.includes('<Document>')) {
      const { appending, document, documentTitle, prepending } = parseAssistantResponse(message);

      return (
        <div className="space-y-4">
          <div className="whitespace-normal">{prepending}</div>
          <Button
            variant="roundedClear"
            className="inline-block w-auto cursor-pointer rounded-lg bg-black bg-opacity-50 p-2"
            onClick={onDocumentUpdate(document, documentTitle)}
          >
            <div className="flex height-20">
              <FileText style={{ height: '100%' }}/>
              <div className="mx-1">{documentTitle}</div>
            </div>
          </Button>
          <div className="whitespace-normal">{appending}</div>
        </div>
      );
    }

    return (
      <div className="whitespace-pre-wrap">
        <Markdown className="react-markdown">{message.content}</Markdown>
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
      className={`flex text-sm ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`rounded-xl px-4 py-2 ${
          message.role === 'user' ? 'bg-gray-200 text-black' : ''
        }`}
      >
        {renderMessageContent()}
      </div>
    </div>
  );
}; 