'use client';

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { useDocument } from '@/providers/document-provider';
import { useUserDataContext } from '@/providers/user-data-context-provider';
import { AssistantStatus, Message } from 'ai';
import { motion } from 'framer-motion';
import { Paperclip } from 'lucide-react';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

import { readDataStream } from '@/lib/read-data-stream';
import { Icons } from '@/components/icons';
import { Button } from '@/components/plate-ui/button';
import { Input } from '@/components/plate-ui/input';

const roleToColorMap: Record<any, string> = {
  system: 'lightred',
  user: 'orange',
  function: 'lightblue',
  assistant: 'green',
};

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

export function ChatWindow() {
  const prompt = 'Help me brainstorm ideas for...';
  const initialized = useRef(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>(prompt);
  const [files, setFiles] = useState<File[] | null>(null);
  const { data: session } = useSession();
  const { threadId, chatAssistantId } = useUserDataContext();
  const { activeUserDocument } = useDocument();
  const [error, setError] = useState<unknown | undefined>(undefined);
  const [status, setStatus] = useState<AssistantStatus>('awaiting_message');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setStatus('in_progress');

    setMessages((messages: Message[]) => [
      ...messages,
      { id: '', role: 'user' as 'user', content: message! },
    ]);

    // const filesFormData = new FormData();
    // filesFormData.append('vectorStoreId', activeUserDocument!['vectorStoreId']);
    // filesFormData.append('userId', session!.user!.email!);
    // files?.forEach((file) => {
    //   filesFormData.append('files', file);
    // });
    // const filesResult = await fetch('/api/ai/files', {
    //   method: 'POST',
    //   body: filesFormData,
    // });
    // const filesResultJson: Map<string, string>[] = (await filesResult.json())[
    //   'openAiFileIds'
    // ];
    //
    // appendDocumentSpecificFileIds(activeUserDocument!['id'], filesResultJson);

    const formData = new FormData();
    formData.append('message', message as string);
    formData.append('threadId', threadId!);
    formData.append('assistantId', chatAssistantId!);
    const result = await fetch('/api/ai/chat/brainstormassistant', {
      method: 'POST',
      body: formData,
    });

    setFiles(null);

    if (result.body == null) {
      throw new Error('The response body is empty.');
    }

    try {
      for await (const { type, value } of readDataStream(
        result.body.getReader()
      )) {
        switch (type) {
          case 'assistant_message': {
            setMessages((messages: Message[]) => [
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
            setError(value);
            break;
          }
        }
      }
    } catch (error) {
      setError(error);
    }

    setStatus('awaiting_message');
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(e.target.files as FileList));
  };

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleOpenFileExplorer = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    (async function () {
      if (!initialized.current) {
        initialized.current = true;
        try {
          const chatHistoryResponse = await fetch('/api/ai/thread/messages', {
            method: 'POST',
            body: JSON.stringify({
              userId: session!.user!.email!,
              threadId,
              chatAssistantId,
            }),
          });
          const json = await chatHistoryResponse.json();
          if (!chatHistoryResponse.ok) {
            toast.error(json['error']);
          } else {
            const messages = json['messages'] as Message[];
            messages.reverse().forEach((message) => {
              setMessages((messages: Message[]) => [
                ...messages,
                {
                  id: message.id,
                  role: message.role,
                  content: message.content[0]['text']['value'],
                },
              ]);
            });
          }
        } catch (e) {
          toast.error('Something unexpected happened...');
          console.error(e);
        }
      }
    })();
  }, []);

  return (
    <main className="flex min-h-screen flex-col p-24 ">
      <div className="mx-auto flex w-full max-w-xl flex-col ">
        <h1 className="pb-4 text-3xl font-extrabold text-indigo-400">
          Ask DocGPT Anything🤖
        </h1>
        {error != null && (
          <div className="relative rounded-md bg-red-500 px-6 py-4 text-white">
            <span className="block sm:inline">
              Error: {(error as any).toString()}
            </span>
          </div>
        )}

        {messages.map((m: Message, idx) => (
          <div
            key={m.id + idx}
            className="whitespace-pre-wrap"
            style={{ color: roleToColorMap[m.role] }}
          >
            <strong>{`${m.role.toUpperCase()}: `}</strong>
            <ReactMarkdown>{m.content}</ReactMarkdown>
            <br />
          </div>
        ))}

        {status === 'in_progress' && (
          <span className="flex gap-x-2 text-white">
            <Icons.spinner className="size-5 animate-spin text-cyan-600" />
            <p className="text-cyan-600">Thinking</p>
            <DotAnimation />
          </span>
        )}

        <div className="fixed bottom-0 mx-auto mb-8 flex w-full max-w-xl flex-col items-start bg-inherit text-white">
          <div className="flex flex-col bg-amber-500">
            {files?.map((file, idx) => {
              return (
                <span key={`${file.name} + idx`}>
                  <p>{file.name}</p>
                </span>
              );
            })}
          </div>

          <form
            onSubmit={handleFormSubmit}
            className="mx-auto mb-8 flex w-full max-w-xl items-start bg-inherit text-white"
          >
            <Button
              type="button"
              disabled={status !== 'awaiting_message'}
              onClick={handleOpenFileExplorer}
              className="group flex cursor-pointer gap-x-1 text-gray-200"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="sr-only"
                multiple={true}
              />
              <Paperclip className="size-4 transition-colors duration-200 ease-in-out group-hover:text-white" />
            </Button>
            <div className="flex w-full items-start">
              <Input
                disabled={status !== 'awaiting_message'}
                className="flex-1 bg-neutral-900 placeholder:text-white"
                placeholder={prompt}
                onChange={handleMessageChange}
              />
              <Button
                className="ml-2 flex cursor-pointer "
                variant="outline"
                type="submit"
                disabled={status !== 'awaiting_message'}
              >
                <Icons.arrowRight className="text-gray-500 transition-colors duration-200 ease-in-out hover:text-white" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
