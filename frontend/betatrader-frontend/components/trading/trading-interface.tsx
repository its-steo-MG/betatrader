"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { formatCurrency } from "@/lib/format-currency"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TradingInterfaceProps {
  markets: Array<{ id: number; name: string; profit_multiplier: string }>
  selectedMarket: string | null
  onMarketSelect: (market: string) => void
  balance: number
  onBalanceChange: (balance: number) => void
  onSessionProfitChange: (profit: number) => void
  tradingMode?: "manual" | "robot"
  selectedRobot?: number | null
  onStartTrading?: (params: {
    market_id: number
    trade_type_id: number
    direction: string
    amount: number
    account_type: string
    use_martingale: boolean
    martingale_level: number
    targetProfit: number
    stopLoss: number
    profit: number
  }) => void
  accountType: string
}

interface TradeType {
  id: number
  name: string
}

export function TradingInterface({
  markets,
  selectedMarket,
  onMarketSelect,
  balance,
  onBalanceChange,
  onSessionProfitChange,
  tradingMode = "manual",
  selectedRobot,
  onStartTrading,
  accountType,
}: TradingInterfaceProps) {
  const { toast } = useToast()
  const [tradeTypes, setTradeTypes] = useState<TradeType[]>([])
  const [selectedTradeType, setSelectedTradeType] = useState<number | null>(null)
  const [direction, setDirection] = useState<string>("buy")
  const [amount, setAmount] = useState<string>("1")
  const [useMartingale, setUseMartingale] = useState(false)
  const [targetProfit, setTargetProfit] = useState<string>("0")
  const [stopLoss, setStopLoss] = useState<string>("0")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchTradeTypes = async () => {
      const { data, error } = await api.getTradeTypes()
      if (error) {
        toast({ title: "Error", description: "Failed to load trade types", variant: "destructive" })
      } else {
        setTradeTypes(data as TradeType[])
      }
    }
    fetchTradeTypes()
  }, [toast])

  const getDirectionLabels = (tradeTypeName: string | undefined) => {
    switch (tradeTypeName?.toLowerCase()) {
      case "rise/fall":
        return { primary: "Rise", secondary: "Fall" }
      case "buy/sell":
      default:
        return { primary: "Buy", secondary: "Sell" }
    }
  }

  const selectedTradeTypeName = tradeTypes.find((t) => t.id === selectedTradeType)?.name
  const { primary: primaryLabel, secondary: secondaryLabel } = getDirectionLabels(selectedTradeTypeName)

  useEffect(() => {
    setDirection(primaryLabel.toLowerCase())
  }, [selectedTradeType, primaryLabel])

  const handlePlaceTrade = async () => {
    setIsLoading(true)
    try {
      const marketObj = markets.find((m) => m.name === selectedMarket)
      if (!marketObj || !selectedTradeType || !amount) throw new Error("Missing required fields")
      const amountNum = Number.parseFloat(amount)
      if (isNaN(amountNum)) throw new Error("Invalid amount")
      if (amountNum < 0.5) throw new Error("Minimum trade amount is 0.5 USD")
      if (amountNum > balance) throw new Error("Insufficient balance")

      const params = {
        market_id: marketObj.id,
        trade_type_id: selectedTradeType,
        direction,
        amount: amountNum,
        account_type: accountType,
        use_martingale: useMartingale,
        martingale_level: 0,
        targetProfit: Number.parseFloat(targetProfit) || 0,
        stopLoss: Number.parseFloat(stopLoss) || 0,
      }

      onStartTrading?.({ ...params, profit: 0 })
      toast({ title: "Trade submitted", description: `Processing $${formatCurrency(amountNum)} stake...` })
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = "w-full bg-white dark:bg-white/[0.05] border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 h-11 rounded-xl shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:shadow-none"

  return (
    <div className="space-y-5">
      {/* Market */}
      <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-white/70 mb-2">Market</label>
        <Select onValueChange={onMarketSelect} value={selectedMarket || ""}>
          <SelectTrigger className={inputClass}>
            <SelectValue placeholder="Select market" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            {markets.map((market) => (
              <SelectItem key={market.id} value={market.name}>{market.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Trade Type */}
      <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-white/70 mb-2">Trade Type</label>
        <Select onValueChange={(value) => setSelectedTradeType(Number(value))} value={selectedTradeType?.toString() || ""}>
          <SelectTrigger className={inputClass}>
            <SelectValue placeholder="Select trade type" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            {tradeTypes.map((type) => (
              <SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Direction */}
      <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-white/70 mb-2">Direction</label>
        <div className="flex gap-3">
          <button
            onClick={() => setDirection(primaryLabel.toLowerCase())}
            className={`drop-on-top relative flex-1 py-3 rounded-xl font-semibold transition-all overflow-hidden
              ${direction === primaryLabel.toLowerCase()
                ? "bg-cyan-500 text-white shadow-[4px_4px_8px_#0891b2,-2px_-2px_6px_#22d3ee] dark:shadow-none"
                : "bg-slate-100 text-slate-600 border border-slate-200 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] dark:bg-white/5 dark:text-white/70 dark:border-white/10 dark:shadow-none hover:bg-slate-200 dark:hover:bg-white/10"}`}
          >
            <span className="relative z-[1]">{primaryLabel}</span>
          </button>
          <button
            onClick={() => setDirection(secondaryLabel.toLowerCase())}
            className={`drop-on-top relative flex-1 py-3 rounded-xl font-semibold transition-all overflow-hidden
              ${direction === secondaryLabel.toLowerCase()
                ? "bg-rose-500 text-white shadow-[4px_4px_8px_#be123c,-2px_-2px_6px_#fb7185] dark:shadow-none"
                : "bg-slate-100 text-slate-600 border border-slate-200 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] dark:bg-white/5 dark:text-white/70 dark:border-white/10 dark:shadow-none hover:bg-slate-200 dark:hover:bg-white/10"}`}
          >
            <span className="relative z-[1]">{secondaryLabel}</span>
          </button>
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-white/70 mb-2">Amount (USD)</label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className={inputClass}
          min="1"
          max={balance}
        />
        <p className="text-xs text-slate-500 dark:text-white/50 mt-2">Available: ${formatCurrency(balance)}</p>
      </div>

      {/* Target Profit */}
      <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-white/70 mb-2">Target Profit (USD)</label>
        <Input type="number" value={targetProfit} onChange={(e) => setTargetProfit(e.target.value)} placeholder="Optional" className={inputClass} min="0" />
      </div>

      {/* Stop Loss */}
      <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-white/70 mb-2">Stop Loss (USD)</label>
        <Input type="number" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} placeholder="Optional" className={inputClass} min="0" />
      </div>

      {/* Martingale */}
      <div className="flex items-center gap-3">
        <input type="checkbox" id="martingale" checked={useMartingale} onChange={(e) => setUseMartingale(e.target.checked)} className="w-4 h-4 rounded border-slate-300 dark:border-white/30" />
        <label htmlFor="martingale" className="text-sm font-medium text-slate-600 dark:text-white/70 cursor-pointer">Use Martingale</label>
      </div>

      {/* Place Trade */}
      <Button
        onClick={handlePlaceTrade}
        disabled={isLoading || !selectedMarket || !selectedTradeType || !amount}
        className="drop-on-top relative w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500
          text-white font-bold py-6 text-lg rounded-xl transition-all overflow-hidden
          shadow-[6px_6px_12px_#0891b2,-4px_-4px_10px_#22d3ee] dark:shadow-none disabled:opacity-50"
      >
        <span className="relative z-[1]">{isLoading ? "Placing Trade..." : "Place Trade"}</span>
      </Button>
    </div>
  )
}
