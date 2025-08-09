export async function POST(req: Request) {
  try {
    const { message } = (await req.json()) as { message: string }

    // Simulate network + processing delay
    await new Promise((r) => setTimeout(r, 15000))

    // Craft a playful reply
    const reply =
      message?.trim().length > 0
        ? `Okay! I got: "${message}". Here’s your mock response.`
        : "I did not catch that. Could you try again?"

    return Response.json({ reply })
  } catch (e) {
    return new Response(JSON.stringify({ reply: "Server error." }), { status: 500 })
  }
}
