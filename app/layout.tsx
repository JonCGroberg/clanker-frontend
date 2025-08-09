import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Clanker",
  description: "Your Personal AI Assistant",
  generator: "v0.dev",
  applicationName: "Clanker",
  metadataBase: new URL("https://clanker.vercel.app"),
  openGraph: {
    title: "Clanker",
    description: "Your Personal AI Assistant",
    url: "https://clanker.vercel.app",
    siteName: "Clanker",
    images: [
      {
        url: "/placeholder.jpg",
        width: 1200,
        height: 630,
        alt: "Clanker Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clanker",
    description: "iMessage-style chat UI built with Next.js",
    images: ["/placeholder.jpg"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>{/* No style tag here */}</head>
      <body>{children}</body>
    </html>
  )
}
