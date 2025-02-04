import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { appendDocumentSpecificFileIds } from '@/firebase/firestore-dao';
import { useUserDataContext } from '@/providers/UserDataProvider';
import { editorPromptTemplate } from '@/utils/editor-prompt-util';
import deserializeListMd, { classifyStart } from '@/utils/serialization-util';
import { getEditorPrompt } from '@udecode/plate-ai/react';
import { PlateEditor } from '@udecode/plate-common/react';
import { deserializeMd } from '@udecode/plate-markdown';
import { Message } from 'ai';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Markdown from 'react-markdown';
import { toast } from 'sonner';

import { readDataStream } from '@/lib/read-data-stream';
import { ChatSettingsHelper } from '@/components/chat/ChatSettingsHelper';
import { Icons } from '@/components/icons';

import UploadIcon from '../../assets/icons/arrowUp.svg';
import AttachmentIcon from '../../assets/icons/attachment.svg';
import CloseIcon from '../../assets/icons/x.svg';

// interface Message {
//   id: string;
//   type: 'user' | 'bot';
//   content: string;
//   attachments?: Array<{
//     url: string;
//     fileName: string;
//     fileType: string;
//   }>;
// }

interface ContentProps {
  activeUserDocument: any;
  activeChatMessages: Message[];
  setActiveChatMessages: Dispatch<SetStateAction<Message[]>>;
  status: 'in_progress' | 'awaiting_message';
  setStatus: Dispatch<SetStateAction<string>>;
  editor: PlateEditor;
  setActiveItem: (id: any, documentRefreshOnly: boolean) => void;
  editorOpen: boolean;
  setEditorOpen: (bool: boolean) => void;
  onNewChat: () => {};
}

const DotAnimation = () => {
  const dotVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  };

  // Stagger children animations
  const containerVariants = {
    initial: { transition: { staggerChildren: 0 } },
    animate: { transition: { staggerChildren: 0.5, staggerDirection: 1 } },
    exit: { transition: { staggerChildren: 0.5, staggerDirection: 1 } },
  };

  const [key, setKey] = useState(0);

  // ...
  return (
    <motion.div
      key={key}
      initial="initial"
      animate="animate"
      exit="exit"
      className="-ml-1 flex gap-x-0.5"
      variants={containerVariants}
      onAnimationComplete={() => setKey((prevKey) => prevKey + 1)}
    >
      {[...Array(3)].map((_, i) => (
        <motion.span key={i} variants={dotVariants}>
          .
        </motion.span>
      ))}
    </motion.div>
  );
};

const ChatContent = ({
  activeUserDocument,
  activeChatMessages,
  setActiveChatMessages,
  status,
  setStatus,
  editor,
  setActiveItem,
  editorOpen,
  setEditorOpen,
  onNewChat,
}: ContentProps) => {
  const { data: session } = useSession();
  const { chatAssistantId } = useUserDataContext();
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<
    Array<{
      url: string;
      fileName: string;
      fileType: string;
      file: File;
    }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChatMessages]);

  const parseEditorAndGetDocumentAndSelection = (
    newMessage: string
  ): string => {
    const editorPrompt = getEditorPrompt(editor, {
      prompt: newMessage,
      promptTemplate: editorPromptTemplate,
    });

    return editorPrompt!!;
  };

  const handleSendMessage = async () => {
    setStatus('in_progress');
    let item = activeUserDocument;
    if (!item) {
      item = await onNewChat();
    }

    if (inputValue.trim() || attachments.length > 0) {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: inputValue.trim(),
        // attachments: attachments.length > 0 ? attachments : undefined,
      };
      setInputValue('');
      setActiveChatMessages((prev) => [...prev, newMessage]);

      if (attachments.length > 0) {
        const filesFormData = new FormData();
        filesFormData.append('vectorStoreId', item!['vectorStoreId']);
        filesFormData.append('userId', session!.user!.email!);
        attachments.forEach((attachment) => {
          filesFormData.append('files', attachment.file);
        });
        const filesResult = await fetch('/api/ai/files', {
          method: 'POST',
          body: filesFormData,
        });
        const filesResultJson: Map<string, string>[] = (
          await filesResult.json()
        )['openAiFileIds'];

        await appendDocumentSpecificFileIds(item!['id'], filesResultJson);
        setAttachments([]);
      }

      const formData = new FormData();
      const serializedEditorValue = parseEditorAndGetDocumentAndSelection(
        newMessage.content
      );
      formData.append('message', serializedEditorValue);
      formData.append('threadId', item['threadId']);
      formData.append('assistantId', chatAssistantId!);

      const result = await fetch('/api/ai/chat/brainstormassistant', {
        method: 'POST',
        body: formData,
      });

      if (result.body == null) {
        throw new Error('The response body is empty.');
      }

      try {
        for await (const { type, value } of readDataStream(
          result.body.getReader()
        )) {
          switch (type) {
            case 'assistant_message': {
              setActiveChatMessages((messages: Message[]) => [
                ...messages,
                {
                  id: value.id,
                  role: value.role,
                  content: value.content[0].text.value,
                },
              ]);
              break;
            }
            case 'error': {
              throw new Error(
                `There was an error processing the message. Please submit a bug report with the following message: ${value}`
              );
            }
          }
        }
      } catch (error) {
        toast.error(error.message);
      }

      setStatus('awaiting_message');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage().then(
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
      ];

      const newAttachments = Array.from(files)
        .filter((file) => allowedTypes.includes(file.type))
        .map((file) => ({
          url: URL.createObjectURL(file),
          fileName: file.name,
          fileType: file.type,
          file,
        }));

      setAttachments((prev) => [...prev, ...newAttachments]);
    }
  };

  const updateEditorWithNewDocument = (document: string) => {
    return () => {
      let result: any[] = [];
      let doubleNewLineSplitArr = document.split('\n\n');
      doubleNewLineSplitArr.forEach((doubleLineSplitText) => {
        let singleNewLineSplit = doubleLineSplitText.split('\n');

        singleNewLineSplit.forEach((singleNewLineSplitText) => {
          const listStyleType = classifyStart(singleNewLineSplitText);
          if (listStyleType) {
            const deserializedList = deserializeListMd(
              singleNewLineSplitText,
              editor,
              listStyleType
            );

            result = result.concat(deserializedList);
          } else {
            const resNodes = deserializeMd(editor, singleNewLineSplitText);
            result = result.concat(resNodes[0]);
          }
        });
      });

      const currActiveDoc = { ...activeUserDocument };
      currActiveDoc['document'] = result;
      setActiveItem(currActiveDoc, true);
    };
  };

  function extractTitleFromDocument(document: string): string {
    const titleRegex = /^(#{1,6})\s+(.*)/m;
    const match = document.match(titleRegex);
    return match ? match[2].trim() : 'New Document';
  }

  const parseUserAndAssistantMessageContent = (message: Message) => {
    if (message.role != 'user' && message.content.includes('<Document>')) {
      const startTag = '<Document>';
      const endTag = '</Document>';
      const startIndex = message.content.indexOf(startTag);
      const endIndex = message.content.indexOf(endTag);

      const prepending = message.content.slice(0, startIndex);
      const document = message.content
        .slice(startIndex + startTag.length, endIndex)
        .trim();
      const documentTitle = extractTitleFromDocument(document);
      const appending = message.content.slice(endIndex + endTag.length);

      return (
        <div className="space-y-4">
          <div>{prepending}</div>
          <div
            onClick={updateEditorWithNewDocument(document)}
            className="inline-block w-auto cursor-pointer rounded-lg bg-sky-600 bg-opacity-50 p-2"
          >
            <div className="flex">
              <FileText />
              <div className="mx-1 ">{documentTitle}</div>
            </div>
          </div>
          <div>{appending}</div>
        </div>
      );
    }

    return (
      <Markdown className="whitespace-pre-wrap">{message.content}</Markdown>
    );
    // return <div className="whitespace-pre-wrap">{message.content}</div>;
  };

  const chatInputPositioningCssClass =
    activeChatMessages.length !== 0 || editorOpen ? 'h-full' : '';

  return (
    <motion.div
      className={
        'flex flex-col items-start p-4 ' + chatInputPositioningCssClass
      }
      transition={{
        duration: 0.2,
        type: 'spring',
        damping: 20,
        stiffness: 100,
      }}
      style={{ width: editorOpen ? '30%' : '50%' }}
    >
      {activeChatMessages.length !== 0 ? <div></div> : <ChatSettingsHelper />}
      <div className="w-full flex-1 overflow-y-auto scroll-smooth">
        <div className="mx-auto w-full space-y-6">
          {activeChatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`rounded-xl px-4 py-2 ${
                  message.role === 'user' ? 'bg-gray-200 text-black' : ''
                }`}
              >
                {parseUserAndAssistantMessageContent(message)}

                {message['attachments'] && (
                  <div className="mt-2 overflow-x-auto">
                    <div className="flex gap-2 pb-2">
                      {message['attachments'].map((attachment, index) =>
                        attachment.fileType.startsWith('image/') ? (
                          <img
                            key={index}
                            src={attachment.url}
                            alt={attachment.fileName}
                            className="h-32 w-48 shrink-0 rounded-lg border object-cover"
                          />
                        ) : (
                          <div
                            key={index}
                            className="flex h-32 w-48 items-center justify-center rounded-lg border bg-gray-50"
                          >
                            <span className="text-sm text-gray-500">
                              PDF: {attachment.fileName}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {status === 'in_progress' && (
            <span className="flex gap-x-2 text-white">
              <Icons.spinner className="size-5 animate-spin text-black" />
              <p className="text-black">Thinking</p>
              <DotAnimation />
            </span>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scroll-smooth {
          scroll-behavior: smooth;
        }
      `}</style>

      <div className="w-full rounded-2xl border border-gray-300 bg-white p-2">
        {attachments.length > 0 && (
          <div className="mb-1 flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 rounded-lg bg-gray-200 px-3 py-1"
              >
                <span className="text-gray-700">{attachment.fileName}</span>
                <button
                  onClick={() =>
                    setAttachments((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Image src={CloseIcon} alt="close" width={16} height={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex w-full items-center gap-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf"
            multiple
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg p-2 hover:bg-gray-200"
          >
            <Image src={AttachmentIcon} alt="Attach" width={20} height={20} />
          </button>
          <input
            type="text"
            disabled={status === 'in_progress'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Help me brainstorm about..."
            className="w-full flex-1  p-1 text-gray-600 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue}
            className={`rounded-full p-2 ${
              inputValue
                ? 'cursor-pointer bg-black'
                : 'cursor-not-allowed bg-gray-200'
            }`}
          >
            <Image src={UploadIcon} alt="Send" width={18} height={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatContent;
