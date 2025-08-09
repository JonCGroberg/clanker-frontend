import React from "react"
import { cn } from "@/lib/utils"

export function ChatBubble({
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
          "rounded-3xl",
          isUser ? "bg-[#0A84FF] text-white rounded-br-md" : "bg-[#E9E9EB] text-black rounded-bl-md",
        )}
        role="status"
        aria-live={pending ? "polite" : "off"}
      >
        {pending && role === "bot" ? (
          <span className={cn(pending ? "opacity-80" : "opacity-100")}>{children}</span>
        ) : (
          <span className={cn(pending ? "opacity-80" : "opacity-100")}>{children}</span>
        )}
      </div>
    </div>
  )
}
