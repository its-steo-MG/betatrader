"use client"

import { Star, MapPin, Shield, MessageCircle, User } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import DepositModal from "./deposit-modal"
import WithdrawalModal from "./withdrawal-modal"
import PaymentInfoDisplay from "./payment-info-display"

interface AgentCardProps {
  agent: {
    id: number
    name: string
    method: string
    location: string
    rating: number
    reviews: number
    deposit_rate_kes_to_usd: number
    withdrawal_rate_usd_to_kes: number
    min_amount?: number
    max_amount?: number
    response_time?: string
    verified: boolean
    image?: string
    instructions?: string
    paypal_email?: string
    paypal_link?: string
    bank_name?: string
    bank_account_name?: string
    bank_account_number?: string
    bank_swift?: string
    mpesa_phone?: string
    binance_address?: string
  }
}

export default function AgentCard({ agent }: AgentCardProps) {
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const [imgError, setImgError] = useState(false)
  const router = useRouter()

  const getMethodBadge = (method: string) => {
    const badges: Record<string, { label: string; color: string; bgColor: string }> = {
      mpesa: { label: "M-Pesa", color: "text-cyan-700 dark:text-cyan-300", bgColor: "bg-cyan-100 dark:bg-cyan-500/20" },
      paypal: { label: "PayPal", color: "text-blue-700 dark:text-blue-300", bgColor: "bg-blue-100 dark:bg-blue-500/20" },
      bank: { label: "Bank", color: "text-cyan-700 dark:text-cyan-300", bgColor: "bg-cyan-100 dark:bg-cyan-500/20" },
      bank_transfer: { label: "Bank", color: "text-cyan-700 dark:text-cyan-300", bgColor: "bg-cyan-100 dark:bg-cyan-500/20" },
      binance: { label: "Binance", color: "text-amber-700 dark:text-amber-300", bgColor: "bg-amber-100 dark:bg-amber-500/20" },
    }
    return badges[method.toLowerCase()] || { label: method.charAt(0).toUpperCase() + method.slice(1), color: "text-slate-700 dark:text-white/70", bgColor: "bg-slate-100 dark:bg-white/10" }
  }

  const badge = getMethodBadge(agent.method)
  const hasValidImage = agent.image && !imgError && agent.image.trim() !== ""

  const handleChatWithAgent = () => router.push(`/customercare?agent_id=${agent.id}&agent_name=${encodeURIComponent(agent.name)}`)

  return (
    <div className="bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-lg hover:border-cyan-300 transition-all duration-300 flex flex-col h-full shadow-[6px_6px_14px_#c8cdd6,-6px_-6px_14px_#ffffff] dark:shadow-none dark:backdrop-blur-xl">
      {/* Image or Default Avatar */}
      <div className="relative w-full h-32 sm:h-40 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30">
        {hasValidImage ? (
          <Image 
            src={agent.image!} 
            alt={agent.name} 
            fill 
            className="object-cover" 
            onError={() => setImgError(true)} 
            unoptimized={agent.image!.startsWith("http")} 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">{agent.name}</h3>
            <span className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${badge.color} ${badge.bgColor}`}>{badge.label}</span>
            <div className="flex items-center gap-1 sm:gap-2 text-slate-600 dark:text-white/60"><MapPin className="w-3 h-3 sm:w-4 sm:h-4" /><span className="text-xs sm:text-sm font-medium">{agent.location}</span></div>
          </div>
          <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0"><Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /><span className="text-sm sm:text-base font-bold">{agent.rating.toFixed(1)}</span><span className="text-xs sm:text-sm text-slate-500 dark:text-white/50">({agent.reviews})</span></div>
        </div>
      </div>

      <div className="grid grid-cols-2 border-b border-slate-200 dark:border-white/10">
        <div className="p-4 sm:p-6 border-r border-slate-200 dark:border-white/10"><p className="text-xs text-slate-600 dark:text-white/60 mb-1 sm:mb-2 font-semibold">Deposit Rate</p><p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">1 USD = {agent.deposit_rate_kes_to_usd} KES</p></div>
        <div className="p-4 sm:p-6"><p className="text-xs text-slate-600 dark:text-white/60 mb-1 sm:mb-2 font-semibold">Withdrawal Rate</p><p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">1 USD = {agent.withdrawal_rate_usd_to_kes} KES</p></div>
      </div>

      {agent.verified && <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-white/10 flex items-center gap-1 sm:gap-2 text-cyan-700 dark:text-cyan-300"><Shield className="w-3 h-3 sm:w-4 sm:h-4" /><span className="text-xs sm:text-sm font-medium">Verified Agent</span></div>}

      {agent.response_time && <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-white/10"><p className="text-xs text-slate-600 dark:text-white/60 mb-1 sm:mb-2 font-semibold">Response Time</p><p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">{agent.response_time}</p></div>}

      {(agent.min_amount || agent.max_amount) && <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-white/10"><p className="text-xs text-slate-600 dark:text-white/60 mb-1 sm:mb-2 font-semibold">Transaction Limits</p><p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">{agent.min_amount ? `${Number(agent.min_amount).toLocaleString()}` : "No min"} - {agent.max_amount ? `${Number(agent.max_amount).toLocaleString()}` : "No max"}</p></div>}

      {agent.instructions && <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-white/10 bg-cyan-50 dark:bg-cyan-500/10 max-h-40 overflow-y-auto"><p className="text-xs text-cyan-700 dark:text-cyan-300">{agent.instructions}</p></div>}

      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-white/10"><p className="text-xs text-slate-600 dark:text-white/60 mb-2 font-semibold">Payment Details</p><PaymentInfoDisplay method={agent.method} agent={{ paypal_email: agent.paypal_email, paypal_link: agent.paypal_link, bank_name: agent.bank_name, bank_account_name: agent.bank_account_name, bank_account_number: agent.bank_account_number, bank_swift: agent.bank_swift, mpesa_phone: agent.mpesa_phone, binance_address: agent.binance_address }} /></div>

      <div className="px-4 sm:px-6 py-4 mt-auto space-y-2">
        <button onClick={handleChatWithAgent} className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold text-xs sm:text-base transition-all duration-200 flex items-center justify-center gap-2 shadow-[4px_4px_12px_#0891b2] dark:shadow-none">
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" /><span>Chat with {agent.name}</span>
        </button>
        <div className="flex gap-2 sm:gap-3">
          <button onClick={() => setShowDepositModal(true)} className="flex-1 py-2.5 sm:py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs sm:text-base transition-all duration-200 shadow-[3px_3px_8px_#0891b2] dark:shadow-none">Deposit</button>
          <button onClick={() => setShowWithdrawalModal(true)} className="flex-1 py-2.5 sm:py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-base transition-all duration-200 shadow-[3px_3px_8px_#2563eb] dark:shadow-none">Withdraw</button>
        </div>
      </div>

      {showDepositModal && <DepositModal agent={agent} onClose={() => setShowDepositModal(false)} onSuccess={() => setShowDepositModal(false)} />}
      {showWithdrawalModal && <WithdrawalModal agent={agent} onClose={() => setShowWithdrawalModal(false)} onSuccess={() => setShowWithdrawalModal(false)} />}
    </div>
  )
}
