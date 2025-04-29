import { z } from "zod";

import { CustomStreamController } from "@/utils/custom-stream";

export const AgentState = z.object({
  activeDocument: z.string().default(""),
  chatHistory: z.array(z.object({
    content: z.string(),
    fileNames: z.array(z.string()).default([]),
    role: z.enum(['user', 'assistant'])
  })).default([]),
  chatId: z.string(),
  context: z.array(z.object({
    content: z.string(),
    score: z.number(),
    source: z.string()
  })).default([]),
  customContexts: z.array(z.object({
    id: z.string().default(""),
    content: z.string(),
    metadata: z.record(z.any()).optional(),
    type: z.string()
  })).default([]),
  draft: z.string().default(""),
  feedback: z.array(z.string()).default([]),
  model: z.string(),
  query: z.string(),
  slackMessages: z.array(z.object({
    channelName: z.string(),
    messages: z.array(z.string()),
  })).default([]),
  streamController: z.custom<CustomStreamController>(),
  synthesizedIntent: z.enum(['create', 'edit', 'general']).optional(),
  userId: z.string(),
});

export type TAgentState = z.infer<typeof AgentState>;