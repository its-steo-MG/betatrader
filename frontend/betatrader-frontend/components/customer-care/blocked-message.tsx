"use client"

import { useState } from "react"
import { requestReview } from "@/lib/api"

interface BlockedMessageProps {
  blockInfo: {
    type?: "permanent" | "temporary"
    title?: string
    message?: string
    can_request_review?: boolean
  }
}

export default function BlockedMessage({ blockInfo }: BlockedMessageProps) {
  const [isRequesting, setIsRequesting] = useState(false)
  const [requested, setRequested] = useState(false)

  const handleRequestReview = async () => {
    setIsRequesting(true)
    try {
      await requestReview()
      setRequested(true)
    } catch (error) {
      console.error("Error requesting review:", error)
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <div className="max-w-md rounded-2xl p-8 text-center
        bg-white border border-slate-200 shadow-[8px_8px_20px_#c8cdd6,-8px_-8px_20px_#ffffff]
        dark:bg-white/[0.05] dark:border-white/10 dark:shadow-none dark:backdrop-blur-xl">
        <div className="mb-4 text-5xl">🚫</div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">{blockInfo.title || "Account Blocked"}</h1>
        <p className="mb-6 text-slate-500 dark:text-white/50">{blockInfo.message || "Your account has been blocked."}</p>

        {blockInfo.type === "permanent" && blockInfo.can_request_review && (
          <button
            onClick={handleRequestReview}
            disabled={isRequesting || requested}
            className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 font-semibold text-white transition-all
              shadow-[4px_4px_12px_#0891b2] dark:shadow-none hover:shadow-lg disabled:opacity-50"
          >
            {requested ? "Review Request Submitted" : isRequesting ? "Submitting..." : "Request Review"}
          </button>
        )}

        {requested && (
          <p className="mt-4 text-sm text-cyan-600 dark:text-cyan-400">
            Your request has been submitted. We will review your account within 48 hours.
          </p>
        )}
      </div>
    </div>
  )
}
