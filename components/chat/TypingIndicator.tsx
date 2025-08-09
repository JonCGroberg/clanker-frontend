import React from "react"

export function TypingIndicator() {
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
    }, 2000)

    return () => clearInterval(interval)
  }, [sentences.length])

  return (
    <div className="flex items-center px-1">
      <span>{sentences[currentSentenceIndex]}</span>
    </div>
  )
}
