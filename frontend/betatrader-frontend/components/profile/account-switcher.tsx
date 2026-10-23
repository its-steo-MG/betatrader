"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Wallet } from "lucide-react"
import { getAccountData, switchAccountHelper } from "@/lib/api-helpers"

interface Account { id: number; account_type: string; balance: number }
interface RawAccount { id: number; account_type: string; balance?: string | number | null }

const card = "bg-white dark:bg-white/[0.05] border-slate-200 dark:border-white/10 shadow-[6px_6px_14px_#c8cdd6,-6px_-6px_14px_#ffffff] dark:shadow-none dark:backdrop-blur-xl"

export default function AccountSwitcher() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await getAccountData()
        setAccounts((data.accounts || []).map((a: RawAccount) => ({ id: a.id, account_type: a.account_type, balance: Number(a.balance ?? 0) })))
        setActiveId(data.activeAccountId)
      } finally {
        setLoading(false)
      }
    }
    fetchAccounts()
  }, [])

  const handleSwitch = async (accountId: number) => {
    setSwitching(true)
    try {
      await switchAccountHelper(accountId)
      setActiveId(accountId)
    } finally {
      setSwitching(false)
    }
  }

  if (loading) {
    return (
      <Card className={`${card} sticky top-8`}>
        <CardHeader><CardTitle className="text-lg">Your Accounts</CardTitle></CardHeader>
        <CardContent><div className="h-20 bg-slate-100 dark:bg-white/10 rounded-lg animate-pulse" /></CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${card} sticky top-8`}>
      <CardHeader>
        <CardTitle className="text-lg text-slate-800 dark:text-white">Your Accounts</CardTitle>
        <CardDescription>Switch between trading accounts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {accounts.map((account) => (
          <button
            key={account.id}
            onClick={() => handleSwitch(account.id)}
            disabled={switching}
            className={`w-full p-3 rounded-xl border-2 text-left transition-all disabled:opacity-50 ${
              activeId === account.id
                ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-500/20"
                : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold capitalize text-slate-800 dark:text-white">{account.account_type}</span>
              {activeId === account.id && <Badge className="bg-cyan-600 text-white">Active</Badge>}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-white/50">
              <Wallet className="w-4 h-4" />
              <span>${account.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
          </button>
        ))}
        <Button className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[4px_4px_12px_#0891b2] dark:shadow-none">
          <Plus className="w-4 h-4 mr-2" /> Create Account
        </Button>
      </CardContent>
    </Card>
  )
}
