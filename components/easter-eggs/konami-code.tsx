"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
]

export default function KonamiCode() {
  const [sequence, setSequence] = useState<string[]>([])
  const [activated, setActivated] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      setSequence((prev) => {
        const newSequence = [...prev, event.code].slice(-KONAMI_CODE.length)

        if (JSON.stringify(newSequence) === JSON.stringify(KONAMI_CODE) && !activated) {
          setActivated(true)
          toast({
            title: "🎉 Easter Egg Found!",
            description: "You discovered the Konami code! A classic gaming secret.",
          })

          // Record easter egg discovery
          fetch("/api/easter-eggs/discover", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eggId: "konami" }),
          })

          setTimeout(() => {
            setActivated(false)
          }, 5000)
        }

        return newSequence
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activated, toast])

  return null
}