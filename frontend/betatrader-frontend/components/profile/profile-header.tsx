"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LogOut, Settings } from "lucide-react"
import { getAccountData, logout } from "@/lib/api-helpers"

interface UserData {
  username: string
  email: string
  is_email_verified: boolean
  phone?: string
  kyc_status?: "pending" | "approved" | "rejected"
}

export default function ProfileHeader() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getAccountData()
        setUser(data.user)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  if (loading) return (
    <div className="rounded-2xl p-6 border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.05] animate-pulse
      shadow-[6px_6px_14px_#c8cdd6,-6px_-6px_14px_#ffffff] dark:shadow-none dark:backdrop-blur-xl">
      <div className="h-20 bg-slate-100 dark:bg-white/10 rounded-lg" />
    </div>
  )
  if (!user) return null

  const initials = user.username.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <div className="rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-white/10
      bg-white shadow-[6px_6px_14px_#c8cdd6,-6px_-6px_14px_#ffffff]
      dark:bg-white/[0.05] dark:shadow-none dark:backdrop-blur-xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-cyan-500">
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">{user.username}</h1>
            <p className="text-slate-500 dark:text-white/50">{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.is_email_verified && <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30">Email Verified</Badge>}
              {user.kyc_status === "approved" && <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30">KYC Verified</Badge>}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" className="border-slate-200 dark:border-white/10 shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] dark:shadow-none">
            <Settings className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
          <Button variant="outline" size="sm" className="border-slate-200 dark:border-white/10 text-rose-500" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
