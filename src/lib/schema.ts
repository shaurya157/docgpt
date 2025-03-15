import { z } from "zod";

export const AgentState = z.object({
  userId: z.string(),
  chatId: z.string(),
  query: z.string(),
  context: z.array(z.object({
    content: z.string(),
    source: z.string(),
    score: z.number()
  })).default([]),
  draft: z.string().default(""),
  feedback: z.array(z.string()).default([])
});

export type TAgentState = z.infer<typeof AgentState>;