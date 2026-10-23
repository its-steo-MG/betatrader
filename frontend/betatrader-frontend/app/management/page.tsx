"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { ManagementForm } from "@/components/management/management-form"
import { StatusTracker } from "@/components/management/status-tracker"
import { CredentialsForm } from "@/components/management/credentials-form"
import { ManagementHistory } from "@/components/management/management-history"
import { useToast } from "@/hooks/use-toast"
import { getManagementStatus, type ManagementRequest } from "@/lib/api"
import { CheckCircle2, TrendingUp } from "lucide-react"
import type { Account } from "@/types/account"

export default function ManagementPage() {
  const { toast } = useToast()
  const [activeAccount, setActiveAccount] = useState<Account | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loginType, setLoginType] = useState<"real" | "demo">("real")
  const [currentRequest, setCurrentRequest] = useState<ManagementRequest | null>(null)
  const [allRequests, setAllRequests] = useState<ManagementRequest[]>([])
  const [isPolling, setIsPolling] = useState(false)

  useEffect(() => {
    const userSession = localStorage.getItem("user_session")
    const storedLoginType = localStorage.getItem("login_type") as "real" | "demo"
    const activeAccountId = localStorage.getItem("active_account_id")

    if (userSession) {
      const user = JSON.parse(userSession)
      const userAccounts = (user?.accounts || []) as Account[]
      setAccounts(userAccounts)
      setLoginType(storedLoginType || "real")

      if (activeAccountId) {
        const active = userAccounts.find((acc) => acc.id === Number(activeAccountId))
        if (active) setActiveAccount(active)
      } else if (userAccounts.length > 0) {
        setActiveAccount(userAccounts[0])
      }
    }
  }, [])

  const fetchStatus = async (silent = false) => {
    try {
      const response = await getManagementStatus()
      if (response.data) {
        setAllRequests(response.data)
        const latest = response.data.find(
          (req) => req.status === "pending_payment" || req.status === "payment_verified" || req.status === "credentials_pending" || req.status === "active"
        )
        if (latest) {
          setCurrentRequest(latest)
          if (latest.status === "pending_payment" && !isPolling) setIsPolling(true)
        }
      }
    } catch (error) {
      if (!silent) toast({ title: "Error", description: "Failed to fetch management status", variant: "destructive" })
    }
  }

  useEffect(() => { fetchStatus() }, [])

  useEffect(() => {
    if (!isPolling) return
    const interval = setInterval(() => fetchStatus(true), 15000)
    return () => clearInterval(interval)
  }, [isPolling])

  useEffect(() => {
    if (currentRequest?.status !== "pending_payment" && isPolling) setIsPolling(false)
  }, [currentRequest?.status])

  const handleInitiateSuccess = (managementId: string) => {
    toast({ title: "Payment Initiated", description: "Complete the M-Pesa payment on your phone" })
    setIsPolling(true)
    fetchStatus()
  }

  const handleCredentialsSuccess = () => {
    toast({ title: "Credentials Submitted", description: "Admin will start management soon" })
    fetchStatus()
  }

  const showInitiateForm = !currentRequest || currentRequest.status === "completed" || currentRequest.status === "failed"
  const showCredentialsForm = currentRequest?.status === "payment_verified"

  return (
    <div className="relative flex min-h-screen text-foreground overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-500/20" />
        <div className="absolute top-1/4 -right-32 h-80 w-80 rounded-full bg-blue-400/15 blur-3xl dark:bg-blue-500/15" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-teal-300/10 blur-3xl dark:bg-teal-500/10" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full">
        <Sidebar loginType={loginType} activeAccount={activeAccount} accounts={accounts} onSwitchAccount={(acc) => setActiveAccount(acc)} />

        <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="text-center space-y-2 sm:space-y-3 px-2">
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-[4px_4px_12px_#0891b2] dark:shadow-none">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white text-balance">Account Management Service</h1>
              </div>
              <p className="text-slate-500 dark:text-white/50 text-base sm:text-lg">Get professional trading management on your account</p>
            </div>

            {currentRequest && (
              <StatusTracker status={currentRequest.status} managementId={currentRequest.management_id} currentPnl={currentRequest.current_pnl} targetProfit={currentRequest.target_profit} startDate={currentRequest.start_date} endDate={currentRequest.end_date} />
            )}

            <div className="grid gap-4 sm:gap-6">
              {showInitiateForm && <ManagementForm onSuccess={handleInitiateSuccess} />}
              {showCredentialsForm && <CredentialsForm managementId={currentRequest.management_id} onSuccess={handleCredentialsSuccess} />}

              {currentRequest?.status === "credentials_pending" && (
                <div className="rounded-xl p-4 sm:p-6 bg-white border border-slate-200 shadow-[6px_6px_14px_#c8cdd6,-6px_-6px_14px_#ffffff] dark:bg-white/[0.05] dark:border-white/10 dark:shadow-none dark:backdrop-blur-xl">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2">Waiting for Admin Activation</h3>
                      <p className="text-sm sm:text-base text-slate-500 dark:text-white/50">Your credentials have been submitted successfully. Our admin team will review and activate your account management shortly. You will receive an email notification once activated.</p>
                    </div>
                  </div>
                </div>
              )}

              {currentRequest?.status === "active" && (
                <div className="rounded-xl p-4 sm:p-6 bg-white border border-cyan-300 dark:border-cyan-500/30 shadow-[6px_6px_14px_#c8cdd6,-6px_-6px_14px_#ffffff] dark:bg-cyan-500/10 dark:shadow-none dark:backdrop-blur-xl">
                  <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div className="flex-1 w-full">
                      <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2">Management Active</h3>
                      <p className="text-sm sm:text-base text-slate-500 dark:text-white/50 mb-4">Your account is currently being managed by our professional team.</p>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3"><p className="text-slate-500 dark:text-white/50 text-xs sm:text-sm">Target</p><p className="text-slate-900 dark:text-white font-semibold text-base sm:text-lg">${currentRequest.target_profit.toFixed(2)}</p></div>
                        <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3"><p className="text-slate-500 dark:text-white/50 text-xs sm:text-sm">Current P/L</p><p className={`font-semibold text-base sm:text-lg ${currentRequest.current_pnl >= 0 ? "text-cyan-600 dark:text-cyan-400" : "text-rose-600 dark:text-rose-400"}`}>${currentRequest.current_pnl.toFixed(2)}</p></div>
                        {currentRequest.days && <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3"><p className="text-slate-500 dark:text-white/50 text-xs sm:text-sm">Duration</p><p className="text-slate-900 dark:text-white font-semibold text-base sm:text-lg">{currentRequest.days} days</p></div>}
                        {currentRequest.daily_target_profit && <div className="bg-slate-50 dark:bg-white/5 rounded-lg p-3"><p className="text-slate-500 dark:text-white/50 text-xs sm:text-sm">Daily Target</p><p className="text-slate-900 dark:text-white font-semibold text-base sm:text-lg">${currentRequest.daily_target_profit.toFixed(2)}</p></div>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {allRequests.length > 0 && <ManagementHistory requests={allRequests} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
