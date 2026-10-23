"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Wallet } from "@/lib/api"

export function ActionButtons({ 
  onDeposit, 
  onWithdraw, 
  onTransfer 
}: { 
  onDeposit: () => void; 
  onWithdraw: () => void; 
  onTransfer: () => void 
}) {
  const [isDemo, setIsDemo] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasValidWallet, setHasValidWallet] = useState(false)

  useEffect(() => {
    const currentAccountType = localStorage.getItem("account_type") || "standard"
    setIsDemo(currentAccountType === "demo")

    const fetchWallets = async () => {
      try {
        const res = await api.getWallets()
        if (res.error) throw new Error(res.error)
        const mainWallet = res.data?.wallets.find(
          (w: Wallet) => w.wallet_type === "main" && w.account_type === currentAccountType
        )
        if (mainWallet) {
          setIsDemo(mainWallet.account_type === "demo")
          setBalance(Number(mainWallet.balance) || 0)
          setHasValidWallet(true)
        } else {
          console.warn(`No main wallet found for account type: ${currentAccountType}`)
          setHasValidWallet(false)
          setBalance(0)
          setIsDemo(currentAccountType === "demo")
        }
      } catch (error) {
        console.error("Failed to fetch wallets:", error)
        setHasValidWallet(false)
        setBalance(0)
        setIsDemo(currentAccountType === "demo")
      } finally {
        setLoading(false)
      }
    }

    fetchWallets()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <button
          onClick={onDeposit}
          disabled={loading || (isDemo && hasValidWallet)}
          className="flex-1 relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-cyan-300 disabled:to-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            shadow-[4px_4px_12px_#0891b2,-2px_-2px_8px_#22d3ee] dark:shadow-none"
          title={isDemo && hasValidWallet ? "Deposits are not available in demo mode" : ""}
        >
          Deposit
        </button>

        <button
          onClick={onWithdraw}
          disabled={loading || (isDemo && hasValidWallet) || balance === 0}
          className="flex-1 relative bg-white hover:bg-slate-50 disabled:bg-slate-200 text-slate-800 font-semibold py-3 px-6 rounded-xl border-2 border-slate-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            shadow-[4px_4px_10px_#c8cdd6,-4px_-4px_10px_#ffffff]
            dark:bg-white/10 dark:text-white dark:border-white/10 dark:shadow-none dark:hover:bg-white/20"
          title={balance === 0 ? "No balance available to withdraw" : isDemo && hasValidWallet ? "Withdrawals are not available in demo mode" : ""}
        >
          Withdraw
        </button>
      </div>

      <button
        onClick={onTransfer}
        disabled={loading || (isDemo && hasValidWallet) || balance === 0}
        className="w-full relative bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 disabled:from-teal-300 disabled:to-cyan-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
          shadow-[4px_4px_12px_#0d9488,-2px_-2px_8px_#2dd4bf] dark:shadow-none"
        title={isDemo && hasValidWallet ? "Transfers not available in demo mode" : balance === 0 ? "No balance to transfer" : ""}
      >
        Transfer Funds
      </button>
    </div>
  )
}
