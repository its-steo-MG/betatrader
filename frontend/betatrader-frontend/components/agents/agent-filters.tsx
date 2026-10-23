"use client"

import { Search, ChevronDown } from "lucide-react"

interface AgentFiltersProps {
  selectedMethod: string | null
  onMethodChange: (method: string | null) => void
  sortBy: string
  onSortChange: (sort: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export default function AgentFilters({ selectedMethod, onMethodChange, sortBy, onSortChange, searchQuery, onSearchChange }: AgentFiltersProps) {
  const methods = [
    { id: "mpesa", label: "M-Pesa" },
    { id: "paypal", label: "PayPal" },
    { id: "bank", label: "Bank Transfer" },
    { id: "binance", label: "Binance" },
  ]

  return (
    <div className="space-y-4 sm:space-y-6 mb-8">
      <div className="relative">
        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-white/40" />
        <input type="text" placeholder="Search agents by name or location..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.05] focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-white/40 shadow-[inset_2px_2px_4px_#e2e8f0] dark:shadow-none dark:backdrop-blur-xl" />
      </div>

      <div>
        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mb-2 sm:mb-3">Payment Method</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          <button onClick={() => onMethodChange(null)}
            className={`relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border-2 transition-all font-medium text-xs sm:text-sm ${selectedMethod === null ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 shadow-[3px_3px_6px_#0891b2] dark:shadow-none" : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.05] text-slate-600 dark:text-white/70 hover:border-cyan-300 shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] dark:shadow-none"}`}>
            <span className="relative z-[1]">All</span>
          </button>
          {methods.map((method) => (
            <button key={method.id} onClick={() => onMethodChange(method.id)}
              className={`relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border-2 transition-all font-medium text-xs sm:text-sm whitespace-nowrap ${selectedMethod === method.id ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-500/20 text-cyan-600 shadow-[3px_3px_6px_#0891b2] dark:shadow-none" : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.05] text-slate-600 dark:text-white/70 hover:border-cyan-300 shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff] dark:shadow-none"}`}>
              <span className="relative z-[1]">{method.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">Sort by:</span>
        <div className="relative w-full sm:w-auto">
          <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none w-full sm:w-48 px-4 py-2 sm:py-2.5 pr-8 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.05] text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all cursor-pointer shadow-[inset_2px_2px_4px_#e2e8f0] dark:shadow-none dark:backdrop-blur-xl">
            <option value="rate">Best Rate</option>
            <option value="rating">Highest Rating</option>
            <option value="reviews">Most Reviews</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/40 pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
