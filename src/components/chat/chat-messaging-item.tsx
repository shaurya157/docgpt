import { useEffect, useMemo, useState } from 'react'; // Import useEffect and useMemo
import Markdown from 'react-markdown';

import { MarkdownPlugin } from '@udecode/plate-markdown';
import { useEditorRef } from '@udecode/plate/react';
import { ArrowRight, Check, ChevronDown, ChevronRight, FileText, LocateFixed, X } from 'lucide-react'; // Import Check and X icons
import { toast } from 'sonner'; // Import toast

import { Icons } from '@/components/icons';
import { Button } from '@/components/plate-ui/button';
import { cn } from '@/lib/utils'; // Import cn for conditional classes
import { Message, StreamingState } from '@/types';
import { parseAssistantResponse } from '@/utils/document-parser';
import { EditBlock, parseEdits } from '@/utils/edit-parser'; // Import edit parser
 
interface ChatMessageItemProps {
  isLastMessage: boolean; // Add isLastMessage prop
  message: Message;
  onDocumentUpdate: (document: string, documentTitle: string) => () => Promise<void>;
  streamingState?: StreamingState;
}

type EditStatus = 'accepted' | 'pending' | 'rejected';

export const ChatMessageItem = ({ isLastMessage, message, streamingState, onDocumentUpdate }: ChatMessageItemProps) => {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(true);
  const editor = useEditorRef();
  const [editStatuses, setEditStatuses] = useState<{ [key: number]: EditStatus }>({});
  const [isEditExpanded, setIsEditExpanded] = useState<{ [key: number]: boolean }>({}); // State for edit expansion
  
  const content = streamingState ? streamingState.message.content : message.content;
  const reasoning = streamingState ? streamingState.reasoning : message.reasoning;
  const isProcessingDocument = streamingState ? streamingState.isProcessingDocument : false;
  const isProcessingEdit = streamingState ? streamingState.isProcessingEdit : false; // Get edit processing state

  // Memoize the parsed edits to prevent unnecessary recalculations/effect triggers
  const edits: EditBlock[] = useMemo(() => {
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

  // Revised useEffect for initializing/clearing statuses based ONLY on edits
  useEffect(() => {
    // Only proceed if we have edits and it's an assistant message (or streaming potentially adds edits)
    if ((message.role === 'assistant' || streamingState) && hasEdits) {
        const newStatuses: { [key: number]: EditStatus } = {};
        let changed = false;

        // Iterate through current edits
        edits.forEach((_, index) => {
            const currentStatus = editStatuses[index];
            // Keep existing status, default to 'pending' only if it's truly new
            if (currentStatus) {
                newStatuses[index] = currentStatus;
            } else {
                newStatuses[index] = 'pending';
                changed = true; // A new edit was added
            }
        });

        // Ensure only valid keys remain by filtering newStatuses based on edits length
        const currentKeysLength = Object.keys(editStatuses).length;
        const newKeysLength = Object.keys(newStatuses).length;
        Object.keys(newStatuses).forEach(keyStr => {
            const keyIndex = parseInt(keyStr, 10);
            if (keyIndex >= edits.length) {
                delete newStatuses[keyIndex];
                changed = true; // Mark changed as we removed a key
            }
        });
        const finalKeysLength = Object.keys(newStatuses).length;

        // Update state only if statuses were added or removed, or if keys were cleaned up
        if (changed || currentKeysLength !== finalKeysLength ) {
             setEditStatuses(newStatuses);
        }
    } else if (!hasEdits && Object.keys(editStatuses).length > 0) {
      // If there are no edits anymore, clear the statuses
      setEditStatuses({});
    }
    // Depend primarily on the edits array content and whether it has edits
  }, [edits, hasEdits, message.role, streamingState]); // Removed editStatuses, isLastMessage, isProcessingEdit


  // Revised useEffect for initializing/resetting edit expansion state based ONLY on edits
  useEffect(() => {
    // Only proceed if we have edits and it's an assistant message (or streaming potentially adds edits)
     if ((message.role === 'assistant' || streamingState) && hasEdits) {
        const newExpansionStates: { [key: number]: boolean } = {};
        let changed = false;

        // Iterate through current edits
        edits.forEach((_, index) => {
            const currentExpansion = isEditExpanded[index];
            // Keep existing state, default to false (collapsed) only if it's truly new
            if (currentExpansion !== undefined) {
                newExpansionStates[index] = currentExpansion;
            } else {
                newExpansionStates[index] = false; // Default new edits to collapsed
                changed = true; // A new expansion state was added
            }
        });

         // Ensure only valid keys remain
        const currentKeysLength = Object.keys(isEditExpanded).length;
        Object.keys(newExpansionStates).forEach(keyStr => {
            const keyIndex = parseInt(keyStr, 10);
            if (keyIndex >= edits.length) {
                delete newExpansionStates[keyIndex];
                changed = true; // Mark changed as we removed a key
            }
        });
        const finalKeysLength = Object.keys(newExpansionStates).length;

        // Update state only if expansion states were added or removed, or keys cleaned up
        if (changed || currentKeysLength !== finalKeysLength ) {
             setIsEditExpanded(newExpansionStates);
        }
    } else if (!hasEdits && Object.keys(isEditExpanded).length > 0) {
        // If there are no edits anymore, clear the expansion states
        setIsEditExpanded({});
    }
    // Depend primarily on the edits array content and whether it has edits
  }, [edits, hasEdits, message.role, streamingState]); // Removed isEditExpanded, isLastMessage, isProcessingEdit

  // Attempts to apply a single edit block to the editor's current content.
  // Returns true if successful, false otherwise.
  const applySingleEdit = (edit: EditBlock): boolean => {
    let editorMarkdown = editor.getApi(MarkdownPlugin).markdown.serialize();

    if (editorMarkdown.includes(edit.original)) {
      editorMarkdown = editorMarkdown.replace(edit.original, edit.newText);
      const deserializedNodes = editor.getApi(MarkdownPlugin).markdown.deserialize(editorMarkdown);
      editor.tf.setValue(deserializedNodes);
      return true; // Edit applied successfully
    } else {
      console.warn("Edit could not be applied: Original content not found.", edit);
      return false; // Original content not found
    }
  }

  const handleAcceptChange = (index: number) => {
    if (!isLastMessage) return; // Only allow action on the last message
    const edit = edits[index];

    if (applySingleEdit(edit)) {
      setEditStatuses(prev => ({ ...prev, [index]: 'accepted' }));
    } else {
      toast.error(`Edit ${index + 1} could not be applied: Original content has changed.`);
      // Do not change the status, keep it as 'pending' or 'rejected'
    }
  };

  const handleRejectChange = (index: number) => {
    if (!isLastMessage) return; // Only allow action on the last message
    setEditStatuses(prev => ({ ...prev, [index]: 'rejected' }));
  };

  const handleAcceptAll = () => {
    if (!isLastMessage) return;

    let currentEditorMarkdown = editor.getApi(MarkdownPlugin).markdown.serialize();
    const updatedStatuses = { ...editStatuses };
    const successfullyAppliedIndices: number[] = [];
    const failedEditIndices: number[] = [];
    let markdownChanged = false;

    edits.forEach((edit, index) => {
      // Only attempt to accept pending edits
      if (updatedStatuses[index] === 'pending') {
        if (currentEditorMarkdown.includes(edit.original)) {
          // Apply change to the temporary markdown string
          currentEditorMarkdown = currentEditorMarkdown.replace(edit.original, edit.newText);
          updatedStatuses[index] = 'accepted';
          successfullyAppliedIndices.push(index + 1);
          markdownChanged = true; // Mark that we need to update the editor
        } else {
          // Original content not found for this edit
          failedEditIndices.push(index + 1);
          // Status remains 'pending'
          console.warn(`Accept All: Edit ${index + 1} original content not found.`);
        }
      }
    });

    // Update the editor content only if any changes were successfully applied
    if (markdownChanged) {
      const deserializedNodes = editor.getApi(MarkdownPlugin).markdown.deserialize(currentEditorMarkdown);
      editor.tf.setValue(deserializedNodes);
    }

    // Update the status state
    setEditStatuses(updatedStatuses);

    // Show a toast message if any edits failed
    if (failedEditIndices.length > 0) {
      toast.error(`Edits ${failedEditIndices.join(', ')} could not be applied: Original content has changed.`);
    } else if (successfullyAppliedIndices.length > 0) {
        toast.success("Selected edits applied successfully."); // Optional success message
    } else {
        toast.info("No pending edits were applicable."); // Message if nothing could be done
    }
  };

  const handleRejectAll = () => {
    if (!isLastMessage) return;
    const newStatuses: { [key: number]: EditStatus } = {};
    edits.forEach((_, index) => {
      newStatuses[index] = 'rejected';
    });
    setEditStatuses(newStatuses);
  };

  const renderMessageContent = () => {
    // --- Handle Document Rendering ---
    if (message.role === 'assistant' && content.includes('<Document>')) {
      // This logic remains the same as it correctly handles document streaming/display
      const messageToUse = { ...message, content };
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
            // Only show button if document content exists after parsing
            document && (
              <Button
                variant="ghost"
                className="h-auto w-full cursor-pointer rounded-lg bg-black bg-opacity-50 p-2 flex justify-between items-center"
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
          {appending && <Markdown className="react-markdown text-sm whitespace-normal">{appending}</Markdown>}
        </div>
      );
    }

    // --- Handle Edit Rendering ---
    // Case 1: Edits are actively being processed (stream may not have finished)
    if (message.role === 'assistant' && isProcessingEdit) {
        // Extract any text *before* the first <Edit> tag during processing
        const initialNonEditContent = content.split('<Edit>')[0].trim();

        return (
            <div className="space-y-2">
                {/* Render initial non-edit content if it exists */}
                {initialNonEditContent && <Markdown className="react-markdown text-sm whitespace-normal">{initialNonEditContent}</Markdown>}

                {/* Show the "Generating Edits" indicator box */}
                <div className="rounded-md border border-gray-200 bg-gray-50 p-3 mt-2">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">Generating edits...</span>
                        {/* No buttons while processing */}
                    </div>
                </div>
                {/* Avoid rendering content after the edit tag while processing */}
            </div>
        );
    }

    // Case 2: Processing is finished, and we have parsed edits
    if (message.role === 'assistant' && !isProcessingEdit && hasEdits) {
      // Extract text outside of *complete* <Edit> tags now that processing is done
      const finalNonEditContent = content.replace(/<Edit>[\s\S]*?<\/Edit>/g, '').trim();

      return (
        <div className="space-y-2">
          {/* Render final non-edit content if it exists */}
          {finalNonEditContent && <Markdown className="react-markdown text-sm whitespace-normal">{finalNonEditContent}</Markdown>}

          {/* Render the final Edits Section box */}
          <div className="rounded-md border border-gray-200 bg-gray-50 p-3 mt-2">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-sm">
                {`${edits.length} edit${edits.length > 1 ? 's' : ''} suggested`}
              </span>
              {/* Accept/Reject All buttons - Only show if there are pending edits */}
              {Object.values(editStatuses).some(status => status === 'pending') && (
                <div className="flex gap-1">
                  <Button size="xs" variant="outline" className="text-xs h-6 px-2" disabled={!isLastMessage} onClick={handleAcceptAll}>Accept All</Button>
                  <Button size="xs" variant="outline" className="text-xs h-6 px-2" disabled={!isLastMessage} onClick={handleRejectAll}>Reject All</Button>
                </div>
              )}
            </div>

            {/* Render individual edits */}
            <div className="space-y-2 pt-2">
              {edits.map((edit, index) => {
                const status = editStatuses[index] || 'pending';
                const isPending = status === 'pending';
                const isAccepted = status === 'accepted';
                const isRejected = status === 'rejected';
                const expanded = !!isEditExpanded[index]; // Check if this edit is expanded

                // Function to toggle expansion state for this edit
                const toggleExpand = () => {
                    setIsEditExpanded(prev => ({ ...prev, [index]: !expanded }));
                };

                return (
                  <div
                    key={index}
                    className={cn(
                      "border-t border-gray-200 pt-2 pb-1 px-2 rounded", // Removed transition-colors
                      isAccepted && "bg-green-100",
                      isRejected && "bg-red-100"
                    )}
                  >
                    <div className="flex justify-between items-center text-xs mb-1">
                      {/* Edit Title and Toggle Button */}
                      <div className="flex items-center gap-1">
                        <Button
                            size="xs"
                            variant="ghost"
                            className="p-0 h-4 w-4 text-gray-500 hover:bg-gray-200"
                            onClick={toggleExpand}
                            aria-label={expanded ? `Collapse edit ${index + 1}` : `Expand edit ${index + 1}`}
                        >
                            {expanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                        </Button>
                        <span className="font-semibold cursor-pointer" onClick={toggleExpand}>Edit {index + 1}</span>
                      </div>
                      {/* Individual Accept/Reject Buttons - Only show if pending */}
                      {isPending && (
                        <div className="flex gap-1">
                          <Button
                            size="xs"
                            variant="ghost"
                            className={cn(
                              "p-0 h-5 w-5 text-gray-400 hover:bg-green-200 hover:text-green-700",
                              !isLastMessage && "cursor-not-allowed opacity-50"
                              // Removed accepted/rejected specific styles as they are no longer needed when hidden
                            )}
                            disabled={!isLastMessage} // Disable only based on isLastMessage now
                            onClick={() => handleAcceptChange(index)}
                            aria-label={`Accept edit ${index + 1}`}
                          >
                            <Check className="size-3" />
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            className={cn(
                              "p-0 h-5 w-5 text-gray-400 hover:bg-red-200 hover:text-red-700",
                              !isLastMessage && "cursor-not-allowed opacity-50"
                              // Removed accepted/rejected specific styles
                            )}
                            disabled={!isLastMessage} // Disable only based on isLastMessage now
                            onClick={() => handleRejectChange(index)}
                            aria-label={`Reject edit ${index + 1}`}
                          >
                            <X className="size-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {/* Collapsible Edit Content */}
                    {expanded && (
                      <div className="text-xs space-y-1 pl-5 pt-1"> {/* Indent content slightly */}
                        <p className={cn("text-red-600 line-through", isAccepted && "opacity-50")}>{edit.original}</p>
                        <p className={cn("text-green-600", isRejected && "opacity-50")}>{edit.newText}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // --- Default Finished Item (User message or Assistant w/o doc/edits) ---
    // This case now only runs if it's not a document and not processing/has edits
    return (
      <div className="whitespace-normal break-words overflow-hidden">
        {/* Render raw content only if it doesn't contain incomplete/unhandled tags */}
        {/* A simple check, might need refinement depending on edge cases */}
        {!content.includes('<Document>') && !content.includes('<Edit>') &&
          <Markdown className="react-markdown text-sm">{content}</Markdown>
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