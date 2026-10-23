"use client"

import { Zap } from "lucide-react"
import { motion } from "framer-motion"

interface TradeExecutionBadgeProps {
  activeTradesCount: number
  onClick: () => void
}

export function TradeExecutionBadge({ activeTradesCount, onClick }: TradeExecutionBadgeProps) {
  if (activeTradesCount === 0) return null

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      onClick={onClick}
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-4 z-50 flex items-center gap-1.5 px-3 py-2
        bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500
        text-white font-semibold text-xs rounded-full transition-all duration-200
        shadow-lg"
    >
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
        <Zap className="w-4 h-4" />
      </motion.div>
      <span>{activeTradesCount}</span>
      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full" />
    </motion.button>
  )
}
