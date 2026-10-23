"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

interface TradingViewWidgetProps {
  symbol: string;
}

export function TradingViewWidget({ symbol }: TradingViewWidgetProps) {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";
    setIsLoading(true);
    setError(null);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      allow_symbol_change: true,
      calendar: false,
      details: false,
      hide_side_toolbar: true,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_volume: false,
      interval: symbol.includes("USD") ? "60" : "D",
      locale: "en",
      save_image: true,
      style: "1",
      symbol,
      theme: resolvedTheme === "light" ? "light" : "dark",
      timezone: "Etc/UTC",
      backgroundColor: resolvedTheme === "light" ? "#f8fafc" : "#0f172a",
      gridColor: resolvedTheme === "light" ? "rgba(6,182,212,0.08)" : "rgba(6,182,212,0.06)",
      autosize: true,
      height: 500,
      width: "100%",
    });
    script.onload = () => setIsLoading(false);
    script.onerror = () => {
      setError("Failed to load TradingView widget");
      setIsLoading(false);
    };

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    widget.style.height = "500px";
    widget.style.width = "100%";
    containerRef.current.appendChild(widget);
    containerRef.current.appendChild(script);
    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [symbol, resolvedTheme]);

  return (
    <section className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900/40 p-4 shadow-lg shadow-cyan-500/5 sm:p-5 dark:border-cyan-500/20 dark:bg-slate-900/40">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-white">Market Overview</h3>
          <p className="text-xs text-cyan-400/70">{symbol}</p>
        </div>
        <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
          ● Live
        </span>
      </div>
      {error ? (
        <div className="py-16 text-center text-red-400">{error}</div>
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-cyan-500/10 bg-slate-950/50 dark:border-cyan-500/10">
          <div ref={containerRef} className="tradingview-widget-container w-full" style={{ height: 500 }} />
          {isLoading && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-white/50">
              Loading chart...
            </div>
          )}
        </div>
      )}
    </section>
  );
}
