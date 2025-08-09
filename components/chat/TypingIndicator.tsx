import React from "react"
import { type Business } from "@/lib/api-types"

interface TypingIndicatorProps {
  businesses?: Record<string, Business> | null
  isWaiting?: boolean
}

export function TypingIndicator({ businesses, isWaiting = true }: TypingIndicatorProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)

  // If we have businesses data, create cycling messages with business info
  const messages = React.useMemo(() => {
    if (businesses && Object.keys(businesses).length > 0) {
      const businessNames = Object.keys(businesses)
      return businessNames.map((name, index) => {
        const business = businesses[name]
        if (isWaiting) {
          return `Kicking off call with ${name} (${business.stars}⭐)...`
        } else {
          return `Kicking off call with ${name} (${business.stars}⭐)...`
        }
      })
    }

    // Fallback to generic messages
    return [
      "Searching the internet...",
      "Checking nearby services...",
      "Almost there...",
      "Making calls...",
      "Contacting relevant parties...",
      "Gathering information...",
      "Processing your request...",
      "Compiling results...",
    ]
  }, [businesses, isWaiting])

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [messages.length])

  return (
    <div className="flex items-center px-1">
      <span>{messages[currentIndex]}</span>
    </div>
  )
}
