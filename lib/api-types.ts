import { z } from "zod"

export const sendMessageRequestSchema = z.object({
  conversationId: z.string().min(1, "conversationId is required"),
  message: z.string().min(1, "message is required"),
})

export type SendMessageRequest = z.infer<typeof sendMessageRequestSchema>

export const sendMessageResponseSchema = z.object({
  reply: z.string(),
})

export type SendMessageResponse = z.infer<typeof sendMessageResponseSchema>
