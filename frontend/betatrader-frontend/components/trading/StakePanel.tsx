"use client";
import { useEffect, useState } from "react";

type Props = { stake: number; setStake: (v: number) => void };
const PRESETS = [1, 5, 10, 25, 50, 100];

export default function StakePanel({ stake, setStake }: Props) {
  const [text, setText] = useState(stake.toString());
  useEffect(() => setText(stake.toString()), [stake]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button onClick={() => setStake(Math.max(1, stake - 1))}
          className="w-12 h-14 rounded-xl text-xl font-bold
            bg-slate-100 text-slate-700 border border-slate-200
            shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
            dark:bg-white/10 dark:text-white dark:border-white/10 dark:shadow-none">
          −
        </button>
        <div className="flex-1 h-14 rounded-xl px-4 flex flex-col justify-center
          bg-white border border-slate-200 shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]
          dark:bg-white/[0.05] dark:border-white/10 dark:shadow-none">
          <div className="text-[10px] text-cyan-600 dark:text-cyan-400 tracking-wider text-center">STAKE</div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-cyan-600 dark:text-cyan-400">$</span>
            <input value={text}
              onChange={(e) => setText(e.target.value.replace(/[^0-9.]/g, ""))}
              onBlur={() => setStake(Math.max(1, parseFloat(text) || 1))}
              onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
              className="bg-transparent text-slate-800 dark:text-white text-center text-2xl font-semibold w-24 outline-none" />
          </div>
        </div>
        <button onClick={() => setStake(stake + 1)}
          className="w-12 h-14 rounded-xl text-xl font-bold
            bg-slate-100 text-slate-700 border border-slate-200
            shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
            dark:bg-white/10 dark:text-white dark:border-white/10 dark:shadow-none">
          +
        </button>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {PRESETS.map((v) => (
          <button key={v} onClick={() => setStake(v)}
            className={`h-9 rounded-lg text-sm font-medium transition
              ${stake === v
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[2px_2px_6px_#0891b2]"
                : "bg-slate-100 text-slate-600 border border-slate-200 shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] dark:bg-white/10 dark:text-white/70 dark:border-white/10 dark:shadow-none"}`}>
            ${v}
          </button>
        ))}
      </div>
    </div>
  );
}
