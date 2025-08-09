import {
  createConversationRequestSchema,
  createConversationResponseSchema,
  continueConversationRequestSchema,
  continueConversationResponseSchema,
} from "@/lib/api-types"

export async function POST(req: Request) {
  try {
    const json = await req.json()
    // Try continue first (has conversation_id), otherwise treat as create
    const parsedContinue = continueConversationRequestSchema.safeParse(json)
    const parsedCreate = createConversationRequestSchema.safeParse(json)

    if (!parsedContinue.success && !parsedCreate.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request body", issues: { create: parsedCreate.error?.flatten(), cont: parsedContinue.error?.flatten() } }),
        { status: 400 },
      )
    }

    // Simulate network + processing delay
    await new Promise((r) => setTimeout(r, 1200))

    if (parsedContinue.success) {
      const { user_request } = parsedContinue.data
      const response = continueConversationResponseSchema.parse({ response_message: `echo: ${user_request}` })
      return Response.json(response)
    }

    if (parsedCreate.success) {
      const { user_request } = parsedCreate.data
    const fakeConversationId = "00000000-0000-0000-0000-000000000001"
    const response = createConversationResponseSchema.parse({
      conversation_id: fakeConversationId,
      response_message: `echo: ${user_request}`,
    })
    return Response.json(response)
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error." }), { status: 500 })
  }
}
