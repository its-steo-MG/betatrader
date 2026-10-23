"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export default function AgentHeader() {
  const [username, setUsername] = useState("User")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.getAccount()
        const data = (res.data as { user?: { username?: string } } | undefined) ?? undefined
        const username = data?.user?.username
        if (!res.error && username) setUsername(username)
      } catch (err) {
        console.warn("Could not load user name:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  return (
    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[4px_4px_12px_#0891b2] dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Find an Agent</h1>
          <p className="text-cyan-100 text-sm sm:text-base lg:text-lg">Choose a trusted agent to exchange your funds securely</p>
        </div>
      </div>
    </div>
  )
}
