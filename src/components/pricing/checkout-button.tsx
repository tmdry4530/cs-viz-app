"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface CheckoutButtonProps {
  disabled?: boolean
  className?: string
}

export function CheckoutButton({ disabled = false, className }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCheckout() {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      })

      if (!res.ok) {
        throw new Error("Checkout failed")
      }

      const data = await res.json()
      router.push(data.url)
    } catch {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? "처리 중..." : "Pro 업그레이드"}
    </Button>
  )
}
