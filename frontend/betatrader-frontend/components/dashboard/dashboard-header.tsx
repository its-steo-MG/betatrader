"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  username: string;
  email: string;
  isRealAccount: boolean;
  accountType: string;
}

export function DashboardHeader({ username, isRealAccount, accountType }: DashboardHeaderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const platforms = [
    { name: "MT5", logo: "/mt5.png" },
    { name: "BetaTrader", logo: "/images/traderiser-logo-192.png" },
    { name: "Deriv", logo: "/deriv-account-icon.png" },
  ];

  useEffect(() => {
    const t = setInterval(() => setActiveIndex((i) => (i + 1) % platforms.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900/60 shadow-lg shadow-cyan-500/5 backdrop-blur-xl dark:border-cyan-500/20 dark:bg-slate-900/60">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-cyan-500/10 to-transparent" />

      <div className="relative flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src="/images/traderiser-logo-192.png"
            alt="BetaTrader"
            className="h-10 w-10 shrink-0 rounded-xl shadow-sm ring-1 ring-cyan-500/30"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-cyan-400/80">
              {greeting}
            </p>
            <h1 className="truncate text-lg font-bold tracking-tight text-white sm:text-xl">
              {username}
            </h1>
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
              <span className="rounded-full bg-white/10 px-2 py-0.5 capitalize text-white/70">
                {accountType}
              </span>
              <span className={`rounded-full px-2 py-0.5 ${isRealAccount ? "bg-cyan-500/20 text-cyan-300" : "bg-amber-500/20 text-amber-300"}`}>
                {isRealAccount ? "Live" : "Practice"}
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-[1] flex shrink-0 items-center gap-2.5 overflow-hidden rounded-2xl border border-cyan-500/20 bg-white/5 px-3 py-2 backdrop-blur-lg">
          {platforms.map((p, i) => (
            <div
              key={p.name}
              className={cn(
                "relative z-[1] flex flex-col items-center transition-all duration-500",
                i === activeIndex ? "scale-110 opacity-100" : "scale-95 opacity-50"
              )}
            >
              <Image src={p.logo} alt={p.name} width={36} height={36} className="h-9 w-9 object-contain" />
              <span className="mt-0.5 text-[9px] font-medium text-white/60">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
