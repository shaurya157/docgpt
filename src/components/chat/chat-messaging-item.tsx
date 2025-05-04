import { useEffect, useMemo, useRef, useState } from 'react'; // Import useEffect, useMemo, and useRef
import Markdown from 'react-markdown'; // Keep original import if used elsewhere

import { useEditorRef } from '@udecode/plate/react';
import { ArrowRight, FileText, LocateFixed } from 'lucide-react'; // Import Check and X icons

import { Icons } from '@/components/icons';
import { Button } from '@/components/plate-ui/button';
import { Message, StreamingState } from '@/types';
import { parseAssistantResponse } from '@/utils/document-parser';
import { parseEdits } from '@/utils/edit-utils'; // Import edit parser

import { EditContainer } from './edit-container'; // Import the new EditContainer component
 
interface ChatMessageItemProps {
  isLastMessage: boolean; // Add isLastMessage prop
  message: Message;
  onDocumentUpdate: (document: string, documentTitle: string) => () => Promise<void>;
  streamingState?: StreamingState;
}

export const ChatMessageItem = ({ isLastMessage, message, streamingState, onDocumentUpdate }: ChatMessageItemProps) => {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);
  const hasAutoCollapsedReasoning = useRef(false); // Ref to track auto-collapse
  const editor = useEditorRef();
  
  const content = streamingState ? streamingState.message.content : message.content;
  const reasoning = streamingState ? streamingState.reasoning : message.reasoning;
  const isProcessingDocument = streamingState ? streamingState.isProcessingDocument : false;
  const isProcessingEdit = streamingState ? streamingState.isProcessingEdit : false; // Get edit processing state

  // Determine if the main content stream has started (after reasoning)
  const mainContentStreamingStarted = !!streamingState?.message?.content || 
                                        isProcessingDocument || 
                                        isProcessingEdit;

  // Memoize the parsed edits to prevent unnecessary recalculations/effect triggers
  const edits = useMemo(() => {
      // Only parse if content exists and it's likely an assistant message with edits
      // (or potentially during streaming)
      if (content && (message.role === 'assistant' || streamingState)) {
          try {
              return parseEdits(content);
          } catch (error) {
              console.error("Error parsing edits:", error);
              return []; // Return empty array on error
          }
      }
      return []; // Return empty if no content or not applicable
  }, [content, message.role, streamingState]); // Depend on content and role/streaming state

  const hasEdits = edits.length > 0;

  // --- Auto-collapse Reasoning Effect ---
  useEffect(() => {
    // Only run if reasoning exists, main content has started streaming, and we haven't already auto-collapsed
    if (reasoning && mainContentStreamingStarted && !hasAutoCollapsedReasoning.current) {
      setIsReasoningExpanded(false); // Collapse the section
      hasAutoCollapsedReasoning.current = true; // Mark as auto-collapsed for this instance
    }
    // Reset the ref if the reasoning disappears (e.g., for a new message without reasoning)
    if (!reasoning) {
        hasAutoCollapsedReasoning.current = false;
    }
  }, [reasoning, mainContentStreamingStarted]); // Dependencies
  // --- End Auto-collapse Effect ---

  const renderMessageContent = () => {
    // --- Handle Document Rendering ---
    if (message.role === 'assistant' && content.includes('<Document>')) {
      const messageToUse = { ...message, content };
      const { appending, document, documentTitle, prepending } = parseAssistantResponse(messageToUse);
      return (
        <div className="space-y-4">
          {/* Render text BEFORE document tag */}
          {prepending && <Markdown className="react-markdown text-sm whitespace-normal">{prepending}</Markdown>}
          
          {/* Render text AFTER document tag (including the final summary) FIRST */}
          {appending && <Markdown className="react-markdown text-sm whitespace-normal">{appending}</Markdown>}
          
          {/* THEN Render the Checkpoint button if document exists */}
          {isProcessingDocument ? (
            <div className="flex items-center text-xs text-gray-500 mt-1">
              <Icons.spinner className="size-3 animate-spin mr-1" />
              <span>Creating document...</span>
            </div>
          ) : (
            document && (
              <Button
                variant="ghost"
                className="h-auto w-full cursor-pointer rounded-lg bg-black bg-opacity-50 p-2 flex justify-between items-center mt-2" // Added mt-2 for spacing
                onClick={onDocumentUpdate(document, documentTitle)}
              >
                <div className="flex items-center">
                  <LocateFixed className='h-full w-auto'/>
                  <div className="mx-1 text-sm ">Checkpoint</div>
                </div>
                <ArrowRight className='size-4' />
              </Button>
            )
          )}
        </div>
      );
    }

    // --- Handle Edit Rendering ---
    // Case 1 & 2: Edits are being processed or finished
    if (message.role === 'assistant' && (isProcessingEdit || hasEdits)) {
        // Extract text outside of <Edit> tags
        const nonEditContent = isProcessingEdit 
            ? content.split('<Edit>')[0].trim()  // During processing
            : content.replace(/<Edit>[\s\S]*?<\/Edit>/g, '').trim(); // After processing

        return (
            <EditContainer
                editor={editor}
                edits={edits}
                isLastMessage={isLastMessage}
                isProcessingEdit={isProcessingEdit}
                nonEditContent={nonEditContent}
            />
        );
    }

    // --- Default Finished Item (User message or Assistant w/o doc/edits) ---
    // This case now only runs if it's not a document and not processing/has edits
    return (
      <div className="whitespace-normal break-words overflow-hidden">
        {/* Render raw content only if it doesn't contain incomplete/unhandled tags */}
        {/* A simple check, might need refinement depending on edge cases */}
        {!content.includes('<Document>') && !content.includes('<Edit>') &&
           <Markdown className="react-markdown text-sm whitespace-normal">{content}</Markdown>
        }
        {message.fileNames && message.fileNames.map((fileName) => (
          <div key={fileName} className="flex items-center gap-2">
            <FileText className="size-4" />
            <span className="truncate text-sm">{fileName}</span>
          </div>
        ))}
      </div>
    );
  };

  // Define the reasoning block JSX separately
  const reasoningBlock = reasoning && typeof reasoning === 'string' && reasoning.trim() !== '' && (
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
        <div className="space-y-2 rounded-md bg-gray-50 p-2 text-sm text-gray-500 leading-tight">
          <Markdown className="react-markdown text-sm whitespace-normal">{reasoning}</Markdown>
        </div>
      )}
    </div>
  );

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
        {/* Render Reasoning First */} 
        {reasoningBlock} 
        
        {/* Then Render Core Message Content (which includes edits if present) */} 
        {renderMessageContent()}
      </div>
    </div>
  );
}; 