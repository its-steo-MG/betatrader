"use client"

import { useState } from "react"
import Link from "next/link"
import { TraderLeaderboard } from "@/components/copy-trading/trader-leaderboard"
import { SubscriptionsContent } from "@/components/copy-trading/subscriptions-content"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, TrendingUp, Users } from "lucide-react"

export default function CopyTradingPage() {
  const [activeTab, setActiveTab] = useState("traders")
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12
        bg-white border border-slate-200 shadow-[8px_8px_20px_#c8cdd6,-8px_-8px_20px_#ffffff]
        dark:bg-white/[0.05] dark:border-white/10 dark:shadow-none dark:backdrop-blur-xl">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-500/20 border border-cyan-300 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-sm font-medium">
            <TrendingUp size={16} /> Copy the Best
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-800 dark:text-white">Copy Top <span className="text-cyan-600 dark:text-cyan-400">Traders</span></h1>
          <p className="text-base sm:text-lg text-slate-500 dark:text-white/50 leading-relaxed">Automatically mirror the trades of proven professionals. Set your allocation, manage risk, and watch your portfolio grow with the experts.</p>
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
          <TabsList className="w-full sm:w-auto overflow-x-auto p-1 rounded-2xl
            bg-slate-100 border border-slate-200 shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]
            dark:bg-white/[0.05] dark:border-white/10 dark:shadow-none">
            <TabsTrigger value="traders" className="gap-2 rounded-xl
              data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white
              data-[state=active]:shadow-[3px_3px_8px_#0891b2] dark:data-[state=active]:shadow-none">
              <TrendingUp size={16} /> Top Traders
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-2 rounded-xl
              data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white
              data-[state=active]:shadow-[3px_3px_8px_#0891b2] dark:data-[state=active]:shadow-none">
              <Users size={16} /> My Subscriptions
            </TabsTrigger>
          </TabsList>
          {activeTab === "traders" && (
            <Link href="/copy-trading/become-trader" className="w-full md:w-auto">
              <Button className="w-full md:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-[4px_4px_12px_#0891b2] dark:shadow-none">Become a Trader</Button>
            </Link>
          )}
        </div>
        <TabsContent value="traders" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between p-3 sm:p-4 rounded-2xl
            bg-white border border-slate-200 shadow-[6px_6px_14px_#c8cdd6,-6px_-6px_14px_#ffffff]
            dark:bg-white/[0.05] dark:border-white/10 dark:shadow-none dark:backdrop-blur-xl">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input placeholder="Search traders by username or strategy..." className="pl-10 bg-slate-50 dark:bg-white/10 border-slate-200 dark:border-white/10 rounded-xl h-11 shadow-[inset_2px_2px_4px_#e2e8f0] dark:shadow-none" disabled />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <Button variant="outline" size="sm" className="rounded-full gap-2 h-9 shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] dark:shadow-none" disabled><Filter size={14} /> Risk Level</Button>
              <Button variant="outline" size="sm" className="rounded-full gap-2 h-9" disabled>Win Rate</Button>
              <Button variant="outline" size="sm" className="rounded-full gap-2 h-9" disabled>Subscribers</Button>
            </div>
          </div>
          <TraderLeaderboard />
        </TabsContent>
        <TabsContent value="subscriptions"><SubscriptionsContent /></TabsContent>
      </Tabs>
    </div>
  )
}
