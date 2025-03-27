'use client';


import {useState} from "react";

import { useChat as useBaseChat } from 'ai/react';
import { useSession } from 'next-auth/react';

import { useSettings } from '@/components/editor/settings';
import {useDocument} from "@/providers/document-provider";
export const useChat = () => {
  const { keys, model } = useSettings();
  const { activeUserDocument } = useDocument();
  const { data: session } = useSession();

  // Does nothing right now
  const [ data, setData ] = useState();

  // const {
  //   append,
  //   error,
  //   input,
  //   messages,
  //   setInput,
  //   setMessages,
  //   status,
  //   stop,
  //   submitMessage,
  //   handleInputChange
  // } = useAssistant({
  //   api: '/api/ai/chat/agents',
  //   body: {
      
  //   },
  //   threadId: activeUserDocument ? activeUserDocument['threadId'] : null,
  //   onError(error: Error): void {
  //     toast.error(
  //         `Something went wrong while creating/using the assistant. Error: ${error.message}`
  //     );
  //   },
  // });

  // return {
  //   append,
  //   error,
  //   input,
  //   isLoading: status === "in_progress",
  //   messages,
  //   setData,
  //   setInput,
  //   setMessages,
  //   stop,
  //   reload: () => {},
  //   handleInputChange,
  //   handleSubmit: submitMessage
  // }

  return useBaseChat({
    id: 'editor',
    api: '/api/ai/command',
    body: {
      chatId: activeUserDocument?.chatId,
      userId: session?.user?.email,
    },
    streamProtocol: 'data',
    fetch: async (input, init) => {
      const res = await fetch(input, init);  
      // if (!res.ok) {
      //   // Mock the API response. Remove it when you implement the route /api/ai/command
      //   await new Promise((resolve) => setTimeout(resolve, 400));
      //
      //   const stream = fakeStreamText();
      //
      //   return new Response(stream, {
      //     headers: {
      //       Connection: 'keep-alive',
      //       'Content-Type': 'text/plain',
      //     },
      //   });
      // }
  
      return res;
    },
  });
};
