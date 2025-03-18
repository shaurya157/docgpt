'use client';


import {useState} from "react";

import { faker } from '@faker-js/faker';
import {useAssistant } from 'ai/react';
import {toast} from "sonner";

import { useSettings } from '@/components/editor/settings';
import {useDocument} from "@/providers/document-provider";

export const useChat = () => {
  const { keys, model } = useSettings();
  const { activeUserDocument } = useDocument();

  // Does nothing right now
  const [ data, setData ] = useState();

  const {
    append,
    error,
    input,
    messages,
    setInput,
    setMessages,
    status,
    stop,
    submitMessage,
    handleInputChange
  } = useAssistant({
    api: '/api/ai/chat/agents',
    body: {
      
    },
    threadId: activeUserDocument ? activeUserDocument['threadId'] : null,
    onError(error: Error): void {
      toast.error(
          `Something went wrong while creating/using the assistant. Error: ${error.message}`
      );
    },
  });

  return {
    append,
    error,
    input,
    isLoading: status === "in_progress",
    messages,
    setData,
    setInput,
    setMessages,
    stop,
    reload: () => {},
    handleInputChange,
    handleSubmit: submitMessage
  }

  // return useBaseChat({
  //   id: 'editor',
  //   api: '/api/ai/command',
  //   body: {
  //     // !!! DEMO ONLY: don't use API keys client-side
  //     apiKey: keys.openai,
  //     model: model.value,
  //   },
  //   fetch: async (input, init) => {
  //     console.log("Input: ", input)
  //     console.log("init: ", init)
  //     const res = await fetch(input, init);
  //     debugger
  //
  //     // if (!res.ok) {
  //     //   // Mock the API response. Remove it when you implement the route /api/ai/command
  //     //   await new Promise((resolve) => setTimeout(resolve, 400));
  //     //
  //     //   const stream = fakeStreamText();
  //     //
  //     //   return new Response(stream, {
  //     //     headers: {
  //     //       Connection: 'keep-alive',
  //     //       'Content-Type': 'text/plain',
  //     //     },
  //     //   });
  //     // }
  //
  //     return res;
  //   },
  // });
};

// Used for testing. Remove it after implementing useChat api.
const fakeStreamText = ({
  chunkCount = 10,
  streamProtocol = 'data',
}: {
  chunkCount?: number;
  streamProtocol?: 'data' | 'text';
} = {}) => {
  // Create 3 blocks with different lengths
  const blocks = [
    Array.from({ length: chunkCount }, () => ({
      delay: faker.number.int({ max: 100, min: 30 }),
      texts: faker.lorem.words({ max: 3, min: 1 }) + ' ',
    })),
    Array.from({ length: chunkCount + 2 }, () => ({
      delay: faker.number.int({ max: 100, min: 30 }),
      texts: faker.lorem.words({ max: 3, min: 1 }) + ' ',
    })),
    Array.from({ length: chunkCount + 4 }, () => ({
      delay: faker.number.int({ max: 100, min: 30 }),
      texts: faker.lorem.words({ max: 3, min: 1 }) + ' ',
    })),
  ];

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];

        // Stream the block content
        for (const chunk of block) {
          await new Promise((resolve) => setTimeout(resolve, chunk.delay));

          if (streamProtocol === 'text') {
            controller.enqueue(encoder.encode(chunk.texts));
          } else {
            controller.enqueue(
              encoder.encode(`0:${JSON.stringify(chunk.texts)}\n`)
            );
          }
        }

        // Add double newline after each block except the last one
        if (i < blocks.length - 1) {
          if (streamProtocol === 'text') {
            controller.enqueue(encoder.encode('\n\n'));
          } else {
            controller.enqueue(encoder.encode(`0:${JSON.stringify('\n\n')}\n`));
          }
        }
      }

      if (streamProtocol === 'data') {
        controller.enqueue(
          `d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":${blocks.reduce(
            (sum, block) => sum + block.length,
            0
          )}}}\n`
        );
      }

      controller.close();
    },
  });
};
