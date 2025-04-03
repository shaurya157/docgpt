import { z } from "zod";

import { CustomStreamController } from "@/utils/custom-stream";

export const AgentState = z.object({
  activeBlock: z.string().default(""),
  activeDocument: z.string().default(""),
  activeSelection: z.string().default(""),
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
  draft: z.string().default(""),
  feedback: z.array(z.string()).default([]),
  model: z.string(),
  query: z.string(),
  reminder: z.string().default(""),
  streamController: z.custom<CustomStreamController>(),
  userId: z.string(),
  userIntent: z.string().default("")
});

export type TAgentState = z.infer<typeof AgentState>;