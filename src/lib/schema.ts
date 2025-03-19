import { z } from "zod";

export const AgentState = z.object({
  chatId: z.string(),
  context: z.array(z.object({
    content: z.string(),
    score: z.number(),
    source: z.string()
  })).default([]),
  draft: z.string().default(""),
  feedback: z.array(z.string()).default([]),
  query: z.string(),
  userId: z.string()
});

export type TAgentState = z.infer<typeof AgentState>;