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
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(true);
  
  const content = streamingState ? streamingState.message.content : message.content;
  const reasoning = streamingState ? streamingState.reasoning : message.reasoning;
  const isProcessingDocument = streamingState ? streamingState.isProcessingDocument : false;
  // Check if document tags are fully present in the content
  const hasCompleteDocumentTags = content?.includes('<Document>') && content?.includes('</Document>');

  const renderMessageContent = () => {
    if (message.role === 'assistant' && content.includes('<Document>')) {
      const messageToUse = {
        ...message,
        content: content // Use the current content which includes streaming content
      };
      const { appending, document, documentTitle, prepending } = parseAssistantResponse(messageToUse);
      return (
        <div className="space-y-4">
          {prepending && <Markdown className="react-markdown text-sm whitespace-normal">{prepending}</Markdown>}
          {isProcessingDocument ? (
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Icons.spinner className="size-3 animate-spin mr-1" />
                <span>Creating document...</span>
              </div>
            ) : (
              <Button
                variant="roundedClear"
                className="h-auto w-auto cursor-pointer rounded-lg bg-black bg-opacity-50 p-2"
                onClick={onDocumentUpdate(document, documentTitle)}
              >
                <div className="flex items-center">
                  <FileText className='h-full w-auto'/>
                  <div className="mx-1 truncate max-w-[200px] text-sm">{documentTitle || 'Document'}</div>
                </div>
              </Button>
            )}
          {appending && <Markdown className="react-markdown text-sm whitespace-normal">{appending}</Markdown>}
        </div>
      );
    }

    // --- Default Finished Item (User message or Assistant w/o doc) --- 
    return (
      <div className="whitespace-normal break-words overflow-hidden">
        <Markdown className="react-markdown text-sm">{content}</Markdown>
        {message.fileNames && message.fileNames.map((fileName) => (
          <div key={fileName} className="flex items-center gap-2">
            <FileText className="size-4" />
            <span className="truncate text-sm">{fileName}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col text-sm w-full ${
        streamingState ? 'items-start' : (message.role === 'user' ? 'items-end' : 'items-start')
      }`}
    >
      <div
        className={`px-3 py-1.5 break-words w-full ${
          streamingState ? 'rounded-xl' : (message.role === 'user' ? 'bg-gray-200 text-black rounded-[5px]' : 'rounded-xl')
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
              <Icons.chevronDown className={`size-3 transform transition-transform ${isReasoningExpanded ? 'rotate-180' : ''}`} />
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