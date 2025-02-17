import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';

import { getEditorPrompt } from '@udecode/plate-ai/react';
import { deserializeMd } from '@udecode/plate-markdown';
import { PlateEditor } from '@udecode/plate/react';
import { Message } from 'ai';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { toast } from 'sonner';

import { ChatSettings } from '@/components/chat/chat-settings';
import { chatSettingsHotLinks } from '@/components/chat/hot-links';
import { Icons } from '@/components/icons';
import { Button } from '@/components/plate-ui/button';
import { appendDocumentSpecificFileIds } from '@/firebase/firestore-dao';
import { useChatSettings } from '@/providers/chat-settings-provider';
import { useUserDataContext } from '@/providers/user-data-provider';
import {DotAnimation} from "@/utils/animations";
import { editorPromptTemplate } from '@/utils/editor-prompt-util';
import { readDataStream } from '@/utils/read-data-stream';
import deserializeListMd, { classifyStart } from '@/utils/serialization-util';

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
  activeChatMessages: Message[];
  activeUserDocument: any;
  editor: PlateEditor;
  editorOpen: boolean;
  setActiveChatMessages: Dispatch<SetStateAction<Message[]>>;
  setStatus: Dispatch<SetStateAction<string>>;
  status: 'awaiting_message' | 'in_progress';
  onNewChat: () => {};
  setActiveItem: (id: any, documentRefreshOnly: boolean) => void;
  setEditorOpen: (bool: boolean) => void;
}

const ChatContent = ({
  activeChatMessages,
  activeUserDocument,
  editor,
  editorOpen,
  setActiveChatMessages,
  setActiveItem,
  setEditorOpen,
  setStatus,
  status,
  onNewChat,
}: ContentProps) => {
  const { data: session } = useSession();
  const { selectedAssistant, handleSelectedAssistant, handleSelectedTemplate } =
    useChatSettings();
  const { chatAssistantId } = useUserDataContext();
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<
    Array<{
      file: File;
      fileName: string;
      fileType: string;
      status: string;
      url: string;
    }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    return editorPrompt!;
  };

  const handleSendMessage =  (input?: string) => {
    return async () => {
      setStatus('in_progress');
      let item = activeUserDocument;
      const usedInput = input === undefined ? inputValue : input

      // handles cases where the template is set in the new document but a new thread isn't spawned just yet
      if (!item || !item['id']) {
        item = await onNewChat();
      }

      if (usedInput.trim() || attachments.length > 0) {
        const newMessage: Message = {
          id: Date.now().toString(),
          content: usedInput.trim(),
          role: 'user',
          // attachments: attachments.length > 0 ? attachments : undefined,
        };
        setInputValue('');
        setActiveChatMessages((prev) => [...prev, newMessage]);

        if (attachments.length > 0) {
          setUploadInProgress(true);
          attachments.forEach((attachment) =>
              changeFileUploadStatus(attachment, 'uploading')
          );
          const fileIds: any[] = [];

          const filesFormData = new FormData();
          filesFormData.append('vectorStoreId', item!['vectorStoreId']);
          filesFormData.append('userId', session!.user!.email!);
          for (const attachment of attachments) {
            try {
              filesFormData.set('files', attachment.file);
              const filesResult = await fetch('/api/ai/files', {
                body: filesFormData,
                method: 'POST',
              });
              const resultJson = await filesResult.json();
              if (resultJson.status === 400) {
                throw new Error(resultJson.message);
              }
              const filesResultJson: Map<string, string>[] =
                  resultJson['openAiFileIds'];

              fileIds.push(...filesResultJson);
            } catch (e) {
              toast.error(
                  `Error uploading file ${attachment.fileName}. Please send the following message to the developers: ${e}`
              );
              console.error(
                  `There was an error uploading the file: ${attachment.fileName}. Error: ${e}.`
              );
            }
          }

          await appendDocumentSpecificFileIds(item!['id'], fileIds);
          setAttachments([]);
          setUploadInProgress(false);
        }

        const formData = new FormData();
        const serializedEditorValue = parseEditorAndGetDocumentAndSelection(
            newMessage.content
        );
        formData.append('message', serializedEditorValue);
        formData.append('threadId', item['threadId']);
        formData.append('assistantId', chatAssistantId!);
        formData.append(
            'additionalInstructions',
            `\
        # ROLE
        ${selectedAssistant['role']}

        # GOALS
        ${selectedAssistant['goals']}

        # ADDITIONAL RULES
        ${selectedAssistant['rules']}
      `
        );

        const result = await fetch('/api/ai/chat/brainstormassistant', {
          body: formData,
          method: 'POST',
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
                const message: Message = {
                  id: value.id,
                  content: value.content[0].text.value,
                  role: value.role,
                }
                setActiveChatMessages((messages: Message[]) => [
                  ...messages,
                  message,
                ]);

                if (message.content.includes("<Document>")) {
                  const { document, documentTitle } = parseAssistantResponse(message)
                  updateEditorWithNewDocument(document)()
                  toast.success(`Changing the current document to ${documentTitle}`)
                }

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

  const changeFileUploadStatus = (attachment, status) => {
    const tempAttachments = attachments;
    tempAttachments.find((att) => att.url === attachment.url)!['status'] =
      status;
    setAttachments(tempAttachments);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments = Array.from(files).map((file) => ({
        file,
        fileName: file.name,
        fileType: file.type,
        status: 'waiting',
        url: URL.createObjectURL(file),
      }));

      setAttachments((prev) => [...prev, ...newAttachments]);
    }
  };

  const updateEditorWithNewDocument = (document: string) => {
    return () => {
      if (!editorOpen) { setEditorOpen(true) }
      let result: any[] = [];
      const doubleNewLineSplitArr = document.split('\n\n');
      doubleNewLineSplitArr.forEach((doubleLineSplitText) => {
        const singleNewLineSplit = doubleLineSplitText.split('\n');

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

  const extractTitleFromDocument = (document: string): string => {
    const titleRegex = /^(#{1,6})\s+(.*)/m;
    const match = document.match(titleRegex);
    return match ? match[2].trim() : 'New Document';
  }

  const parseAssistantResponse = (message: Message) => {
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

    return {
      appending,
      document,
      documentTitle,
      prepending,
    }
  }

  const parseUserAndAssistantMessageContent = (message: Message) => {
    if (message.role != 'user' && message.content.includes('<Document>')) {
      const { appending, document, documentTitle, prepending } = parseAssistantResponse(message)

      return (
        <div className="space-y-4">
          <div>{prepending}</div>
          <div
            className="inline-block w-auto cursor-pointer rounded-lg bg-sky-600 bg-opacity-50 p-2"
            onClick={updateEditorWithNewDocument(document)}
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

    const reg = message.content.replaceAll("\n\n", "\n")
    // debugger
    return <Markdown>{message.content}</Markdown>;
    // return <div className="whitespace-pre-wrap">{message.content}</div>;
  };

  const chatInputPositioningCssClass =
    activeChatMessages.length !== 0 || editorOpen ? 'h-full' : '';

  const handleQuickLinkClick = (hotLink: {}) => {
    return () => {
      handleSelectedAssistant(hotLink['assistantName']);
      handleSelectedTemplate(hotLink['templateId']);
      handleSendMessage(hotLink["prompt"])()
    };
  };

  const adjustTextAreaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reset height to recalculate
      textarea.style.height = textarea.scrollHeight + "px"; // Set height based on scrollHeight
    }
  }

  return (
    <motion.div
      className={
        'flex flex-col items-start p-4 ' + chatInputPositioningCssClass
      }
      style={{ width: editorOpen ? '30%' : '50%' }}
      transition={{
        damping: 20,
        duration: 0.2,
        stiffness: 100,
        type: 'spring',
      }}
    >
      {activeChatMessages.length === 0 && (
        <div>
          <h1 className="mb-4 font-bold leading-none tracking-tight text-gray-900 dark:text-white md:text-4xl">
            What can I help with?
          </h1>
          <div className="mb-8 flex flex-col">
            <div>
              {chatSettingsHotLinks.map((hotlink) => {
                return (
                  <Button
                    key={hotlink['displayName']}
                    className="m-2"
                    onClick={handleQuickLinkClick(hotlink)}
                  >
                    {hotlink['displayName']}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <div className="w-full flex-1 overflow-y-auto scroll-smooth whitespace-pre-wrap">
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
                            className="h-32 w-48 shrink-0 rounded-lg border object-cover"
                            alt={attachment.fileName}
                            src={attachment.url}
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
              <p className="text-black">
                {uploadInProgress ? 'Uploading files...' : 'Thinking...'}
              </p>
              <DotAnimation />
            </span>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <style global jsx>{`
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
                {attachment.status === 'uploading' ? (
                  <Icons.spinner className="size-5 animate-spin text-black" />
                ) : (
                  ''
                )}
                <span className="text-gray-700">{attachment.fileName}</span>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() =>
                    setAttachments((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  <Image alt="close" height={16} src={CloseIcon} width={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex w-full items-center gap-1">
          <input
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
            type="file"
            multiple
          />
          <ChatSettings
            activeUserDocument={activeUserDocument}
            setActiveItem={setActiveItem}
          />
          <button
            className="cursor-pointer rounded-lg p-2 hover:bg-gray-200"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image alt="Attach" height={20} src={AttachmentIcon} width={20} />
          </button>
          <textarea
            ref={textareaRef}
            className="height-30 max-h-52 w-full flex-1  overflow-auto p-1 text-gray-600 focus:outline-none"
            disabled={status === 'in_progress'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Help me brainstorm about..."
          />
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
    </motion.div>
  );
};

export default ChatContent;
