import { Dispatch, KeyboardEvent, SetStateAction, useEffect, useRef } from 'react';

import Image from 'next/image';

import UploadIcon from '../../assets/icons/arrowUp.svg';
import AttachmentIcon from '../../assets/icons/attachment.svg';
import AtIcon from '../../assets/icons/attachment.svg'; // Using as a placeholder, replace with actual @ icon
import { ContextMentionDropdown } from './context-mention-dropdown';
import { ContextList } from './context-list';
import { useContextMentions } from '@/hooks/use-context-mentions';
import { useContextMentionsProviders } from '@/providers/context-mentions-provider';

interface ChatInputProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  status: 'awaiting_message' | 'in_progress';
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleSendMessage: (input?: string) => () => Promise<void>;
  updateAttachments: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ChatInput = ({
  fileInputRef,
  inputValue,
  setInputValue,
  status,
  handleKeyPress,
  handleSendMessage,
  updateAttachments
}: ChatInputProps) => {
  const { providers } = useContextMentionsProviders();
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  
  const { 
    isOpen, 
    options, 
    activeIndex,
    selectedContexts,
    handleKeyDown,
    handleInputChange,
    selectOption,
    removeContext,
    resetMention,
    triggerMention,
    getHighlightedSegments
  } = useContextMentions({
    providers,
    onSelect: (option) => {
      // Handle selection - this could add text to the input or trigger an action
      if (option.type === 'upload') {
        // File upload is handled by the provider, no need to modify input
      } else {
        // For other types, insert the selected option's text with a space after
        setInputValue(prev => {
          const atIndex = prev.lastIndexOf('@');
          if (atIndex >= 0) {
            // Replace the @ and any text after it with the selected option + space
            return prev.substring(0, atIndex) + '@' + option.value + ' ';
          }
          return prev;
        });
        
        // Focus back on the editable div
        setTimeout(() => {
          if (editableRef.current) {
            editableRef.current.focus();
            
            // Need to find the mention span and place cursor after it
            const selection = window.getSelection();
            if (selection) {
              // First clear any existing selection
              selection.removeAllRanges();
              
              // Find the last span element (which should be our mention)
              const spans = editableRef.current.querySelectorAll('span');
              const lastMentionSpan = Array.from(spans).find(span => 
                span.classList.contains('bg-blue-100')
              );
              
              if (lastMentionSpan) {
                // Place cursor after the mention span
                const range = document.createRange();
                range.setStartAfter(lastMentionSpan);
                range.collapse(true);
                selection.addRange(range);
              } else {
                // Fallback - move to end of content
                const range = document.createRange();
                range.selectNodeContents(editableRef.current);
                range.collapse(false);
                selection.addRange(range);
              }
            }
          }
        }, 10); // Slight delay to ensure DOM has updated
      }
    }
  });

  // Sync the contenteditable div with inputValue
  useEffect(() => {
    if (editableRef.current) {
      // Safely get current cursor position with null checks
      const selection = window.getSelection();
      let cursorOffset = 0;
      
      // Only try to get range if selection exists and has ranges
      if (selection && selection.rangeCount > 0) {
        const currentRange = selection.getRangeAt(0);
        cursorOffset = currentRange.startOffset;
      }
      
      // Check if the content matches the inputValue to avoid unnecessary updates
      if (editableRef.current.textContent !== inputValue) {
        const segments = getHighlightedSegments(inputValue);
        editableRef.current.innerHTML = '';
        
        segments.forEach(segment => {
          const spanElement = document.createElement('span');
          if (segment.isMention) {
            spanElement.className = 'bg-blue-100 text-blue-800 rounded px-1';
          } else {
            spanElement.className = 'normal-text'; // Add a class for non-mention text
          }
          spanElement.textContent = segment.text;
          if (editableRef.current) {
            editableRef.current.appendChild(spanElement);
          }
        });

        // Only try to adjust selection if we have a valid selection
        if (selection && selection.rangeCount > 0 && editableRef.current.textContent?.length) {
          try {
            // Find where we need to place the cursor
            const targetPosition = findCursorTargetPosition(
              editableRef.current, 
              cursorOffset
            );
            
            if (targetPosition) {
              const newRange = document.createRange();
              newRange.setStart(targetPosition.node, targetPosition.offset);
              newRange.setEnd(targetPosition.node, targetPosition.offset);
              selection.removeAllRanges();
              selection.addRange(newRange);
            } else {
              // Fallback - move to end
              const range = document.createRange();
              range.selectNodeContents(editableRef.current);
              range.collapse(false);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          } catch (e) {
            // Another fallback - move to end
            const range = document.createRange();
            range.selectNodeContents(editableRef.current);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }
    }
  }, [inputValue, getHighlightedSegments]);

  // Helper to find cursor position inside contenteditable with spans
  const findCursorTargetPosition = (
    container: HTMLElement, 
    targetOffset: number
  ): { node: Node, offset: number } | null => {
    let currentOffset = 0;
    const textNodes: { node: Node, start: number, end: number }[] = [];
    
    // Get all text nodes and their offset ranges
    const collectTextNodes = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const length = node.textContent?.length || 0;
        textNodes.push({
          node,
          start: currentOffset,
          end: currentOffset + length
        });
        currentOffset += length;
      } else {
        for (const child of Array.from(node.childNodes)) {
          collectTextNodes(child);
        }
      }
    };
    
    collectTextNodes(container);
    
    // Find the text node containing our target offset
    for (const { node, start, end } of textNodes) {
      if (targetOffset >= start && targetOffset <= end) {
        return {
          node,
          offset: targetOffset - start
        };
      }
    }
    
    return null;
  };

  // Enhanced key press handler that combines original functionality with mention handling
  const handleCombinedKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (isOpen) {
      handleKeyDown(e);
      // If Enter is pressed and dropdown is open, don't proceed with sending
      if (e.key === 'Enter') {
        e.preventDefault();
        return;
      }
    }
    
    // Handle Enter to send message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage()();
    }
  };

  // Update input value based on contenteditable changes
  const handleContentChange = () => {
    if (editableRef.current) {
      const newValue = editableRef.current.textContent || '';
      setInputValue(newValue);
      handleInputChange(newValue);
      
      // Adjust height based on content without max height constraint
      const element = editableRef.current;
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  };

  // Initialize height adjustment
  useEffect(() => {
    if (editableRef.current) {
      handleContentChange();
    }
  }, []);

  return (
    <div className="flex flex-col w-full gap-2">
      {/* Context list shown above the input like file attachments */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          className="cursor-pointer rounded-lg bg-gray-200 px-3 py-1 flex items-center gap-1.5 text-sm"
          onClick={triggerMention}
        >
          <span className="text-gray-700">@ Add Context</span>
        </button>
        <ContextList 
          selectedContexts={selectedContexts} 
          onRemove={removeContext} 
          inputValue={inputValue}
        />
      </div>
      
      <div className="relative flex w-full items-start gap-1">
        <input
          ref={fileInputRef}
          className="hidden"
          onChange={updateAttachments}
          type="file"
          multiple
        />
        <button
          className="cursor-pointer rounded-lg p-2 hover:bg-gray-200"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image alt="Attach" height={20} src={AttachmentIcon} width={20} />
        </button>
        <div 
          ref={inputContainerRef}
          className="relative flex-1"
        >
          {isOpen && (
            <ContextMentionDropdown
              isOpen={isOpen}
              options={options}
              activeIndex={activeIndex}
              onSelect={selectOption}
              onClose={resetMention}
            />
          )}
          <div
            ref={editableRef}
            className="min-h-[30px] w-full flex-1 overflow-auto p-1 text-gray-600 focus:outline-none border-none bg-transparent empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
            contentEditable={status === 'awaiting_message'}
            onInput={handleContentChange}
            onKeyDown={handleCombinedKeyPress}
            data-placeholder="Write a document about..."
            role="textbox"
            aria-multiline="true"
          ></div>
        </div>
        <button
          className={`rounded-full p-2 ${
            inputValue
              ? 'cursor-pointer bg-black'
              : 'cursor-not-allowed bg-gray-200'
          }`}
          disabled={!inputValue}
          onClick={handleSendMessage()}
        >
          <Image alt="Send" height={18} src={UploadIcon} width={18} />
        </button>
      </div>
    </div>
  );
};
