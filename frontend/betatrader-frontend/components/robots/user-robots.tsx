"use client"

import { useEffect, useState, useRef } from "react"
import { api } from "@/lib/api"
import { formatCurrency } from "@/lib/format-currency"
import { Copy, Check, Settings, MoreVertical, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { EliteConfigPanel } from "./elite-config-panel"

interface Robot {
  id: number
  name: string
  description: string
  price: string
  image?: string
  is_deriv_robot?: boolean
  is_elite_robot?: boolean
  effective_price?: string
}

interface UserRobot {
  id: number
  robot: Robot
  purchased_at: string | null
  purchased_price?: string
  deriv_access_key?: string
  is_used?: boolean
  is_setting?: boolean
  is_upgraded?: boolean
}

export function UserRobots() {
  const [userRobots, setUserRobots] = useState<UserRobot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [showConfigFor, setShowConfigFor] = useState<number | null>(null)
  const [upgradingId, setUpgradingId] = useState<number | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchUserRobots = async () => {
      try {
        const { data, error } = await api.getUserRobots()
        if (error) throw new Error(error)
        setUserRobots(data as UserRobot[])
      } catch {
        toast.error("Failed to load your robots")
      } finally {
        setIsLoading(false)
      }
    }
    fetchUserRobots()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenuId(null)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const copyToClipboard = (id: number, key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedId(id)
    toast.success("Access key copied to clipboard!")
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleUpgradeToElite = async (userRobot: UserRobot) => {
    const fullPrice = Number(userRobot.robot.price)
    if (!window.confirm(`Upgrade to Elite?\n\nThis will charge $${formatCurrency(fullPrice)} and unlock Settings.`)) return
    setUpgradingId(userRobot.id)
    try {
      const accountType = localStorage.getItem("account_type") || "standard"
      const res = await api.upgradeElite(accountType)
      if (res?.error) throw new Error(res.error)
      setUserRobots((prev) => prev.map((ur) => (ur.id === userRobot.id ? { ...ur, is_used: false, is_upgraded: true } : ur)))
      toast.success("Upgrade successful! Settings unlocked.")
    } catch (err: any) {
      toast.error(err.message || "Upgrade failed")
    } finally {
      setUpgradingId(null)
    }
  }

  if (isLoading) return <p className="text-slate-500 dark:text-white/50">Loading your robots...</p>

  if (userRobots.length === 0) {
    return (
      <div className="rounded-2xl p-12 text-center
        bg-white border border-slate-200 shadow-[6px_6px_14px_#c8cdd6,-6px_-6px_14px_#ffffff]
        dark:bg-white/[0.05] dark:border-white/10 dark:shadow-none dark:backdrop-blur-xl">
        <p className="text-slate-500 dark:text-white/50 mb-4">You have not purchased any robots yet</p>
        <p className="text-sm text-slate-400 dark:text-white/40">Head to the Marketplace tab to start trading with our robots</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {userRobots.map((userRobot) => {
        const { robot, purchased_at, deriv_access_key, is_used = false, is_setting = false, is_upgraded = false } = userRobot
        const purchaseDate = purchased_at ? new Date(purchased_at).toLocaleDateString() : "Unknown"
        const isDerivRobot = robot.is_deriv_robot || !!deriv_access_key
        const isEliteRobot = !!robot.is_elite_robot
        const isPermanentlyElite = !!is_setting
        const showAsElite = isEliteRobot && (isPermanentlyElite || !is_used)
        const showSettings = isEliteRobot && !is_used && !isPermanentlyElite
        const showUpgradeTag = isEliteRobot && is_used && !isPermanentlyElite
        const showConfigPanel = isEliteRobot && (showConfigFor === userRobot.id || isPermanentlyElite)

        return (
          <div key={userRobot.id} className={`relative rounded-3xl p-6 flex flex-col overflow-hidden
            bg-white shadow-[8px_8px_20px_#c8cdd6,-8px_-8px_20px_#ffffff]
            dark:bg-white/[0.05] dark:shadow-none dark:backdrop-blur-xl
            ${showAsElite ? "border-2 border-amber-400 dark:border-amber-500/40" : "border border-slate-200 dark:border-white/10"}`}>
            {robot.image && <img src={robot.image} alt={robot.name} className="w-full h-40 object-cover rounded-2xl mb-4" />}
            {is_upgraded && (
              <div className="absolute top-4 right-4 z-10">
                <span className="inline-flex items-center rounded-full border border-cyan-300/70 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-500 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg">
                  Upgraded
                </span>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">{robot.name}</h3>
                  {showAsElite && <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-semibold">ELITE</span>}
                  {isDerivRobot && <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 px-2.5 py-0.5 rounded-full">DERIV</span>}
                  {isPermanentlyElite && <span className="text-xs bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 px-2.5 py-0.5 rounded-full">Configured</span>}
                </div>
                {showSettings && (
                  <div className="relative" ref={openMenuId === userRobot.id ? menuRef : null}>
                    <button onClick={() => setOpenMenuId(openMenuId === userRobot.id ? null : userRobot.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 dark:text-white/50 dark:hover:text-amber-300">
                      <MoreVertical size={18} />
                    </button>
                    {openMenuId === userRobot.id && (
                      <div className="absolute right-0 top-full mt-1 w-52 rounded-xl z-20 overflow-hidden
                        bg-white border border-slate-200 shadow-[4px_4px_12px_#c8cdd6]
                        dark:bg-slate-900 dark:border-white/10 dark:shadow-none">
                        <button onClick={() => { setShowConfigFor(userRobot.id); setOpenMenuId(null) }}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-left hover:bg-amber-50 dark:hover:bg-amber-500/10">
                          <Settings size={15} className="text-amber-600 dark:text-amber-400" /> Configure to Elite
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-white/50 mb-4">{robot.description}</p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-white/10 space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-white/50">Purchased</p>
                <p className="font-medium text-slate-800 dark:text-white">{purchaseDate}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-white/50">Price Paid</p>
                <p className="font-semibold text-slate-800 dark:text-white">${formatCurrency(Number(userRobot.purchased_price || robot.price))}</p>
              </div>
              {isDerivRobot && deriv_access_key && (
                <div>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">Deriv Access Key</p>
                  <div className="flex items-center gap-3 p-3 rounded-xl font-mono text-sm break-all
                    bg-slate-100 border border-amber-200 shadow-[inset_2px_2px_4px_#e2e8f0]
                    dark:bg-white/10 dark:border-amber-500/30 dark:shadow-none">
                    <span className="flex-1 text-slate-800 dark:text-white">{deriv_access_key}</span>
                    <button onClick={() => copyToClipboard(userRobot.id, deriv_access_key)} className="text-amber-600 dark:text-amber-400">
                      {copiedId === userRobot.id ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              )}
              {showUpgradeTag && (
                <button onClick={() => handleUpgradeToElite(userRobot)} disabled={upgradingId === userRobot.id}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold disabled:opacity-60
                    bg-amber-100 border border-amber-300 text-amber-800
                    shadow-[3px_3px_6px_#fcd34d,-3px_-3px_6px_#ffffff]
                    dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-200 dark:shadow-none">
                  {upgradingId === userRobot.id ? <><Loader2 size={16} className="animate-spin" /> Processing…</> : "Upgrade to Elite"}
                </button>
              )}
              {showConfigPanel && showAsElite && <EliteConfigPanel robotId={robot.id} robotName={robot.name} />}
            </div>
          </div>
        )
      })}
    </div>
  )
}
