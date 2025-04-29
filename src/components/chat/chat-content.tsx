import { Dispatch, DragEvent, SetStateAction, useEffect, useRef, useState } from 'react';

import { getEditorPrompt } from '@udecode/plate-ai/react';
import { PlateEditor } from '@udecode/plate/react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useSession } from 'next-auth/react';

import { ChatMessageList } from '@/components/chat/chat-messaging-list';
import { ChatSettings } from '@/components/chat/chat-settings';
import { CustomContextDisplay } from '@/components/integrations/custom-context';
import { FileAttachmentList } from '@/components/integrations/file-attachment-list';
import { IntegrationSelectionModal } from '@/components/integrations/integration-selection-modal';
import { SlackChannelSelector } from '@/components/integrations/slack-channel-selector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/plate-ui/dropdown-menu';
import { appendChatSpecificFileIds } from '@/firebase/firestore-dao';
import { useChatMessaging } from '@/hooks/use-chat-messaging';
import { useDocumentIntegration } from '@/hooks/use-document-integration';
import { useFileAttachments } from '@/hooks/use-file-attachments';
import { useChatSettings } from '@/providers/chat-settings-provider';
import { useDocument } from '@/providers/document-provider';
import { useUserDataContext } from '@/providers/user-data-provider';
import { Message } from '@/types';
import { editorDocumentAndPromptTemplate } from '@/utils/editor-prompt-util';

import { TokenUsage } from './token-usage';

// Define the mobile breakpoint
const MOBILE_BREAKPOINT = 768; // Corresponds to Tailwind's 'md'

interface ContentProps {
  activeChatMessages: Message[];
  editor: PlateEditor;
  isVisible: boolean;
  setStatus: Dispatch<SetStateAction<string>>;
  status: 'awaiting_message' | 'in_progress';
  changeEditorContent: (content: any) => void;
  onToggleChat: () => void;
}

const ChatContent = ({
  activeChatMessages,
  changeEditorContent,
  editor,
  isVisible,
  setStatus,
  status,
  onToggleChat
}: ContentProps) => {
  
  const { activeUserDocument } = useDocument();
  const { data: session } = useSession();
  const userDataContext = useUserDataContext();
  const { setUserChats } = userDataContext;
  const [inputValue, setInputValue] = useState('');
  const { selectedModel } = useChatSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false); // State for drag overlay
  
  // Add state and refs for draggable width functionality
  const [paneWidth, setPaneWidth] = useState(450);
  const [isDragging, setIsDragging] = useState(false);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const documentContainerRef = useRef<HTMLElement | null>(null);
  const documentEditorRef = useRef<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = useState(false); // State for mobile view
  const [isSlackModalOpen, setIsSlackModalOpen] = useState(false); // State for Slack modal
  const { chatId } = activeUserDocument || {};

  const { attachments, removeAttachment, updateAttachments, uploadFiles, uploadInProgress } = 
    useFileAttachments(session?.user?.email || '');

  const { addMessage, messages, sendMessage, streamingState } = useChatMessaging({
    chatId: activeUserDocument?.chatId || '',
    initialMessages: activeChatMessages,
    model: selectedModel,
    userId: session?.user?.email || ''
  });

  // Get DOM references on initial render
  useEffect(() => {
    documentContainerRef.current = document.getElementById('document-container') as HTMLElement;
    documentEditorRef.current = document.getElementById('document-editor') as HTMLElement;
  }, []);

  // --- Mobile View Detection ---
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    checkMobile(); // Initial check
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // --- Drag and Drop Handlers ---
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Check if files are being dragged
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Make sure we are leaving the actual container, not just moving over a child
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
        return;
    }
    setIsDraggingOver(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Pass files to the existing attachment handler
      updateAttachments(e.dataTransfer.files);
      // Clean up data transfer object
      e.dataTransfer.clearData();
    }
  };
  // --- End Drag and Drop Handlers ---

  // Function to calculate maximum chat pane width
  const calculateMaxChatWidth = (): number => {
    const windowWidth = window.innerWidth;
    const documentWidth = documentEditorRef.current?.offsetWidth || 816;
    
    // Calculate minimum x-position for document (how far left it can go)
    // This ensures document doesn't get pushed off screen
    const minLeftMargin = 20; // Minimum left margin for document
    
    // Calculate maximum chat width
    // Window width - (document width + minimum left margin)
    return windowWidth - (documentWidth + minLeftMargin);
  };

  // Calculate padding needed to keep document centered
  const calculateDocumentPadding = (chatWidth: number): number => {
    // Only need right padding equal to chat width to keep document centered
    // This will push document left by half of chat width
    return chatWidth;
  };

  // Add event handlers for draggable width
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = paneWidth;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleDragMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // Calculate new width by subtracting the mouse movement from the starting width
      // Since the chat pane is on the right, we reverse the direction
      const newWidth = startWidthRef.current - (e.clientX - startXRef.current);
      
      // Calculate maximum allowed width
      const maxChatWidth = calculateMaxChatWidth();
      
      // Apply constraints: min 280px, max based on available space
      const constrainedWidth = Math.max(280, Math.min(maxChatWidth, newWidth));
      setPaneWidth(constrainedWidth);
      
      // Update document container padding to keep document centered
      if (documentContainerRef.current) {
        documentContainerRef.current.style.paddingRight = `${calculateDocumentPadding(constrainedWidth)}px`;
      }
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging]);

  // Window resize handler to adjust pane width if needed
  useEffect(() => {
    const handleResize = () => {
      const maxChatWidth = calculateMaxChatWidth();
      
      // If current pane width exceeds max allowed, reduce it
      if (paneWidth > maxChatWidth) {
        setPaneWidth(maxChatWidth);
      }
      
      // Always update document padding to ensure proper centering
      if (documentContainerRef.current) {
        documentContainerRef.current.style.paddingRight = `${calculateDocumentPadding(paneWidth)}px`;
        documentContainerRef.current.style.transition = 'none'; // Disable transition during resize
        
        // Re-enable transition after resize
        setTimeout(() => {
          if (documentContainerRef.current) {
            documentContainerRef.current.style.transition = 'padding-right 0.1s ease-out';
          }
        }, 100);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [paneWidth]);
  
  // Initial setup and changes to pane width
  useEffect(() => {
    // Ensure we have the reference to the document container
    if (!documentContainerRef.current) {
      documentContainerRef.current = document.getElementById('document-container') as HTMLElement;
    }

    // Apply padding based on chat pane width, visibility, and mobile status
    if (documentContainerRef.current) {
      let targetPadding = 0;
      // Only apply padding if not mobile AND chat is visible AND not dragging
      if (!isMobile && isVisible && !isDragging) {
        targetPadding = calculateDocumentPadding(paneWidth);
      }
      
      documentContainerRef.current.style.paddingRight = `${targetPadding}px`;
      // Apply transition only if not dragging
      documentContainerRef.current.style.transition = isDragging ? 'none' : 'padding-right 0.2s ease-out';
    }
    // Cleanup transition on unmount or if dragging starts
    // return () => {
    //   if (documentContainerRef.current) {
    //     documentContainerRef.current.style.transition = 'none'; 
    //   }
    // };

  }, [paneWidth, isDragging, isVisible, isMobile]); // Add isMobile dependency

  const { updateEditorWithNewDocument } = useDocumentIntegration({
    changeEditorContent,
    documentId: activeUserDocument?.id || '',
    editor
  });

  const parseEditorAndGetDocumentAndSelection = (
    newMessage: string
  ): string => {
    if (editor.children.length <= 2 && editor.children[0].children[0].text === "") {
      return newMessage
    }

    const editorPrompt = getEditorPrompt(editor, {
      prompt: newMessage,
      promptTemplate: editorDocumentAndPromptTemplate,
    });

    return editorPrompt!;
  };

  const handleSendMessage = (input?: string) => {
    return async () => {
      setStatus('in_progress');
      const item = activeUserDocument
      const usedInput = input === undefined ? inputValue : input

      if (usedInput.trim() || attachments.length > 0) {
        let fileIds: any[] = [];
        if (attachments.length > 0) {
          fileIds = await uploadFiles(item!.chatId);
          await appendChatSpecificFileIds(item!.chatId, fileIds);
          
          // Update userChats state with new files
          setUserChats(prev => {
            if (!prev) return prev;
            return prev.map(chat => {
              if (chat.id === item!.chatId) {
                return {
                  ...chat,
                  files: [...(chat.files || []), ...fileIds]
                };
              }
              return chat;
            });
          });
        }

        const message = await addMessage(usedInput.trim(), attachments.map(att => att.fileName));
        setInputValue('');
        
        // Reset textarea height after sending message
        if (textareaRef.current) {
          textareaRef.current.style.height = '36px';
        }

        const serializedEditorValue = parseEditorAndGetDocumentAndSelection(message.content);
        await sendMessage(serializedEditorValue);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage()().then(
        () => {
          setStatus('awaiting_message');
        },
        (error) => {
          console.error(error);
          setStatus('awaiting_message');
        }
      );
    }
  };

  const adjustTextAreaHeight = () => {
    if (textareaRef.current) {
      const minHeight = 36; // Minimum height in pixels
      const textarea = textareaRef.current;
      
      // Reset to default height first
      textarea.style.height = `${minHeight}px`;
      
      // Only adjust if content actually overflows
      const scrollHeight = textarea.scrollHeight;
      const isOverflowing = scrollHeight > minHeight;
      
      if (isOverflowing) {
        textarea.style.height = `${scrollHeight}px`;
      }
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleUpdateAttachments = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAttachments(e.target.files);
  };

  return (
    <motion.div
      ref={chatContainerRef}
      className={`flex flex-col bg-white border-gray-200 overflow-hidden absolute top-0 h-full group z-10 ${
        isVisible ? (isMobile ? 'border-l-0' : 'border-l') : 'border-l-0'
      } ${ 
        isMobile && isVisible ? 'left-0 right-0' : 'right-0'
      }`}
      style={{
        // Conditional width and minWidth based on mobile view
        minWidth: isVisible ? (isMobile ? '100%' : '280px') : '0px',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        // Existing styles
        transition: isDragging ? 'none' : 'width 0.2s ease-out, opacity 0.2s ease-out',
        width: isVisible ? (isMobile ? '100%' : `${paneWidth}px`) : '0px',
      }}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      animate={{ // Animate width and opacity based on isVisible and isMobile
        opacity: isVisible ? 1 : 0,
        width: isVisible ? (isMobile ? '100%' : `${paneWidth}px`) : '0px',
      }}
      initial={false} // Disable initial animation based on initial state
    >
      {/* Drag handle - Hidden on mobile */}
      {!isMobile && (
        <div 
          ref={dragHandleRef}
          className="absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize hover:bg-gray-200 hover:opacity-40 z-50 flex items-center justify-center"
          onMouseDown={(e) => {
            e.stopPropagation();
            handleDragStart(e);
          }}
        >
          <div className="h-20 w-[3px] bg-gray-300 rounded-full opacity-0 group-hover:opacity-100" />
        </div>
      )}
      
      {/* Mobile Close Button - Visible only when mobile and chat is visible */}
      {isMobile && isVisible && (
        <div className="absolute top-2 right-2 z-70">
          <button 
            className="p-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200" 
            onClick={onToggleChat}
            aria-label="Close chat panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Conditionally render the Chat Header only if not mobile */}
      {!isMobile && (
        <div className="w-full py-2 px-3 flex justify-between items-center border-b border-gray-200 bg-gray-50 mt-9">
          <h2 className="font-medium text-sm">Chat</h2>
          <TokenUsage chatId={chatId} />
        </div>
      )}

      {/* Adjust padding for mobile when header is hidden */}
      <div className={`w-full flex-1 overflow-y-auto scroll-smooth whitespace-pre-wrap px-2 ${isMobile ? 'pt-2' : 'py-2'}`}> {/* Removed py-2, added pt-2 on mobile */}
        <div className="w-full space-y-2">
          <ChatMessageList
            onDocumentUpdate={updateEditorWithNewDocument}
            messages={messages}
            status={status}
            streamingState={streamingState}
            uploadInProgress={uploadInProgress}
          />
          <div ref={messagesEndRef} />
        </div>
      </div>
            {/* Display Custom Context Items */}
            <CustomContextDisplay />
      <div className="w-full border-t border-gray-200 bg-white pt-0.5 pb-1 px-2">
        <div className="flex flex-col gap-0">
          <div className="mt-0.5 mb-0">
            <FileAttachmentList
              onRemove={removeAttachment}
              attachments={attachments}
            />
            <textarea
              ref={textareaRef}
              className="resize-none w-full overflow-auto py-2 px-2 text-gray-600 text-sm focus:outline-none rounded-lg"
              style={{ height: "32px" }}
              disabled={status !== 'awaiting_message'}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (e.target.value.length > 70) {
                  adjustTextAreaHeight();
                } else if (e.target.value.length < 10) {
                  if (textareaRef.current) {
                    textareaRef.current.style.height = "32px";
                  }
                }
              }}
              onKeyDown={handleKeyPress}
              placeholder="Message DocGPT"
            />
            <input
              ref={fileInputRef}
              className="hidden"
              onChange={handleUpdateAttachments}
              type="file"
              multiple
            />
          </div>
          <div className="flex items-center justify-between mt-1"> 
            <div className="flex items-center gap-1"> {/* Container for settings + token info */}
              <ChatSettings />
            </div>

            <div className="flex items-center gap-2">
              <button
                className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     {/* Attachment Icon */}
                    <svg fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                    </svg>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>Upload from computer</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setIsSlackModalOpen(true)}>Attach from Slack</DropdownMenuItem>
                    {/* Add Google Drive option here later */}
                  </DropdownMenuContent>
                </DropdownMenu>
               </button>
              <button
                className={`rounded-md px-3 py-1 ${inputValue ? 'cursor-pointer bg-black text-white' : 'cursor-not-allowed bg-gray-200 text-gray-500'} text-xs`}
                disabled={!inputValue}
                onClick={handleSendMessage()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Drag and Drop Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 bg-gray-300 bg-opacity-30 flex items-center justify-center pointer-events-none z-10">
          <span className="text-gray-700 font-semibold text-lg">Drop files here</span>
        </div>
      )}
      {/* Render Slack Integration Modal */}
      <IntegrationSelectionModal
        onOpenChange={setIsSlackModalOpen}
        isOpen={isSlackModalOpen}
        serviceName="Slack">
        <SlackChannelSelector onClose={() => setIsSlackModalOpen(false)} />
      </IntegrationSelectionModal>
    </motion.div>
  );
};

export default ChatContent;
