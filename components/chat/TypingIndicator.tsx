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
          return `Kicking off call to ${name} (${business.stars}⭐)...`
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
      "Gathering information...",
      "Processing your request...",
    ]
  }, [businesses, isWaiting])

  React.useEffect(() => {
    if (businesses && Object.keys(businesses).length > 0) {
      // For businesses, cycle through each once then stop
      const businessNames = Object.keys(businesses)
      let cycleCount = 0
      const maxCycles = businessNames.length

      const interval = setInterval(() => {
        if (cycleCount < maxCycles) {
          setCurrentIndex(cycleCount)
          cycleCount++
        } else {
          // Stop cycling after going through each business once
          clearInterval(interval)
        }
      }, 2000)

      return () => clearInterval(interval)
    } else {
      // For generic messages, cycle continuously
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length)
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [businesses, messages.length])

  return (
    <div className="flex items-center px-1">
      <span>{messages[currentIndex]}</span>
    </div>
  )
}
