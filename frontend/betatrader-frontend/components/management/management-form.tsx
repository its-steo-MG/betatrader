"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { initiateManagement } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, DollarSign, Target, Smartphone, AlertCircle, Building2 } from "lucide-react"
import { ACCOUNT_TYPE_LABELS } from "@/types/account"

const USD_TO_KSH_RATE = 130

interface ManagementFormProps {
  onSuccess: (managementId: string) => void
}

export function ManagementForm({ onSuccess }: ManagementFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ stake: "", target_profit: "", mpesa_phone: "", account_type: "standard" as "standard" | "pro-fx" })

  const stakeNum = Number.parseFloat(formData.stake) || 0
  const targetProfitNum = Number.parseFloat(formData.target_profit) || 0
  const serviceFeeUSD = targetProfitNum * 0.2
  const serviceFeeKSH = serviceFeeUSD * USD_TO_KSH_RATE

  const isValid = stakeNum >= 50 && targetProfitNum >= 10 && formData.mpesa_phone.length >= 9 && formData.mpesa_phone.startsWith("254")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setIsLoading(true)
    try {
      const response = await initiateManagement({ stake: stakeNum, target_profit: targetProfitNum, mpesa_phone: formData.mpesa_phone, account_type: formData.account_type })
      if (response.data?.management_id) {
        onSuccess(response.data.management_id)
        toast({ title: "Success", description: "Management request initiated! Check your phone for M-Pesa prompt." })
      } else {
        toast({ title: "Error", description: response.error || "Failed to initiate payment", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const field = "bg-white dark:bg-white/10 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 shadow-[inset_2px_2px_4px_#e2e8f0] dark:shadow-none"

  return (
    <Card className="bg-white dark:bg-white/[0.05] border-slate-200 dark:border-white/10 shadow-[6px_6px_14px_#c8cdd6,-6px_-6px_14px_#ffffff] dark:shadow-none dark:backdrop-blur-xl">
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Initiate Management Request</h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-white/50">Fill in your details to start professional account management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-white/70 flex items-center gap-2"><Building2 className="w-4 h-4" /> Account Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(ACCOUNT_TYPE_LABELS) as Array<keyof typeof ACCOUNT_TYPE_LABELS>).map((type) => (
                <button key={type} type="button" onClick={() => setFormData({ ...formData, account_type: type as "standard" | "pro-fx" })}
                  className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${formData.account_type === type ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-500/20 text-slate-900 dark:text-white shadow-[3px_3px_6px_#0891b2] dark:shadow-none" : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-white/50 hover:border-slate-300"}`}>
                  <p className="font-semibold text-sm sm:text-base">{ACCOUNT_TYPE_LABELS[type]}</p>
                  <p className="text-xs mt-1 opacity-70">{type === "standard" ? "Regular trading account" : "Professional FX account"}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-white/70 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Stake Amount (USD)</label>
            <Input type="number" placeholder="Minimum $50" min="50" step="0.01" value={formData.stake} onChange={(e) => setFormData({ ...formData, stake: e.target.value })} className={field} />
            {stakeNum > 0 && stakeNum < 50 && <p className="text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Minimum stake is $50</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-white/70 flex items-center gap-2"><Target className="w-4 h-4" /> Target Profit (USD)</label>
            <Input type="number" placeholder="Minimum $10" min="10" step="0.01" value={formData.target_profit} onChange={(e) => setFormData({ ...formData, target_profit: e.target.value })} className={field} />
            {targetProfitNum > 0 && targetProfitNum < 10 && <p className="text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Minimum target profit is $10</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-white/70 flex items-center gap-2"><Smartphone className="w-4 h-4" /> M-Pesa Phone Number</label>
            <Input type="text" placeholder="254712345678" value={formData.mpesa_phone} onChange={(e) => setFormData({ ...formData, mpesa_phone: e.target.value })} className={field} />
          </div>

          {targetProfitNum >= 10 && (
            <div className="bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-300 dark:border-cyan-500/30 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="text-slate-500 dark:text-white/50 text-sm">Service Fee (20% of target)</p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-white/50">${serviceFeeUSD.toFixed(2)} USD</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">KES {serviceFeeKSH.toFixed(2)}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
            </div>
          )}

          {isValid && (
            <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-5 sm:py-6 text-base sm:text-lg shadow-[4px_4px_12px_#0891b2] dark:shadow-none">
              {isLoading ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</> : <>Pay KES {serviceFeeKSH.toFixed(2)} via M-Pesa</>}
            </Button>
          )}
        </form>
      </div>
    </Card>
  )
}
