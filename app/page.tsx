import React from "react"
import { Chat } from "@/components/chat/Chat"

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
        className={
          "w-full max-w-[460px] h-[82vh] max-h-[860px] min-h-[640px] rounded-[36px] shadow-2xl border border-[#EBEBF0] bg-white overflow-hidden"
        }
        role="region"
        aria-label="iMessage chat"
      >
        <Chat />
      </div>
    </div>
  )
}
