import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

import { getEditorPrompt } from '@udecode/plate-ai/react';
import { PlateEditor } from '@udecode/plate/react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

import { ChatInput } from '@/components/chat/chat-input';
import { ChatSettings } from '@/components/chat/chat-settings';
import { appendChatSpecificFileIds } from '@/firebase/firestore-dao';
import { useDocument } from '@/providers/document-provider';
import { useChatSettings } from '@/providers/chat-settings-provider';
import { useUserDataContext } from '@/providers/user-data-provider';
import { Message } from '@/types';
import { editorPromptTemplate } from '@/utils/editor-prompt-util';
import { ChatMessageList } from '@/components/chat/chat-messaging-list';
import { FileAttachmentList } from '@/components/chat/file-attachment-list';
import { useFileAttachments } from '@/hooks/use-file-attachments';
import { useChatMessaging } from '@/hooks/use-chat-messaging';
import { useDocumentIntegration } from '@/hooks/use-document-integration';

interface ContentProps {
  activeChatMessages: Message[];
  editor: PlateEditor;
  setStatus: Dispatch<SetStateAction<string>>;
  status: 'awaiting_message' | 'in_progress';
  changeEditorContent: (content: any) => void;
}

const ChatContent = ({
  activeChatMessages,
  changeEditorContent,
  editor,
  setStatus,
  status
}: ContentProps) => {
  const { activeUserDocument } = useDocument();
  const { data: session } = useSession();
  const userDataContext = useUserDataContext();
  const { setUserChats } = userDataContext;
  const [inputValue, setInputValue] = useState('');
  const { selectedModel } = useChatSettings();
  const [streamingDocument, setStreamingDocument] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { attachments, uploadInProgress, updateAttachments, removeAttachment, uploadFiles } = 
    useFileAttachments(session?.user?.email || '');

  const { messages, streamingMessage, sendMessage, addMessage } = useChatMessaging({
    chatId: activeUserDocument?.chatId || '',
    userId: session?.user?.email || '',
    model: selectedModel,
    initialMessages: activeChatMessages
  });

  const { updateEditorWithNewDocument } = useDocumentIntegration({
    editor,
    documentId: activeUserDocument?.id || '',
    changeEditorContent
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const parseEditorAndGetDocumentAndSelection = (
    newMessage: string
  ): string => {
    if (editor.children.length <= 2 && editor.children[0].children[0].text === "") {
      return newMessage
    }

    const editorPrompt = getEditorPrompt(editor, {
      prompt: newMessage,
      promptTemplate: editorPromptTemplate,
    });

    return editorPrompt!;
  };

  const handleSendMessage =  (input?: string) => {
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

        const serializedEditorValue = parseEditorAndGetDocumentAndSelection(message.content);
        await sendMessage(serializedEditorValue);
      }
    }
  };

  const handleKeyPress = (e) => {
    adjustTextAreaHeight()
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
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleUpdateAttachments = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAttachments(e.target.files);
  };

  return (
    <motion.div
      className='flex flex-col items-start p-4 h-full w-1/3'
      transition={{
        damping: 20,
        duration: 0.2,
        stiffness: 100,
        type: 'spring',
      }}
    >
      {status != "in_progress"  && activeChatMessages.length === 0 && (
        <div className={editor.children.length <= 2 ? "" : "hidden"}>
          <h1 className="mb-4 font-bold leading-none tracking-tight text-gray-900 dark:text-white md:text-4xl">
            What can I help you write?
          </h1>
        </div>
      )}
      <div className="w-full flex-1 overflow-y-auto scroll-smooth whitespace-pre-wrap">
        <div className="mx-auto w-full space-y-6">
          <ChatMessageList
            messages={messages}
            streamingMessage={streamingMessage}
            streamingDocument={streamingDocument}
            status={status}
            uploadInProgress={uploadInProgress}
            onDocumentUpdate={updateEditorWithNewDocument}
          />
          <div ref={messagesEndRef} />
        </div>
      </div>
      {(status === "awaiting_message" || activeChatMessages.length > 0) && (
      <div className="w-full rounded-2xl border border-gray-300 bg-white p-2">
        <FileAttachmentList
          attachments={attachments}
          onRemove={removeAttachment}
        />
        <ChatInput
          handleKeyPress={handleKeyPress}
          handleSendMessage={handleSendMessage}
          fileInputRef={fileInputRef}
          inputValue={inputValue}
          setInputValue={setInputValue}
          status={status}
          textareaRef={textareaRef}
          updateAttachments={handleUpdateAttachments}
        />
        <ChatSettings />
      </div>
      )}
    </motion.div>
  );
};

export default ChatContent;
