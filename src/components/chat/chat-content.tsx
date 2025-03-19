import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';

import { getEditorPrompt } from '@udecode/plate-ai/react';
import { deserializeMd } from '@udecode/plate-markdown';
import { PlateEditor } from '@udecode/plate/react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { toast } from 'sonner';

import { ChatInput } from '@/components/chat/chat-input';
import { ChatSettings } from '@/components/chat/chat-settings';
import { Icons } from '@/components/icons';
import { Button } from '@/components/plate-ui/button';
import { appendChatSpecificFileIds, storeMessage, updateDocumentTitle} from '@/firebase/firestore-dao';
import { useDocument } from '@/providers/document-provider';
import { useUserDataContext } from '@/providers/user-data-provider';
import { Message } from '@/types';
import {DotAnimation} from "@/utils/animations";
import { editorPromptTemplate } from '@/utils/editor-prompt-util';
import deserializeListMd, { classifyStart } from '@/utils/serialization-util';

import CloseIcon from '../../assets/icons/x.svg';

interface ContentProps {
  activeChatMessages: Message[];
  editor: PlateEditor;
  setActiveChatMessages: Dispatch<SetStateAction<Message[]>>;
  setStatus: Dispatch<SetStateAction<string>>;
  status: 'awaiting_message' | 'in_progress';
  changeEditorContent: (content: any) => void;
}

const ChatContent = ({
  activeChatMessages,
  changeEditorContent,
  editor,
  setActiveChatMessages,
  setStatus,
  status
}: ContentProps) => {
  const { activeUserDocument } = useDocument();
  const { data: session } = useSession();
  const userDataContext = useUserDataContext();
  const { setUserChats } = userDataContext;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<Message>({
    id: "Thinking...",
    content: "",
    fileNames: [],
    role: "assistant"
  });
  const [streamingDocument, setStreamingDocument] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChatMessages]);

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
        const timestamp = Date.now();
        const newMessage: Message = {
          id: timestamp.toString(),
          content: usedInput.trim(),
          fileNames: attachments.map(att => att.fileName),
          role: 'user'
        };

        // Store the message in Firestore
        await storeMessage(item!.chatId, {
          id: timestamp,
          content: usedInput.trim(),
          fileNames: newMessage.fileNames,
          role: 'user'
        });

        setInputValue('');
        setActiveChatMessages((prev) => [...prev, newMessage]);

        if (attachments.length > 0) {
          await uploadFiles(item!.chatId)
        }

        await sendMessage(item, newMessage)
      }
    }
  };

  const sendMessage = async (item, newMessage: Message) => {
    const serializedEditorValue = parseEditorAndGetDocumentAndSelection(
      newMessage.content
    );

    try {
      const result = await fetch('/api/ai/chat/agents', {
        body: JSON.stringify({
          chatId: item.chatId,
          messages: serializedEditorValue,
          userId: session!.user!.email!,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      if (result.body == null) {
        throw new Error('The response body is empty.');
      }
      
      const reader = result.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      
      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              const timestamp = Date.now();
              // Stream is complete, finalize the message
              const finalMessage: Message = {
                id: timestamp.toString(),
                content: accumulatedContent,
                fileNames: [],
                role: "assistant"
              };
              
              // Store the assistant's message in Firestore
              await storeMessage(item.chatId, {
                id: timestamp,
                content: accumulatedContent,
                fileNames: [],
                role: "assistant"
              });
              
              // Check if the content contains a document
              if (accumulatedContent.includes("<Document>") && accumulatedContent.includes("</Document>")) {
                const { document, documentTitle } = parseAssistantResponse({
                  ...streamingMessage,
                  content: accumulatedContent
                });
                updateEditorWithNewDocument(document, documentTitle)();
                toast.success(`Changing the current document to ${documentTitle}`);
              }
              
              // Reset streaming state
              setStreamingDocument(false);
              setStreamingMessage({
                ...streamingMessage,
                content: "",
                fileNames: []
              });
              
              // Add the final message to the chat
              setActiveChatMessages((messages) => [...messages, finalMessage]);
              break;
            }
            
            // Decode the chunk and update the streaming message
            const chunk = decoder.decode(value, { stream: true });
            
            // Split by newlines to handle multiple JSON objects in a single chunk
            const jsonStrings = chunk.split('\n').filter(str => str.trim() !== '');
            
            for (const jsonStr of jsonStrings) {
              try {
                const jsonChunk = JSON.parse(jsonStr);
                // Extract only the content from the delta field if it exists
                if (jsonChunk.choices && jsonChunk.choices[0]?.delta?.content) {
                  accumulatedContent += jsonChunk.choices[0].delta.content;
                }
              } catch (e) {
                // If not valid JSON, skip this part
                console.warn("Failed to parse JSON chunk:", e);
              }
            }
            
            // Set status to awaiting_message on first content received
            if (streamingMessage.content === "") {
              setStatus('awaiting_message');
            }
            
            // Update the streaming message with the accumulated content
            const newStreamingMessage = {
              ...streamingMessage,
              content: accumulatedContent,
            };
            
            // Check for document tags
            if (!streamingDocument && accumulatedContent.includes("<Document")) {
              setStreamingDocument(true);
            } else if (streamingDocument && accumulatedContent.includes("</Document>")) {
              setStreamingDocument(false);
            } else {
              setStreamingMessage(newStreamingMessage);
            }
          }
        } catch (error) {
          console.error("Error processing stream:", error);
          toast.error(`Error processing response: ${error.message}`);
        }
      };
      
      // Start processing the stream
      processStream();
    } catch (error) {
      toast.error(error.message);
    }
  }

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

  const uploadFiles = async (chatId: string) => {
    setUploadInProgress(true);
    attachments.forEach((attachment) =>
      changeFileUploadStatus(attachment, 'uploading')
    );
    const fileIds: any[] = [];

    const filesFormData = new FormData();
    filesFormData.append('userId', session!.user!.email!);
    if (chatId) {
      filesFormData.append('chatId', chatId);
    }
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

        const successfulFiles = resultJson.files.filter((file: any) => file.status === 'success');
        if (successfulFiles.length > 0) {
          fileIds.push(...successfulFiles);
        }

        const failedFiles = resultJson.files.filter((file: any) => file.status === 'error');
        if (failedFiles.length > 0) {
          toast.error(`Failed to upload some files: ${failedFiles.map((f: any) => f.fileName).join(', ')}`);
        }
      } catch (e) {
        toast.error(
          `Error uploading file ${attachment.fileName}. Please send the following message to the developers: ${e}`
        );
        console.error(
          `There was an error uploading the file: ${attachment.fileName}. Error: ${e}.`
        );
      }
    }

    if (fileIds.length > 0) {
      await appendChatSpecificFileIds(chatId, fileIds);
      
      // Update userChats state with new files
      setUserChats(prev => {
        if (!prev) return prev;
        return prev.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              files: [
                ...(chat.files || []),
                ...fileIds
              ]
            };
          }
          return chat;
        });
      });
    }
    setAttachments([]);
    setUploadInProgress(false);
  }

  const updateAttachments = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      if (fileInputRef != null && fileInputRef.current != null) {
        fileInputRef.current.value = '';
      }
    }
  };

  const updateEditorWithNewDocument = (document: string, documentTitle: string) => {
    return async () => {
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

      // A bit messy below. TODO: Refactor a bit here
      const currActiveDoc = {...activeUserDocument};
      currActiveDoc['document'] = result;
      if (currActiveDoc["documentName"] === "Untitled") {
        currActiveDoc["documentName"] = documentTitle
        const {error, result} = await updateDocumentTitle(currActiveDoc!.id!, documentTitle);
        if (error) {
          console.error(`Error saving title to db. Error: ${error}`)
        }
      }

      changeEditorContent(result);
    };
  };

  const extractTitleFromDocument = (document: string): string => {
    const titleRegex = /^(#{1,6})\s+(.*)/m;
    const match = document.match(titleRegex);
    return match ? match[2].trim().replaceAll("*", "") : 'New Document';
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
          <div className="whitespace-normal">{prepending}</div>
          <Button
            variant="roundedClear"
            className="inline-block w-auto cursor-pointer rounded-lg bg-black bg-opacity-50 p-2"
            onClick={updateEditorWithNewDocument(document, documentTitle)}
          >
            <div className="flex height-20">
              <FileText style={{ height: '100%' }}/>
              <div className="mx-1">{documentTitle}</div>
            </div>
          </Button>
          <div className="whitespace-normal">{appending}</div>
        </div>
      );
    }

    return (<div className="whitespace-pre-wrap">
      <Markdown className="react-markdown">{message.content}</Markdown>
      {message.fileNames && message.fileNames.map((fileName) => (
        <div key={fileName} className="flex items-center gap-2">
          <FileText className="size-5" />
          <span>{fileName}</span>
        </div>
      ))}
    </div>);
    // return <div className="whitespace-pre-wrap">{message.content}</div>;
  };

  const chatInputPositioningCssClass =
    activeChatMessages.length !== 0 ? 'h-full' : '';

  const adjustTextAreaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height to recalculate
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"; // Set height based on scrollHeight
    }
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
              </div>
            </div>
          ))}

          {streamingDocument ? <div className="flex 'justify-start'">
            <Button variant="roundedClear" className="ml-2" disabled>
              <Icons.spinner className="size-5 animate-spin text-black" />
              <p>Creating document...</p>
            </Button>
          </div> : <></>}

          {
            streamingMessage.content != '' && (
              <div className="flex 'justify-start'">
                <div className="rounded-xl px-4 py-2">
                  {parseUserAndAssistantMessageContent(streamingMessage)}
                </div>
              </div>
            )
          }

          {status === 'in_progress' && streamingMessage.content === "" && (
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
      {(status === "awaiting_message" || activeChatMessages.length > 0) && (
      <div className="w-full rounded-2xl border border-gray-300 bg-white p-2">
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
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
        <ChatInput
          handleKeyPress={handleKeyPress}
          handleSendMessage={handleSendMessage}
          fileInputRef={fileInputRef}
          inputValue={inputValue}
          setInputValue={setInputValue}
          status={status}
          textareaRef={textareaRef}
          updateAttachments={updateAttachments}
        />
        <ChatSettings />
      </div>
      )}
    </motion.div>
  );
};

export default ChatContent;
