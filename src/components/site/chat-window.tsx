"use client";

import { Icons } from "@/components/icons";
import { readDataStream } from "@/lib/read-data-stream";
import {ChangeEvent, FormEvent, useEffect, useRef, useState} from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import {AssistantStatus, Message} from "ai";
import {Button} from "@/components/plate-ui/button";
import {Input} from "@/components/plate-ui/input";
import {Paperclip} from "lucide-react";
import {useUserDataContext} from "@/providers/user-data-context-provider";
import {useSession} from "next-auth/react";
import {toast} from "sonner";

const roleToColorMap: Record<any, string> = {
  system: "lightred",
  user: "orange",
  function: "lightblue",
  assistant: "green"
};

const DotAnimation = () => {
  const dotVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } }
  };

  // Stagger children animations
  const containerVariants = {
    initial: { transition: { staggerChildren: 0 } },
    animate: { transition: { staggerChildren: 0.5, staggerDirection: 1 } },
    exit: { transition: { staggerChildren: 0.5, staggerDirection: 1 } }
  };

  const [key, setKey] = useState(0);

  // ...
  return (
    <motion.div
      key={key}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex gap-x-0.5 -ml-1"
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

export function ChatWindow(){
  const prompt = "Help me brainstorm ideas for...";
  const initialized = useRef(false)
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>(prompt);
  const [files, setFiles] = useState<File[] | null>(null);
  const {data: session} = useSession();
  const {threadId, chatAssistantId} = useUserDataContext();
  const [error, setError] = useState<unknown | undefined>(undefined);
  const [status, setStatus] = useState<AssistantStatus>("awaiting_message");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setStatus("in_progress");

    setMessages((messages: Message[]) => [
      ...messages,
      { id: "", role: "user" as "user", content: message! }
    ]);

    const formData = new FormData();
    formData.append("message", message as string);
    formData.append("threadId", threadId!);
    files?.forEach((file) => formData.append("files", file));

    formData.append("assistantId", chatAssistantId!);

    const result = await fetch("/api/ai/chat/brainstormassistant", {
      method: "POST",
      body: formData
    });

    setFiles(null);

    if (result.body == null) {
      throw new Error("The response body is empty.");
    }

    try {
      for await (const { type, value } of readDataStream(
        result.body.getReader()
      )) {
        switch (type) {
          case "assistant_message": {
            setMessages((messages: Message[]) => [
              ...messages,
              {
                id: value.id,
                role: value.role,
                content: value.content[0].text.value
              }
            ]);
            break;
          }
          case "error": {
            setError(value);
            break;
          }
        }
      }
    } catch (error) {
      setError(error);
    }

    setStatus("awaiting_message");
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
    (async function() {
      if (!initialized.current) {
        initialized.current = true
        try {
          const chatHistoryResponse = await fetch('/api/ai/thread/messages', {
            method: 'POST',
            body: JSON.stringify({
              userId: session!.user!.email!,
              threadId,
              chatAssistantId
            }),
          })
          const json = await chatHistoryResponse.json();
          if (!chatHistoryResponse.ok) {
            toast.error(json["error"])
          } else {
            const messages = json["messages"] as Message[]
            messages.reverse().forEach((message) => {
              setMessages((messages: Message[]) => [
                ...messages,
                {
                  id: message.id,
                  role: message.role,
                  content: message.content[0]["text"]["value"]
                }
              ]);
            })
          }
        } catch (e) {
          toast.error("Something unexpected happened...")
          console.error(e);
        }
      }
    })();
  }, []);

  return (
    <main className="flex min-h-screen flex-col p-24 ">
      <div className="flex flex-col w-full max-w-xl mx-auto ">
        <h1 className="text-3xl font-extrabold pb-4 text-indigo-400">
          Ask DocGPT Anything🤖
        </h1>
        {error != null && (
          <div className="relative bg-red-500 text-white px-6 py-4 rounded-md">
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

        {status === "in_progress" && (
          <span className="text-white flex gap-x-2">
						<Icons.spinner className="animate-spin w-5 h-5 text-cyan-600" />
            <p className="text-cyan-600">Thinking</p>
						<DotAnimation/>
					</span>
        )}

        <form
          onSubmit={handleFormSubmit}
          className="flex items-start text-white max-w-xl mx-auto fixed bottom-0 w-full mb-8 bg-inherit"
        >
          <Button
            type="button"
            disabled={status !== "awaiting_message"}
            onClick={handleOpenFileExplorer}
            className="flex gap-x-1 group cursor-pointer text-gray-200"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="sr-only"
              multiple={true}
            />
            <Paperclip className="group-hover:text-white transition-colors duration-200 ease-in-out w-4 h-4" />
            {/*<span className="group-hover:text-white transition-colors duration-200 ease-in-out text-xs">*/}
						{/*	{file ? file.name : "Add a file"}*/}
						{/*</span>*/}
          </Button>
          <div className="flex items-start w-full">
            <Input
              disabled={status !== "awaiting_message"}
              className="flex-1 placeholder:text-white bg-neutral-900"
              placeholder={prompt}
              onChange={handleMessageChange}
            />
            <Button
              className="flex ml-2 cursor-pointer "
              variant="outline"
              type="submit"
              disabled={status !== "awaiting_message"}
            >
              <Icons.arrowRight className="text-gray-500 hover:text-white transition-colors duration-200 ease-in-out" />
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
