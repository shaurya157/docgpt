import { Dispatch, SetStateAction, useRef, useState } from 'react';

import { getEditorPrompt } from '@udecode/plate-ai/react';
import { PlateEditor } from '@udecode/plate/react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessageList } from '@/components/chat/chat-messaging-list';
import { ChatSettings } from '@/components/chat/chat-settings';
import { FileAttachmentList } from '@/components/chat/file-attachment-list';
import { appendChatSpecificFileIds } from '@/firebase/firestore-dao';
import { useChatMessaging } from '@/hooks/use-chat-messaging';
import { useDocumentIntegration } from '@/hooks/use-document-integration';
import { useFileAttachments } from '@/hooks/use-file-attachments';
import { useChatSettings } from '@/providers/chat-settings-provider';
import { useDocument } from '@/providers/document-provider';
import { useUserDataContext } from '@/providers/user-data-provider';
import { Message } from '@/types';
import { editorPromptTemplate } from '@/utils/editor-prompt-util';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { attachments, removeAttachment, updateAttachments, uploadFiles, uploadInProgress } = 
    useFileAttachments(session?.user?.email || '');

  const { addMessage, messages, sendMessage, streamingState } = useChatMessaging({
    chatId: activeUserDocument?.chatId || '',
    initialMessages: activeChatMessages,
    model: selectedModel,
    userId: session?.user?.email || ''
  });

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
      className='flex flex-col items-start p-4 h-full w-[500px] bg-white'
      transition={{
        damping: 20,
        duration: 0.2,
        stiffness: 100,
        type: 'spring',
      }}
    >
      <div className="w-full flex-1 overflow-y-auto scroll-smooth whitespace-pre-wrap mt-12">
        <div className="mx-auto w-full space-y-6">
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
      <div className="w-full rounded-2xl border border-gray-300 bg-white p-2">
        <FileAttachmentList
          onRemove={removeAttachment}
          attachments={attachments}
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
    </motion.div>
  );
};

export default ChatContent;
