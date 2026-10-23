"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface SignalPurchaseCardProps {
  onPurchaseSuccess: () => void
  aiBotId: number | null
}

export default function SignalPurchaseCard({
  onPurchaseSuccess,
  aiBotId,
}: SignalPurchaseCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleActivate = async () => {
    if (!aiBotId) {
      toast.error("AI Signal Bot ID not found")
      return
    }

    setIsLoading(true)
    try {
      const accountType = localStorage.getItem("login_type") as "demo" | "standard" | undefined
      const response = await api.purchaseRobot(aiBotId, accountType || "standard")

      if (response.error) {
        toast.error(response.error)
        return
      }

      toast.success("AI Signal Bot activated! Start scanning for signals.")
      onPurchaseSuccess()
    } catch (error) {
      toast.error("Failed to activate AI Signal Bot")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!aiBotId) {
    return <div className="text-rose-500 dark:text-rose-400">Error: AI Signal Bot not configured</div>
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative overflow-hidden rounded-2xl p-8
        bg-white border border-slate-200
        shadow-[10px_10px_20px_#b8bdc6,-10px_-10px_20px_#ffffff]
        dark:bg-white/[0.07] dark:border-white/20 dark:shadow-none dark:backdrop-blur-[32px] dark:saturate-150
        dark:liquid-glass">
        
        {/* Locked Icon */}
        <div className="text-center mb-6 relative z-[1]">
          <div className="inline-block bg-cyan-100 dark:bg-cyan-500/20 border border-cyan-300 dark:border-cyan-500/50 rounded-full p-6 mb-4">
            <svg className="w-12 h-12 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-slate-800 dark:text-white text-center mb-2 relative z-[1]">
          AI Signal Bot
        </h3>

        <p className="text-slate-500 dark:text-white/60 text-center mb-6 text-sm leading-relaxed relative z-[1]">
          Real-time AI-powered market signals for forex & crypto. Scans all markets
          and delivers high-probability entries with Take Profit & Stop Loss.
        </p>

        <div className="text-center mb-8 relative z-[1]">
          <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">$200</div>
          <p className="text-slate-500 dark:text-white/50 text-sm">One-time activation</p>
        </div>

        <Button
          onClick={handleActivate}
          disabled={isLoading}
          className="drop-on-top relative w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500
            text-white font-bold py-3 rounded-xl transition-all overflow-hidden
            shadow-[6px_6px_12px_#0891b2,-4px_-4px_10px_#22d3ee] dark:shadow-none"
        >
          <span className="relative z-[1]">{isLoading ? "Processing..." : "Activate for $200"}</span>
        </Button>

        <div className="mt-8 space-y-3 relative z-[1]">
          <p className="text-slate-500 dark:text-white/50 text-xs font-semibold uppercase">Features</p>
          <ul className="space-y-2 text-sm text-slate-700 dark:text-white/80">
            <li className="flex items-center gap-2"><span className="text-cyan-500">✓</span> Global Market Scanning</li>
            <li className="flex items-center gap-2"><span className="text-cyan-500">✓</span> RSI & ATR Analysis</li>
            <li className="flex items-center gap-2"><span className="text-cyan-500">✓</span> High-Probability Signals</li>
            <li className="flex items-center gap-2"><span className="text-cyan-500">✓</span> Automatic TP/SL</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
