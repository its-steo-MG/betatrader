"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { RobotMarketplace } from "@/components/robots/robot-marketplace"
import { UserRobots } from "@/components/robots/user-robots"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/format-currency"

interface Account { id: number; account_type: string; balance: number; kyc_verified?: boolean }
interface User { username: string; email: string; phone: string; is_sashi: boolean; is_email_verified: boolean; accounts: Account[] }
interface DashboardData { user: User; accounts: Account[] }

export default function RobotsPage() {
  const [activeAccount, setActiveAccount] = useState<Account | null>(null)
  const [loginType, setLoginType] = useState<"real" | "demo">("real")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const syncFromStorage = () => {
    const type = localStorage.getItem("account_type") || "standard"
    setLoginType(type === "demo" ? "demo" : "real")
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error: apiErr } = await api.getDashboard()
        if (apiErr) throw new Error(apiErr as string)
        const dashboard = data as unknown as DashboardData
        if (!dashboard?.accounts?.length) throw new Error("Invalid data")
        const activeId = localStorage.getItem("active_account_id")
        const account =
          dashboard.accounts.find((a) => a.id === Number(activeId)) ||
          dashboard.accounts.find((a) => a.account_type === "standard") ||
          dashboard.accounts[0]
        if (!account) throw new Error("No account")
        setActiveAccount(account)
        syncFromStorage()
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }
    fetch()
    const handler = () => { fetch(); syncFromStorage() }
    window.addEventListener("session-updated", handler)
    return () => window.removeEventListener("session-updated", handler)
  }, [])

  const updateBalance = (newBalance: number) => {
    if (!activeAccount) return
    const updated = { ...activeAccount, balance: newBalance }
    setActiveAccount(updated)
    const raw = localStorage.getItem("user_session")
    if (!raw) return
    const session: User = JSON.parse(raw)
    const newSession: User = { ...session, accounts: session.accounts.map((a) => (a.id === activeAccount.id ? updated : a)) }
    localStorage.setItem("user_session", JSON.stringify(newSession))
    window.dispatchEvent(new Event("session-updated"))
  }

  return (
    <div className="relative min-h-screen text-foreground">
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800 dark:text-white">Trading Robots</h1>
            <p className="text-slate-500 dark:text-white/50 text-lg">Purchase and manage automated trading robots</p>
          </div>

          {/* Balance Card - Clay/Liquid */}
          <div className="rounded-3xl p-6 sm:p-8
            bg-white border border-slate-200 shadow-[8px_8px_20px_#c8cdd6,-8px_-8px_20px_#ffffff]
            dark:bg-white/[0.05] dark:border-white/10 dark:shadow-none dark:backdrop-blur-xl">
            <p className="text-sm text-slate-500 dark:text-white/50 mb-2">
              {loginType === "demo" ? "Demo Account" : "Real Account"}
            </p>
            <p className="text-5xl sm:text-6xl font-bold tracking-tighter text-cyan-600 dark:text-cyan-400">
              ${formatCurrency(activeAccount?.balance || 0)}
            </p>
          </div>

          <Tabs defaultValue="marketplace" className="w-full">
            <TabsList className="inline-flex h-auto w-full p-1 rounded-2xl
              bg-slate-100 border border-slate-200 shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]
              dark:bg-white/[0.05] dark:border-white/10 dark:shadow-none">
              <TabsTrigger value="marketplace" className="flex-1 py-3.5 text-base font-semibold rounded-xl
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white
                data-[state=active]:shadow-[3px_3px_8px_#0891b2]
                dark:data-[state=active]:shadow-none">
                Marketplace
              </TabsTrigger>
              <TabsTrigger value="my-robots" className="flex-1 py-3.5 text-base font-semibold rounded-xl
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white
                data-[state=active]:shadow-[3px_3px_8px_#0891b2]
                dark:data-[state=active]:shadow-none">
                My Robots
              </TabsTrigger>
            </TabsList>
            <TabsContent value="marketplace" className="mt-6">
              <RobotMarketplace balance={activeAccount?.balance || 0} onBalanceChange={updateBalance} />
            </TabsContent>
            <TabsContent value="my-robots" className="mt-6">
              <UserRobots />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="text-center space-y-4 rounded-3xl px-10 py-8
            bg-white border border-slate-200 shadow-[8px_8px_20px_#c8cdd6,-8px_-8px_20px_#ffffff]
            dark:bg-slate-900/95 dark:border-white/10 dark:shadow-none dark:backdrop-blur-2xl">
            <div className="w-16 h-16 border-4 border-slate-200 dark:border-white/10 border-t-cyan-500 rounded-full animate-spin mx-auto" />
            <p className="text-xl font-semibold text-slate-800 dark:text-white">Loading Robots...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="text-center max-w-md p-8 rounded-3xl
            bg-white border border-slate-200 shadow-[8px_8px_20px_#c8cdd6,-8px_-8px_20px_#ffffff]
            dark:bg-slate-900/95 dark:border-white/10 dark:shadow-none dark:backdrop-blur-2xl">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold mb-3 text-slate-800 dark:text-white">Something went wrong</h2>
            <p className="text-slate-500 dark:text-white/50 mb-8">{error}</p>
            <button onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 px-8 rounded-2xl
                shadow-[4px_4px_12px_#0891b2,-2px_-2px_8px_#22d3ee] dark:shadow-none">
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
