"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, Copy, Pause, Play, Trash2 } from "lucide-react"
import { pauseSubscription, createCopySubscription } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface SubscriptionCardProps {
  subscription: {
    id: number
    trader: { id: number; username?: string }
    allocated_amount: number
    current_pnl: number
    copied_trades_count: number
    is_active: boolean
    account: { id: number }
  }
  onUpdate?: () => void
}

const card = "bg-white dark:bg-white/[0.05] border-slate-200 dark:border-white/10 shadow-[6px_6px_14px_#c8cdd6,-6px_-6px_14px_#ffffff] dark:shadow-none dark:backdrop-blur-xl"
const tile = "bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10"

export function SubscriptionCard({ subscription, onUpdate }: SubscriptionCardProps) {
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const displayName = subscription.trader.username || `Trader #${subscription.trader.id}`
  const avatarFallback = subscription.trader.username ? subscription.trader.username.substring(0, 2).toUpperCase() : `T${subscription.trader.id}`
  const allocatedAmount = subscription.allocated_amount
  const pnl = subscription.current_pnl
  const copiedTrades = subscription.copied_trades_count
  const returnPercent = allocatedAmount > 0 ? ((pnl / allocatedAmount) * 100).toFixed(2) : "0"

  const handlePause = async () => {
    setIsUpdating(true)
    const result = await pauseSubscription(subscription.id)
    setIsUpdating(false)
    if (result.error) toast({ title: "Error", description: result.error, variant: "destructive" })
    else { toast({ title: "Paused", description: `Copying ${displayName} paused` }); onUpdate?.() }
  }
  const handleResume = async () => {
    setIsUpdating(true)
    const result = await createCopySubscription({ trader: subscription.trader.id, account: subscription.account.id, allocated_amount: subscription.allocated_amount })
    setIsUpdating(false)
    if (result.error) toast({ title: "Error", description: result.error, variant: "destructive" })
    else { toast({ title: "Resumed", description: `Now copying ${displayName} again` }); onUpdate?.() }
  }
  const handleStop = async () => { await handlePause() }

  return (
    <Card className={`${card} transition-all ${subscription.is_active ? "border-cyan-400 dark:border-cyan-500/40" : "opacity-70"}`}>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-cyan-500">
            <AvatarFallback className="bg-slate-200 dark:bg-white/10 font-bold">{avatarFallback}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white">{displayName}</h3>
            <Badge variant="outline" className={`mt-1 text-xs ${subscription.is_active ? "bg-cyan-50 text-cyan-700 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300" : ""}`}>{subscription.is_active ? "Active" : "Paused"}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className={`${tile} p-3 rounded-lg space-y-1 text-center`}>
            <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-white/50"><DollarSign size={12} /><span className="text-[10px] uppercase font-semibold">Allocated</span></div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">${allocatedAmount.toFixed(2)}</p>
          </div>
          <div className={`${tile} p-3 rounded-lg space-y-1 text-center`}>
            <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-white/50"><TrendingUp size={12} /><span className="text-[10px] uppercase font-semibold">P&L</span></div>
            <p className={`text-sm font-bold ${pnl >= 0 ? "text-cyan-600 dark:text-cyan-400" : "text-rose-600 dark:text-rose-400"}`}>{pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}</p>
          </div>
          <div className={`${tile} p-3 rounded-lg space-y-1 text-center`}>
            <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-white/50"><Copy size={12} /><span className="text-[10px] uppercase font-semibold">Trades</span></div>
            <p className="text-sm font-bold text-slate-800 dark:text-white">{copiedTrades}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-white/50">
            <span>Return</span>
            <span className={pnl >= 0 ? "text-cyan-600 dark:text-cyan-400 font-bold" : "text-rose-600 dark:text-rose-400 font-bold"}>{returnPercent}%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full ${pnl >= 0 ? "bg-cyan-500" : "bg-rose-500"}`} style={{ width: `${Math.min(Math.abs(Number(returnPercent)), 100)}%` }} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 sm:p-6 pt-0 flex flex-col sm:flex-row gap-2 sm:gap-3">
        {subscription.is_active ? (
          <Button onClick={handlePause} disabled={isUpdating} variant="outline" className="flex-1 gap-2 shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] dark:shadow-none"><Pause size={16} /> Pause</Button>
        ) : (
          <Button onClick={handleResume} disabled={isUpdating} className="flex-1 gap-2 bg-cyan-600 text-white shadow-[4px_4px_12px_#0891b2] dark:shadow-none"><Play size={16} /> Resume</Button>
        )}
        <Button onClick={handleStop} disabled={isUpdating} variant="outline" className="flex-1 gap-2 text-rose-600"><Trash2 size={16} /> Stop</Button>
      </CardFooter>
    </Card>
  )
}
