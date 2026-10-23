"use client";

import { Target, Grid3x3, ArrowUpDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type TradeMode = "matches" | "evenodd" | "overunder" | "risefall";

type Props = { mode: TradeMode; onChange: (m: TradeMode) => void };

const TABS = [
  { key: "matches" as const, shortLabel: "Match/Diff", icon: Target },
  { key: "evenodd" as const, shortLabel: "Even/Odd", icon: Grid3x3 },
  { key: "overunder" as const, shortLabel: "Over/Under", icon: ArrowUpDown },
  { key: "risefall" as const, shortLabel: "Rise/Fall", icon: TrendingUp },
];

export default function ModeTabs({ mode, onChange }: Props) {
  return (
    <div className="py-3">
      <div className="max-w-4xl mx-auto px-4">
        <div className="inline-flex w-full rounded-2xl p-1.5
          bg-slate-100 border border-slate-200 shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]
          dark:bg-white/[0.05] dark:border-white/10 dark:shadow-none dark:backdrop-blur-xl">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = mode === tab.key;
            return (
              <button key={tab.key} onClick={() => onChange(tab.key)}
                className={cn(
                  "relative flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl overflow-hidden",
                  "text-[10px] xs:text-xs sm:text-sm font-medium transition-all duration-200 active:scale-[0.97]",
                  isActive
                    ? "bg-white text-slate-800 shadow-[3px_3px_8px_#c8cdd6,-3px_-3px_8px_#ffffff] border border-slate-200 dark:bg-white/10 dark:text-white dark:shadow-none dark:border-white/20"
                    : "text-slate-500 hover:text-slate-700 dark:text-white/50 dark:hover:text-white"
                )}>
                <Icon size={18} className={cn("relative z-[1] flex-shrink-0", isActive ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400 dark:text-white/40")} />
                <span className="relative z-[1] text-center leading-tight font-medium truncate w-full px-1">
                  <span className="block xs:hidden">
                    {tab.key === "matches" ? "Match" : tab.key === "evenodd" ? "Even/Odd" : tab.key === "risefall" ? "Rise/Fall" : "Over/Under"}
                  </span>
                  <span className="hidden xs:block">{tab.shortLabel}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
