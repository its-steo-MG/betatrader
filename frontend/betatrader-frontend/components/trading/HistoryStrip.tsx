"use client";

type Props = { history: ("T" | "W" | "L")[]; netPnl: number };

export default function HistoryStrip({ history, netPnl }: Props) {
  const total = history.length;
  const w = history.filter((x) => x === "W").length;
  const l = history.filter((x) => x === "L").length;
  const winRate = total > 0 ? Math.round((w / total) * 100) : 0;

  return (
    <div className="flex items-center justify-between rounded-xl px-4 py-3
      bg-white border border-slate-200 shadow-[4px_4px_10px_#c8cdd6,-4px_-4px_10px_#ffffff]
      dark:bg-white/[0.05] dark:border-white/10 dark:shadow-none dark:backdrop-blur-xl">
      <div className="flex items-center gap-3 text-xs">
        <span className="font-semibold text-slate-700 dark:text-white tracking-wider">LAST {total}</span>
        <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{w}W</span>
        <span className="text-slate-400 dark:text-white/30">·</span>
        <span className="text-rose-600 dark:text-rose-400 font-semibold">{l}L</span>
        {total > 0 && (
          <>
            <span className="text-slate-400 dark:text-white/30">·</span>
            <span className="text-slate-500 dark:text-white/50">{winRate}%</span>
          </>
        )}
      </div>
      <div className={`text-base font-semibold tabular-nums ${netPnl >= 0 ? "text-cyan-600 dark:text-cyan-400" : "text-rose-600 dark:text-rose-400"}`}>
        {netPnl >= 0 ? "+" : ""}${netPnl.toFixed(2)}
      </div>
    </div>
  );
}
