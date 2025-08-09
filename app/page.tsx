"use client"

import React from "react"
import { ArrowUp, ChevronLeft, Mic, Plus, Video, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { type SendMessageRequest, type SendMessageResponse } from "@/lib/api-types"

type ChatItem =
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

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-black antialiased">
      {/* Reference image kept hidden; included per request to use it in generation */}
      <img src="/images/imessage-reference-3.png" alt="iMessage UI reference" className="hidden" />
      <FloatingChat />
    </main>
  )
}

function FloatingChat() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-8" aria-live="polite">
      <div
        className={cn(
          "w-full max-w-[460px]",
          "h-[82vh] max-h-[860px] min-h-[640px]",
          "rounded-[36px]",
          "shadow-2xl",
          "border border-[#EBEBF0]",
          "bg-white",
          "overflow-hidden",
        )}
        role="region"
        aria-label="iMessage chat"
      >
        <ChatInner />
      </div>
    </div>
  )
}

function ChatInner() {
  const [items, setItems] = React.useState<ChatItem[]>([
    { id: id(), kind: "separator", text: "iMessage" },
    { id: id(), kind: "separator", text: "Today 9:41 AM" },
    {
      id: id(),
      kind: "message",
      role: "bot",
      content: "Hey, I'm Clanker, your personal butler, what are you trying to schedule?",
    },
  ])
  const [input, setInput] = React.useState("")
  const [sending, setSending] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [items])

  async function handleSend() {
    const text = input.trim()
    if (!text) return

    const messageId = id() // Generate a unique ID for this message
    const userMsg: ChatItem = { id: messageId, kind: "message", role: "user", content: text }
    const popMsg: ChatItem = { id: id(), kind: "message", role: "bot", content: "typing...", pending: true }

    setItems((prev) => [...prev, userMsg, popMsg])
    setInput("")
    setSending(true)

    try {
      const res = await fetch("/api/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId: "demo-convo" } satisfies SendMessageRequest),
      })
      if (!res.ok) throw new Error("Request failed")
      const data: SendMessageResponse = await res.json()

      setItems((prev) =>
        prev.map((it) =>
          it.id === popMsg.id && it.kind === "message" ? { ...it, content: data.reply, pending: false } : it,
        ),
      )
    } catch {
      setItems((prev) =>
        prev.map((it) =>
          it.id === popMsg.id && it.kind === "message"
            ? { ...it, content: "Failed to get response. Please try again.", pending: false }
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

      {/* Chat area */}
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
            // message
            return (
              <React.Fragment key={it.id}>
                <Bubble role={it.role} pending={it.pending}>
                  {it.content}
                </Bubble>
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

      {/* Input bar */}
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
            {/* Right side icon: mic when empty, send arrow when text */}
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
          <Bot className="h-6 w-6 text-[#8E8E93]" /> {/* Robot icon */}
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

function Bubble({
  role,
  pending,
  children,
}: {
  role: "user" | "bot"
  pending?: boolean
  children: React.ReactNode
}) {
  const isUser = role === "user"

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "px-3 py-2 text-[17px] leading-6",
          "rounded-3xl", // Apply general roundedness
          isUser ? "bg-[#0A84FF] text-white rounded-br-md" : "bg-[#E9E9EB] text-black rounded-bl-md", // Override specific corner for tail
        )}
        role="status"
        aria-live={pending ? "polite" : "off"}
      >
        {pending && role === "bot" ? (
          <TypingIndicator />
        ) : (
          <span className={cn(pending ? "opacity-80" : "opacity-100")}>{children}</span>
        )}
      </div>
    </div>
  )
}

// TypingIndicator component for cycling sentences
function TypingIndicator() {
  const sentences = [
    "Searching the internet...",
    "Checking nearby services...",
    "Almost there...",
    "Making calls...",
    "Contacting relevant parties...",
    "Gathering information...",
    "Processing your request...",
    "Compiling results...",
  ]
  const [currentSentenceIndex, setCurrentSentenceIndex] = React.useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSentenceIndex((prevIndex) => (prevIndex + 1) % sentences.length)
    }, 2000) // Change sentence every 2 seconds

    return () => clearInterval(interval)
  }, [sentences.length])

  return (
    <div className="flex items-center px-1">
      <span>{sentences[currentSentenceIndex]}</span>
    </div>
  )
}

// Simple id generator without relying on crypto for broad compatibility
function id() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
