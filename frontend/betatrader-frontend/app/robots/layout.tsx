"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { TopNavbar } from "@/components/top-navbar"
import { toast } from "sonner"
import type { Account } from "@/types/account"

interface User {
  username: string
  email: string
  phone: string
  is_sashi: boolean
  is_email_verified: boolean
  accounts: Account[]
}

export default function RobotsLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [activeAccount, setActiveAccount] = useState<Account | null>(null)
  const [loginType, setLoginType] = useState<"real" | "demo">("real")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSession = () => {
      setIsLoading(true)
      setError(null)
      const raw = localStorage.getItem("user_session")
      if (!raw) {
        setError("No session data found. Please log in.")
        setIsLoading(false)
        toast.error("No session data found. Please log in.")
        window.location.href = "/login"
        return
      }
      try {
        const data = JSON.parse(raw) as User
        if (!data?.accounts?.length) throw new Error("Invalid session data")
        const normalizedUser: User = {
          ...data,
          accounts: data.accounts.map((a) => ({ ...a, balance: Number(a.balance) || 0 })),
        }
        setIsLoggedIn(true)
        setUser(normalizedUser)
        const activeId = localStorage.getItem("active_account_id")
        const account =
          normalizedUser.accounts.find((a) => String(a.id) === String(activeId)) ||
          normalizedUser.accounts.find((a) => a.account_type === "standard") ||
          normalizedUser.accounts[0]
        if (!account) throw new Error("No valid account found")
        setActiveAccount(account)
        setLoginType(account.account_type === "demo" ? "demo" : "real")
      } catch {
        setError("Failed to load session. Please log in again.")
        toast.error("Failed to load session. Please log in again.")
        window.location.href = "/login"
      } finally {
        setIsLoading(false)
      }
    }
    loadSession()
    window.addEventListener("session-updated", loadSession)
    return () => window.removeEventListener("session-updated", loadSession)
  }, [])

  const handleSwitchAccount = (account: Account) => {
    if (!account || !user) return
    localStorage.setItem("active_account_id", String(account.id))
    localStorage.setItem("account_type", account.account_type)
    localStorage.setItem("login_type", account.account_type === "demo" ? "demo" : "real")
    const updatedUser: User = {
      ...user,
      accounts: user.accounts.map((a) => (String(a.id) === String(account.id) ? { ...a, balance: Number(account.balance) || 0 } : a)),
    }
    setUser(updatedUser)
    setActiveAccount(account)
    setLoginType(account.account_type === "demo" ? "demo" : "real")
    localStorage.setItem("user_session", JSON.stringify(updatedUser))
    window.dispatchEvent(new Event("session-updated"))
  }

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/login"
  }

  const availableAccounts =
    loginType === "real"
      ? (user?.accounts || []).filter((a) => a.account_type !== "demo")
      : (user?.accounts || []).filter((a) => a.account_type === "demo")

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-cyan-500 animate-pulse">Loading...</div>
    </div>
  )
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-background text-rose-500">{error}</div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      {/* Background - same as wallet/dashboard */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-500/20" />
        <div className="absolute top-1/4 -right-32 h-80 w-80 rounded-full bg-blue-400/15 blur-3xl dark:bg-blue-500/15" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-teal-300/10 blur-3xl dark:bg-teal-500/10" />
      </div>

      <div className="relative z-10">
        <TopNavbar
          isLoggedIn={isLoggedIn}
          user={user}
          accountBalance={Number(activeAccount?.balance) || 0}
          showBalance={true}
          activeAccount={activeAccount}
          accounts={availableAccounts}
          onSwitchAccount={handleSwitchAccount}
          onLogout={handleLogout}
        />
        <div className="flex flex-1">
          <Sidebar loginType={loginType} activeAccount={activeAccount} accounts={availableAccounts} />
          <main className="flex-1 w-full overflow-auto md:pl-64">{children}</main>
        </div>
      </div>
    </div>
  )
}
