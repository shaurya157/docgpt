import { useCallback, useEffect, useRef, useState } from 'react';
import { ContextMentionOption, ContextMentionProvider } from '@/types';

interface TextAreaState {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

export interface UseContextMentionsProps {
  providers: ContextMentionProvider[];
  onSelect?: (option: ContextMentionOption) => void;
}

export const useContextMentions = ({
  providers,
  onSelect
}: UseContextMentionsProps) => {
  const [textAreaState, setTextAreaState] = useState<TextAreaState>({
    value: '',
    selectionStart: 0,
    selectionEnd: 0
  });
  const [scrollValue, setScrollValue] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  // Mention state
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ContextMentionOption[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [filterText, setFilterText] = useState('');
  const [selectedContexts, setSelectedContexts] = useState<ContextMentionOption[]>([]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    setScrollValue(e.currentTarget.scrollLeft);
  }, []);

  // Update overlay scroll position when textarea scrolls
  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.scrollLeft = scrollValue;
    }
  }, [scrollValue]);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setTextAreaState({
        value: newValue,
        selectionStart: e.target.selectionStart,
        selectionEnd: e.target.selectionEnd
      });
    },
    []
  );

  // Reset the mention dropdown state
  const resetMention = useCallback(() => {
    setIsOpen(false);
    setOptions([]);
    setActiveIndex(0);
    setFilterText('');
  }, []);

  // Manually trigger the mention dropdown
  const triggerMention = useCallback(() => {
    setIsOpen(true);
    setOptions(
      providers.flatMap(provider => 
        provider.getOptions('')
      )
    );
    setActiveIndex(0);
    setFilterText('');
  }, [providers]);

  // Handle input changes to detect and filter @ mentions
  const handleInputChange = useCallback((text: string) => {
    const lastAtIndex = text.lastIndexOf('@');
    
    if (lastAtIndex >= 0 && lastAtIndex === text.length - 1) {
      // Just typed @, open dropdown with all options
      setIsOpen(true);
      setOptions(
        providers.flatMap(provider => 
          provider.getOptions('')
        )
      );
      setFilterText('');
      return;
    }
    
    if (lastAtIndex >= 0 && lastAtIndex < text.length - 1) {
      // Filter based on text after @
      const query = text.substring(lastAtIndex + 1);
      setFilterText(query);
      
      // Get options from providers that match the query
      const matchingOptions = providers
        .filter(provider => provider.matcher(query))
        .flatMap(provider => provider.getOptions(query));
      
      if (matchingOptions.length > 0) {
        setIsOpen(true);
        setOptions(matchingOptions);
        setActiveIndex(0);
      } else {
        setIsOpen(false);
      }
      return;
    }
    
    // No @ symbol found, close dropdown
    setIsOpen(false);
  }, [providers]);

  // Handle keyboard navigation in the dropdown
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % options.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + options.length) % options.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (options.length > 0) {
          selectOption(options[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        resetMention();
        break;
    }
  }, [isOpen, options, activeIndex, resetMention]);

  // Handle selecting an option
  const selectOption = useCallback((option: ContextMentionOption) => {
    // Find the provider that owns this option
    const provider = providers.find(p => 
      p.getOptions(filterText).some(o => o.id === option.id)
    );
    
    if (provider) {
      provider.handleSelection(option);
    }

    // Add to selected contexts if it's not an upload-type action
    if (option.type !== 'upload') {
      setSelectedContexts(prev => [...prev, option]);
      
      // Update textAreaState to include a space after the mention
      setTextAreaState(prev => {
        const atIndex = prev.value.lastIndexOf('@');
        if (atIndex >= 0) {
          const newValue = prev.value.substring(0, atIndex) + '@' + option.value + ' ';
          const newCursorPosition = atIndex + option.value.length + 2; // +2 for @ and space
          return {
            value: newValue,
            selectionStart: newCursorPosition,
            selectionEnd: newCursorPosition
          };
        }
        return prev;
      });
    }

    if (onSelect) {
      onSelect(option);
    }
    
    resetMention();
  }, [providers, filterText, resetMention, onSelect]);

  // Remove a selected context
  const removeContext = useCallback((index: number) => {
    setSelectedContexts(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Function to get segments for highlighting
  const getHighlightedSegments = useCallback((text: string) => {
    if (!text) return [{ text: '', isMention: false }];
    
    let segments: { text: string; isMention: boolean }[] = [];
    let currentPosition = 0;
    
    // Sort mentions by position to handle overlapping mentions correctly
    const mentionPositions = selectedContexts.map(context => {
      const mention = `@${context.value}`;
      const index = text.indexOf(mention, currentPosition);
      return { mention, index, length: mention.length };
    }).filter(m => m.index !== -1)
      .sort((a, b) => a.index - b.index);

    // Process each mention and the text between them
    for (const { mention, index, length } of mentionPositions) {
      // Add non-mention text before this mention
      if (index > currentPosition) {
        segments.push({
          text: text.slice(currentPosition, index),
          isMention: false
        });
      }
      
      // Add the mention
      segments.push({
        text: mention,
        isMention: true
      });
      
      currentPosition = index + length;
    }
    
    // Add any remaining text after the last mention
    if (currentPosition < text.length) {
      segments.push({
        text: text.slice(currentPosition),
        isMention: false
      });
    }
    
    return segments;
  }, [selectedContexts]);

  return {
    textAreaState,
    handleTextChange,
    handleScroll,
    overlayRef,
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
  };
}; 