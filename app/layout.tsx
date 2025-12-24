import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mobile Control Agent',
  description: 'AI-powered mobile device remote control interface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-agent-darker min-h-screen">{children}</body>
    </html>
  )
}
