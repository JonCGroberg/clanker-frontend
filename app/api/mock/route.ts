import { sendMessageRequestSchema, sendMessageResponseSchema } from "@/lib/api-types"

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = sendMessageRequestSchema.safeParse(json)
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request body", issues: parsed.error.flatten() }),
        { status: 400 },
      )
    }

    const { message, conversationId } = parsed.data

    // Simulate network + processing delay
    await new Promise((r) => setTimeout(r, 15000))

    // Craft a playful reply that includes the conversation id for demonstration
    const reply =
      message?.trim().length > 0
        ? `(${conversationId}) Okay! I got: "${message}". Here’s your mock response.`
        : "I did not catch that. Could you try again?"

    const response = sendMessageResponseSchema.parse({ reply })
    return Response.json(response)
  } catch (e) {
    return new Response(JSON.stringify({ reply: "Server error." }), { status: 500 })
  }
}
