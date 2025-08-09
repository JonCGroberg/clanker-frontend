import { z } from "zod"

// Create a new conversation
export const createConversationRequestSchema = z.object({
  user_request: z.string().min(1, "user_request is required"),
})

export type CreateConversationRequest = z.infer<typeof createConversationRequestSchema>

export const createConversationResponseSchema = z.object({
  conversation_id: z.string().uuid(),
  response_message: z.string(),
})

export type CreateConversationResponse = z.infer<typeof createConversationResponseSchema>

// Continue an existing conversation
export const continueConversationRequestSchema = z.object({
  conversation_id: z.string().uuid(),
  user_request: z.string().min(1, "user_request is required"),
})

export type ContinueConversationRequest = z.infer<typeof continueConversationRequestSchema>

export const continueConversationResponseSchema = z.object({
  response_message: z.string(),
})

export type ContinueConversationResponse = z.infer<typeof continueConversationResponseSchema>
