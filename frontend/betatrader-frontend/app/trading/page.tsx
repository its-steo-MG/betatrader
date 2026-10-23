"use client"

import { useState } from "react"
import TradingPageClient from "@/components/trading/trading-page-client"
import AISignalBot from "@/components/trading/ai-signal-bot"

export default function TradingPage() {
  const [activeTab, setActiveTab] = useState<"trading" | "signals">("trading")

  return (
    <div className="relative min-h-screen text-foreground overflow-hidden">
      {/* Dark mode background */}
      <div className="fixed inset-0 z-0 dark:block hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-cyan-950/20 to-blue-950/15" />
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-cyan-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-blue-600/6 rounded-full blur-3xl" />
      </div>

      {/* Light mode background */}
      <div className="fixed inset-0 z-0 block dark:hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-50" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Sticky Tab Bar */}
        <div className="sticky top-0 z-50 p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800
          bg-white/80 dark:bg-slate-900/70 backdrop-blur-2xl
          shadow-[0_4px_12px_#d1d5db] dark:shadow-none">
          <div className="w-full pl-0 md:pl-64 lg:pl-72">
            <div className="inline-flex gap-1.5 p-1.5 rounded-2xl
              bg-slate-100 border border-slate-200
              shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
              dark:bg-slate-800/50 dark:border-slate-700 dark:shadow-none">
              <button
                onClick={() => setActiveTab("trading")}
                className={`
                  relative min-w-fit px-6 sm:px-7 py-3 rounded-xl font-semibold text-sm sm:text-base
                  transition-all whitespace-nowrap overflow-hidden
                  ${activeTab === "trading"
                    ? "drop-on-top bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[4px_4px_8px_#0891b2,-2px_-2px_6px_#22d3ee] dark:shadow-none"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"}
                `}
              >
                <span className="relative z-[1]">Trading Interface</span>
              </button>

              <button
                onClick={() => setActiveTab("signals")}
                className={`
                  relative min-w-fit px-6 sm:px-7 py-3 rounded-xl font-semibold text-sm sm:text-base
                  transition-all whitespace-nowrap overflow-hidden
                  ${activeTab === "signals"
                    ? "drop-on-top bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[4px_4px_8px_#0891b2,-2px_-2px_6px_#22d3ee] dark:shadow-none"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"}
                `}
              >
                <span className="relative z-[1]">AI Signal Bot</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {activeTab === "trading" && <TradingPageClient />}
          {activeTab === "signals" && <AISignalBot />}
        </div>
      </div>
    </div>
  )
}
