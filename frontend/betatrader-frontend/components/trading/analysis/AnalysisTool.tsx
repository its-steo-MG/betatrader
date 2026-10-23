"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createMarketFeeds, marketLabel, MARKETS, type DigitStore } from "@/lib/marketFeeds";
import { isWinningDigit } from "@/lib/contracts";
import { entryAdvice, isTradeable, pct, scanAll, type Family, type Signal } from "@/lib/analysisEngine";
import QuickArmDialog, { type QuickArmConfig } from "./QuickArmDialog";

type Props = {
  activeMarket?: string;
  onUseSignal?: (cfg: QuickArmConfig, signal: Signal) => void;
  className?: string;
};

const FAMILIES: { id: Family; label: string }[] = [
  { id: "evenodd", label: "Even / Odd" },
  { id: "overunder", label: "Over / Under" },
  { id: "risefall", label: "Rise / Fall" },
  { id: "matchdiff", label: "Matches / Differs" },
];

const WINDOWS = [50, 100, 200, 500];
const COUNTDOWN_FROM = 10;

export default function AnalysisTool({ activeMarket = "volatility-10-1s", onUseSignal, className = "" }: Props) {
  const [store, setStore] = useState<DigitStore>({});
  const [family, setFamily] = useState<Family>("matchdiff");
  const [windowSize, setWindowSize] = useState(200);
  const [focus, setFocus] = useState<string | null>(null);
  const [armSignal, setArmSignal] = useState<Signal | null>(null);
  const [armedCfg, setArmedCfg] = useState<QuickArmConfig | null>(null);

  useEffect(() => {
    const feeds = createMarketFeeds({ activeMarket });
    const off = feeds.subscribe((s: DigitStore) => setStore({ ...s }));
    return () => { off(); feeds.destroy(); };
  }, [activeMarket]);

  const scan = useMemo(() => scanAll(store, family, windowSize), [store, family, windowSize]);
  const active: Signal | null = focus ? (scan.perMarket[focus]?.[0] ?? null) : scan.best;

  const [count, setCount] = useState<number | null>(null);
  const keyRef = useRef<string>("");
  const key = active ? `${active.market}|${active.kind}|${active.barrier ?? ""}` : "";
  const armed = isTradeable(active);

  useEffect(() => {
    if (!armed) { keyRef.current = ""; setCount(null); return; }
    if (keyRef.current !== key) { keyRef.current = key; setCount(COUNTDOWN_FROM); }
  }, [key, armed]);

  useEffect(() => {
    if (count === null) return;
    const t = setTimeout(() => setCount((c) => (c === null ? null : c > 0 ? c - 1 : 0)), 1000);
    return () => clearTimeout(t);
  }, [count]);

  const fire = count === 0;
  const stripMarket = active?.market ?? activeMarket ?? MARKETS[0]!.id;
  const strip = (store[stripMarket] ?? []).slice(-30);

  const renderCell = (d: number, i: number) => {
    if (family === "evenodd") {
      const even = d % 2 === 0;
      return (
        <span key={i} className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold
          ${even ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300" : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"}`}>
          {even ? "E" : "O"}
        </span>
      );
    }
    const hit = active ? isWinningDigit(active.kind, active.barrier, d) : false;
    return (
      <span key={i} className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold
        ${hit ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300" : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"}`}>
        {d}
      </span>
    );
  };

  return (
    <div className={`flex h-full w-full flex-col gap-3 overflow-y-auto p-3 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-wide text-slate-800 dark:text-white">MULTI-MARKET DIGIT SCANNER</span>
          <span className="h-2 w-2 rounded-full bg-cyan-500" />
          <span className="text-[11px] text-slate-500 dark:text-white/50">
            {Object.keys(store).length} markets · live: {marketLabel(activeMarket)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {WINDOWS.map((w) => (
            <button key={w} onClick={() => setWindowSize(w)}
              className={`rounded-lg px-2 py-1 text-[11px] font-medium transition
                ${windowSize === w 
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[2px_2px_6px_#0891b2]" 
                  : "bg-slate-100 text-slate-600 shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff] dark:bg-white/10 dark:text-white/70 dark:shadow-none"}`}>
              {w}t
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-1 rounded-xl p-1 bg-slate-100 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:bg-white/5 dark:shadow-none">
        {FAMILIES.map((f) => (
          <button key={f.id} onClick={() => { setFamily(f.id); setFocus(null); }}
            className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition
              ${family === f.id 
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[2px_2px_6px_#0891b2]" 
                : "text-slate-500 hover:text-slate-800 dark:text-white/50 dark:hover:text-white"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className={`rounded-2xl border p-4
        ${fire && armed 
          ? "border-cyan-300 bg-cyan-50 shadow-[6px_6px_14px_#a5f3fc,-6px_-6px_14px_#ffffff] dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:shadow-none dark:backdrop-blur-xl" 
          : "border-slate-200 bg-white shadow-[6px_6px_14px_#c8cdd6,-6px_-6px_14px_#ffffff] dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none dark:backdrop-blur-xl"}`}>
        {!active ? (
          <p className="py-6 text-center text-sm text-slate-500 dark:text-white/50">Collecting ticks from all volatility markets…</p>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-white/40">{focus ? "Locked market" : "Best market right now"}</p>
                <p className="text-lg font-bold text-slate-800 dark:text-white">{marketLabel(active.market)} · {active.label}</p>
                <p className="text-[11px] text-slate-500 dark:text-white/50">
                  hit {pct(active.observed)} ({active.hits}/{active.samples}) · need {pct(active.breakeven)} · payout {active.payout.toFixed(2)}x · streak {active.streak}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-black tabular-nums ${active.edge > 0 ? "text-cyan-600 dark:text-cyan-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {active.edge > 0 ? "+" : ""}{(active.edge * 100).toFixed(1)}%
                </p>
                <p className="text-[10px] uppercase text-slate-500 dark:text-white/40">expected edge</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3 rounded-xl p-2 bg-slate-100 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] dark:bg-white/5 dark:shadow-none">
              {armed ? (
                fire ? (
                  <span className="animate-pulse text-sm font-black text-cyan-600 dark:text-cyan-400">▶ RUN THE ROBOT NOW — {active.label} on {marketLabel(active.market)}</span>
                ) : (
                  <>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-base font-black tabular-nums text-white shadow-[2px_2px_6px_#0891b2]">{count}</span>
                    <span className="text-xs text-slate-500 dark:text-white/50">
                      Get ready — run <b className="text-slate-800 dark:text-white">{active.label}</b> on <b className="text-slate-800 dark:text-white">{marketLabel(active.market)}</b> in {count}s
                    </span>
                  </>
                )
              ) : (
                <span className="text-xs text-slate-500 dark:text-white/50">No confident edge on this family yet — waiting for a setup. Do not trade.</span>
              )}
            </div>

            <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-white/50">{entryAdvice(active)}</p>
            {armedCfg && (
              <p className="mt-3 rounded-xl bg-cyan-50 px-3 py-2 text-[11px] font-semibold text-cyan-700 shadow-[inset_2px_2px_4px_#a5f3fc] dark:bg-cyan-500/10 dark:text-cyan-300 dark:shadow-none">
                Robot armed · {armedCfg.contractKind}{armedCfg.barrier !== null ? ` ${armedCfg.barrier}` : ""} · stake {armedCfg.initialStake} — hit RUN on the dock when the countdown fires.
              </p>
            )}
            <button disabled={!armed} onClick={() => setArmSignal(active)}
              className="mt-3 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-xs font-bold text-white shadow-[4px_4px_10px_#0891b2,-2px_-2px_6px_#22d3ee] disabled:opacity-40 dark:shadow-none">
              Use this signal in the robot
            </button>
          </>
        )}
      </div>

      <div>
        <p className="mb-2 text-[11px] uppercase tracking-wider text-slate-500 dark:text-white/40">Last 30 ticks · {marketLabel(stripMarket)}</p>
        <div className="flex flex-wrap gap-1">{strip.map(renderCell)}</div>
      </div>

      <div>
        <p className="mb-2 text-[11px] uppercase tracking-wider text-slate-500 dark:text-white/40">
          All volatility markets · best {FAMILIES.find((f) => f.id === family)?.label} setup
        </p>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[4px_4px_10px_#c8cdd6,-4px_-4px_10px_#ffffff] dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none dark:backdrop-blur-xl">
          {scan.ranked.map((s, i) => {
            const selected = focus === s.market || (!focus && i === 0);
            return (
              <button key={s.market} onClick={() => setFocus(focus === s.market ? null : s.market)}
                className={`flex w-full items-center justify-between gap-2 border-b border-slate-100 px-3 py-2.5 text-left last:border-0 dark:border-white/5
                  ${selected ? "bg-cyan-50 dark:bg-cyan-500/10" : "hover:bg-slate-50 dark:hover:bg-white/5"}`}>
                <span className="flex items-center gap-2">
                  <span className="w-4 text-[10px] text-slate-400">{i + 1}</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-white">{marketLabel(s.market)}</span>
                  {s.market === activeMarket && <span className="rounded bg-slate-200 px-1 text-[9px] uppercase text-slate-700 dark:bg-white/10 dark:text-white/70">live</span>}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-700 dark:text-white/80">{s.label}</span>
                  <span className="text-[11px] tabular-nums text-slate-500 dark:text-white/50">{pct(s.observed)}</span>
                  <span className={`w-14 text-right text-xs font-bold tabular-nums ${s.edge > 0 ? "text-cyan-600 dark:text-cyan-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {s.edge > 0 ? "+" : ""}{(s.edge * 100).toFixed(1)}%
                  </span>
                </span>
              </button>
            );
          })}
          {!scan.ranked.length && <p className="px-2 py-4 text-center text-xs text-slate-500 dark:text-white/50">Warming up…</p>}
        </div>
      </div>

      {armSignal && (
        <QuickArmDialog
          signal={armSignal}
          marketLabel={marketLabel(armSignal.market)}
          onCancel={() => setArmSignal(null)}
          onArm={(cfg, sig) => { setArmedCfg(cfg); setArmSignal(null); onUseSignal?.(cfg, sig); }}
        />
      )}
    </div>
  );
}
