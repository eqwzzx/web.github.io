import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider" // Assumes shadcn's ThemeProvider
import Navbar from "@/components/core/navbar"
import { Toaster } from "@/components/ui/toaster" // For notifications

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Discord Webhook Sender",
  description: "Send Discord webhooks with ease and manage users.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
            <footer className="py-4 text-center text-sm text-muted-foreground border-t">
              Discord Webhook Sender &copy; {new Date().getFullYear()}
            </footer>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}