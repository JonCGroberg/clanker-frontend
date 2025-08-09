"use client"

import React from "react"
import { ChevronLeft, Mic, Plus, Video, ArrowUp, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { generateId } from "@/lib/id"
import {
  CREATE_CONVERSATION_ENDPOINT_PATH,
  CONTINUE_CONVERSATION_ENDPOINT_PATH,
  resolveApiUrl,
} from "@/lib/api"
import {
  type CreateConversationRequest,
  type CreateConversationResponse,
  type ContinueConversationRequest,
  type ContinueConversationResponse,
  type Business,
} from "@/lib/api-types"
import { ChatBubble } from "./ChatBubble"
import { TypingIndicator } from "./TypingIndicator"

export type ChatItem =
  | {
    id: string
    kind: "message"
    role: "user" | "bot"
    content: string
    pending?: boolean
  }
  | {
    id: string
    kind: "separator"
    text: string
  }

// Helper function to format response with business data
function formatResponseWithBusinesses(responseMessage: string, businesses?: Record<string, Business>): string {
  // Try to parse businesses from response message if it contains JSON
  let parsedBusinesses = businesses

  if (!parsedBusinesses && responseMessage.includes('"businesses"')) {
    try {
      // Try to parse the entire response message as JSON
      const parsed = JSON.parse(responseMessage)
      if (parsed.businesses) {
        parsedBusinesses = parsed.businesses
      }
    } catch (error) {
      // If that fails, try to extract JSON from within the message
      try {
        const jsonMatch = responseMessage.match(/\{[^}]*"businesses"[^}]*\}/)
        if (jsonMatch) {
          const jsonStr = jsonMatch[0]
          const parsed = JSON.parse(jsonStr)
          parsedBusinesses = parsed.businesses
        }
      } catch (innerError) {
        console.error('Failed to parse businesses JSON:', innerError)
      }
    }
  }

  if (!parsedBusinesses || Object.keys(parsedBusinesses).length === 0) {
    return responseMessage
  }

  // Get the first business from the list
  const firstBusinessName = Object.keys(parsedBusinesses)[0]
  const firstBusiness = parsedBusinesses[firstBusinessName]

  return `Perfect! I've made an appointment for you at ${firstBusinessName}.

📞 Call them at ${firstBusiness.number} to confirm your appointment.

📍 ${firstBusinessName}
⭐ ${firstBusiness.stars} stars | ${firstBusiness.price_range}
🕒 ${firstBusiness.hours}`
}

// Helper function to format list of all businesses
function formatBusinessesList(businesses: Record<string, Business>): string {
  const businessNames = Object.keys(businesses)
  const total = businessNames.length

  const businessList = businessNames.map((name, index) => {
    const business = businesses[name]
    return `${index + 1}. ${name} (${business.stars}⭐ ${business.price_range})`
  }).join('\n')

  return `I found ${total} great options for you:

${businessList}

Let me contact each one to check their availability...`
}

// Helper function to format cycling message for a specific business
function formatCyclingMessage(businessName: string, business: Business, index: number, total: number): string {
  return `I'm contacting ${businessName} for you (${index + 1}/${total}):

📍 ${businessName}
📞 ${business.number}
⭐ ${business.stars} stars | ${business.price_range}
🕒 ${business.hours}

Let me check their availability...`
}

// Helper function to handle business response with two messages
function handleBusinessResponseWithTwoMessages(
  parsedBusinesses: Record<string, Business>,
  popMsg: ChatItem,
  setItems: React.Dispatch<React.SetStateAction<ChatItem[]>>,
  setCyclingBusinesses: React.Dispatch<React.SetStateAction<Record<string, Business> | null>>,
  setCyclingMessageId: React.Dispatch<React.SetStateAction<string | null>>,
  setCurrentBusinessIndex: React.Dispatch<React.SetStateAction<number>>,
  generateId: () => string
) {
  const businessNames = Object.keys(parsedBusinesses)
  const total = businessNames.length

  // First message: Show how many places found
  setItems((prev) =>
    prev.map((it) =>
      it.id === popMsg.id && it.kind === "message"
        ? { ...it, content: `I found ${total} great places for you!`, pending: false }
        : it,
    ),
  )

  // Second message: Create cycling message after a short delay
  setTimeout(() => {
    const cyclingMsgId = generateId()
    const firstBusinessName = businessNames[0]
    const firstBusiness = parsedBusinesses[firstBusinessName]

    // Add the cycling message
    setItems((prev) => [
      ...prev,
      {
        id: cyclingMsgId,
        kind: "message",
        role: "bot",
        content: `Kicking off call with ${firstBusinessName} (${firstBusiness.stars}⭐)...`,
        pending: true
      }
    ])

    // Start cycling through businesses
    setCyclingBusinesses(parsedBusinesses)
    setCyclingMessageId(cyclingMsgId)
    setCurrentBusinessIndex(0)
  }, 1500) // Wait 1.5 seconds before starting cycling
}

export function Chat() {
  const [conversationId, setConversationId] = React.useState<string | null>(null)
  const [items, setItems] = React.useState<ChatItem[]>([
    { id: generateId(), kind: "separator", text: "iMessage" },
    { id: generateId(), kind: "separator", text: "Today 9:41 AM" },
    {
      id: generateId(),
      kind: "message",
      role: "bot",
      content: "Hey, I'm Clanker, your personal butler, what are you trying to schedule?",
    },
  ])
  const [input, setInput] = React.useState("")
  const [sending, setSending] = React.useState(false)
  const [cyclingBusinesses, setCyclingBusinesses] = React.useState<Record<string, Business> | null>(null)
  const [currentBusinessIndex, setCurrentBusinessIndex] = React.useState(0)
  const [cyclingMessageId, setCyclingMessageId] = React.useState<string | null>(null)
  const [typingBusinesses, setTypingBusinesses] = React.useState<Record<string, Business> | null>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const cyclingTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [items])

  // Handle cycling through businesses
  React.useEffect(() => {
    if (cyclingBusinesses && cyclingMessageId) {
      const businessNames = Object.keys(cyclingBusinesses)
      const totalBusinesses = businessNames.length

      // Clear any existing timer
      if (cyclingTimerRef.current) {
        clearInterval(cyclingTimerRef.current)
      }

      // Start cycling every 2 seconds - cycle through businesses once, then final messages
      let cycleCount = 0
      const maxCycles = totalBusinesses // Cycle through businesses once
      const finalMessages = ["Compiling results...", "Comparing times...", "Scheduling...", "Gathering results..."]
      let finalMessageIndex = 0

      cyclingTimerRef.current = setInterval(() => {
        cycleCount++

        if (cycleCount < maxCycles) {
          // Still cycling through businesses
          setCurrentBusinessIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % totalBusinesses
            const businessName = businessNames[nextIndex]
            const business = cyclingBusinesses[businessName]
            const newContent = `Kicking off call with ${businessName} (${business.stars}⭐)...`

            setItems((prev) =>
              prev.map((item) =>
                item.id === cyclingMessageId
                  ? { ...item, content: newContent }
                  : item
              )
            )

            return nextIndex
          })
        } else {
          // Start cycling through final messages
          const finalContent = finalMessages[finalMessageIndex]

          setItems((prev) =>
            prev.map((item) =>
              item.id === cyclingMessageId
                ? { ...item, content: finalContent }
                : item
            )
          )

          finalMessageIndex = (finalMessageIndex + 1) % finalMessages.length

          // After cycling through final messages a few times, stop
          if (finalMessageIndex === 0 && cycleCount >= maxCycles + finalMessages.length) {
            setItems((prev) =>
              prev.map((item) =>
                item.id === cyclingMessageId
                  ? { ...item, content: finalMessages[finalMessages.length - 1], pending: false }
                  : item
              )
            )

            // Stop cycling
            if (cyclingTimerRef.current) {
              clearInterval(cyclingTimerRef.current)
              cyclingTimerRef.current = null
            }
            setCyclingBusinesses(null)
            setCyclingMessageId(null)
            setCurrentBusinessIndex(0)

            // Set a 60-second timer for success confirmation
            setTimeout(() => {
              const firstBusinessName = businessNames[0]
              const firstBusiness = cyclingBusinesses[firstBusinessName]
              const successMessage = `✅ Successfully confirmed appointment with ${firstBusinessName}! 📅 Tomorrow at 2:30 PM 📞 ${firstBusiness.number} ⭐ ${firstBusiness.stars} stars`

              setItems((prev) => [
                ...prev,
                {
                  id: generateId(),
                  kind: "message",
                  role: "bot",
                  content: successMessage,
                  pending: false
                }
              ])
            }, 10000) // 60 seconds
          }
        }
      }, 2000) // Change every 2 seconds
    }

    // Cleanup on unmount
    return () => {
      if (cyclingTimerRef.current) {
        clearInterval(cyclingTimerRef.current)
      }
    }
  }, [cyclingBusinesses, cyclingMessageId])

  async function handleSend() {
    const text = input.trim()
    if (!text) return

    const messageId = generateId()
    const userMsg: ChatItem = { id: messageId, kind: "message", role: "user", content: text }
    const popMsg: ChatItem = { id: generateId(), kind: "message", role: "bot", content: "typing...", pending: true }

    setItems((prev) => [...prev, userMsg, popMsg])
    setInput("")
    setSending(true)

    try {
      if (!conversationId) {
        const res = await fetch(resolveApiUrl(CREATE_CONVERSATION_ENDPOINT_PATH), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_request: text } satisfies CreateConversationRequest),
        })
        if (!res.ok) throw new Error("Request failed")
        const data: CreateConversationResponse = await res.json()

        setConversationId(data.conversation_id)

        // Extract businesses data for typing indicator and cycling
        let parsedBusinesses = data.businesses
        if (!parsedBusinesses && data.response_message.includes('"businesses"')) {
          try {
            const parsed = JSON.parse(data.response_message)
            if (parsed.businesses) {
              parsedBusinesses = parsed.businesses
            }
          } catch (error) {
            console.error('Failed to parse businesses JSON:', error)
          }
        }

        // Set businesses data for typing indicator
        if (parsedBusinesses) {
          setTypingBusinesses(parsedBusinesses)
        }

        if (parsedBusinesses && Object.keys(parsedBusinesses).length > 1) {
          handleBusinessResponseWithTwoMessages(
            parsedBusinesses,
            popMsg,
            setItems,
            setCyclingBusinesses,
            setCyclingMessageId,
            setCurrentBusinessIndex,
            generateId
          )
        } else {
          // Show regular formatted response
          const formattedResponse = formatResponseWithBusinesses(data.response_message, data.businesses)
          setItems((prev) =>
            prev.map((it) =>
              it.id === popMsg.id && it.kind === "message"
                ? { ...it, content: formattedResponse, pending: false }
                : it,
            ),
          )
        }
      } else {
        const res = await fetch(resolveApiUrl(CONTINUE_CONVERSATION_ENDPOINT_PATH), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            { conversation_id: conversationId, user_request: text } satisfies ContinueConversationRequest,
          ),
        })
        if (!res.ok) throw new Error("Request failed")
        const data: ContinueConversationResponse = await res.json()

        // Extract businesses data for typing indicator and cycling
        let parsedBusinesses = data.businesses
        if (!parsedBusinesses && data.response_message.includes('"businesses"')) {
          try {
            const parsed = JSON.parse(data.response_message)
            if (parsed.businesses) {
              parsedBusinesses = parsed.businesses
            }
          } catch (error) {
            console.error('Failed to parse businesses JSON:', error)
          }
        }

        // Set businesses data for typing indicator
        if (parsedBusinesses) {
          setTypingBusinesses(parsedBusinesses)
        }

        if (parsedBusinesses && Object.keys(parsedBusinesses).length > 1) {
          handleBusinessResponseWithTwoMessages(
            parsedBusinesses,
            popMsg,
            setItems,
            setCyclingBusinesses,
            setCyclingMessageId,
            setCurrentBusinessIndex,
            generateId
          )
        } else {
          // Show regular formatted response
          const formattedResponse = formatResponseWithBusinesses(data.response_message, data.businesses)
          setItems((prev) =>
            prev.map((it) =>
              it.id === popMsg.id && it.kind === "message"
                ? { ...it, content: formattedResponse, pending: false }
                : it,
            ),
          )
        }
      }
    } catch {
      setItems((prev) =>
        prev.map((it) =>
          it.id === popMsg.id && it.kind === "message"
            ? { ...it, content: "sorry there was an issue try again", pending: false }
            : it,
        ),
      )
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSend()
    }
  }

  const lastUserIndex = React.useMemo(() => {
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i]
      if (it.kind === "message" && it.role === "user") return i
    }
    return -1
  }, [items])

  return (
    <div className="flex h-full flex-col">
      <ChatHeader />

      <div ref={scrollRef} className={cn("flex-1", "px-3 sm:px-4", "py-3 sm:py-4", "overflow-y-auto", "bg-white")}>
        <div className="mx-auto flex w-full max-w-[620px] flex-col gap-2">
          {items.map((it, idx) => {
            if (it.kind === "separator") {
              return (
                <div key={it.id} className="text-center text-[12px] leading-none text-[#8E8E93]">
                  {it.text}
                </div>
              )
            }
            return (
              <React.Fragment key={it.id}>
                <ChatBubble role={it.role} pending={it.pending}>
                  {it.pending && it.role === "bot" ? <TypingIndicator businesses={typingBusinesses} isWaiting={true} /> : it.content}
                </ChatBubble>
                {it.role === "user" && idx === lastUserIndex && (
                  <div className="mt-1 flex justify-end pr-2">
                    <span className="text-[11px] leading-none text-[#8E8E93]">Delivered</span>
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      <div className="border-t border-[#EBEBF0] bg-white px-3 py-3 sm:px-4">
        <div className="mx-auto flex w-full max-w-[620px] items-center gap-2">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F2F7] text-[#0A84FF]"
            aria-label="Add more"
          >
            <Plus className="h-5 w-5" />
          </button>
          <div
            className={cn(
              "flex w-full items-center",
              "rounded-full",
              "bg-[#F2F2F7]",
              "px-4",
              "py-2.5",
              "border border-transparent",
              "focus-within:border-[#D1D1D6]",
            )}
          >
            <label htmlFor="imessage-input" className="sr-only">
              Message
            </label>
            <input
              id="imessage-input"
              ref={inputRef}
              type="text"
              inputMode="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="iMessage"
              aria-label="iMessage text input"
              className={cn(
                "w-full bg-transparent outline-none",
                "placeholder:text-[#8E8E93]",
                "text-[17px] leading-6",
                "font-normal",
                "text-black",
              )}
            />
            {input.trim().length === 0 ? (
              <Mic className="h-5 w-5 text-[#8E8E93]" aria-hidden="true" />
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className={cn(
                  "ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full",
                  "bg-[#0A84FF] text-white",
                  sending ? "opacity-60" : "opacity-100",
                )}
                aria-label="Send"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatHeader() {
  return (
    <header className="flex items-center justify-between border-b border-[#EBEBF0] bg-white px-3 py-2.5 sm:px-4">
      <button className="inline-flex items-center gap-1 text-[#0A84FF]" aria-label="Back">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div className="flex min-w-0 flex-col items-center">
        <div className="h-10 w-10 rounded-full bg-[#E9E9EB] flex items-center justify-center">
          <Bot className="h-6 w-6 text-[#8E8E93]" />
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-[13px] font-medium text-black">
          <span>Clanker</span>
          <span className="text-[#8E8E93]">{">"}</span>
        </div>
      </div>
      <button className="inline-flex items-center text-[#0A84FF]" aria-label="FaceTime">
        <Video className="h-5 w-5" />
      </button>
    </header>
  )
}
