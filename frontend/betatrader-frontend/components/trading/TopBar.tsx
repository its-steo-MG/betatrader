"use client";

import { Volume2, VolumeX, Bot, ChevronDown } from "lucide-react";
import type { Account } from "@/types/account";
import { useEffect, useState, useCallback } from "react";

type Props = {
  muted: boolean;
  onToggleMute: () => void;
  activeAccount?: Account | null;
  onOpenRobotPanel: () => void;
};

export default function TopBar({ muted, onToggleMute, activeAccount: propActiveAccount, onOpenRobotPanel }: Props) {
  const [balance, setBalance] = useState<number>(0);
  const [activeAccount, setActiveAccount] = useState<Account | null>(propActiveAccount || null);

  const loadRealBalance = useCallback(() => {
    const raw = localStorage.getItem("user_session");
    if (!raw) { setBalance(0); setActiveAccount(null); return; }
    try {
      const userData = JSON.parse(raw);
      const activeId = localStorage.getItem("active_account_id");
      const accountType = localStorage.getItem("account_type") || "standard";
      let currentAccount = userData.accounts?.find((acc: Account) => String(acc.id) === String(activeId));
      if (!currentAccount) currentAccount = userData.accounts?.find((acc: Account) => acc.account_type === accountType);
      if (!currentAccount && userData.accounts?.length) currentAccount = userData.accounts[0];
      if (currentAccount) {
        setBalance(Number(currentAccount.balance) || 0);
        setActiveAccount(currentAccount);
      } else { setBalance(0); setActiveAccount(null); }
    } catch { setBalance(0); setActiveAccount(null); }
  }, []);

  useEffect(() => {
    loadRealBalance();
    const handleSessionUpdate = () => loadRealBalance();
    window.addEventListener("session-updated", handleSessionUpdate);
    window.addEventListener("storage", handleSessionUpdate);
    return () => {
      window.removeEventListener("session-updated", handleSessionUpdate);
      window.removeEventListener("storage", handleSessionUpdate);
    };
  }, [loadRealBalance]);

  useEffect(() => {
    if (propActiveAccount) { setActiveAccount(propActiveAccount); setBalance(Number(propActiveAccount.balance) || 0); }
  }, [propActiveAccount]);

  const accountType = activeAccount?.account_type || "standard";
  const iconSrc = accountType === "demo" ? "/demo-account-icon.png" : "/real-account-icon.png";

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 dark:border-white/10
      bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl">
      <button className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 flex-1
        bg-slate-100 border border-slate-200 shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]
        dark:bg-white/10 dark:border-white/10 dark:shadow-none">
        <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200 dark:border-white/20 flex-shrink-0">
          <img src={iconSrc} alt={`${accountType.toUpperCase()} Account`} className="w-full h-full object-cover" />
        </div>
        <span className="text-cyan-600 dark:text-cyan-400 text-sm font-medium">${Number(balance || 0).toFixed(2)}</span>
        <ChevronDown size={14} className="text-slate-400 dark:text-white/40" />
      </button>

      <button onClick={onToggleMute}
        className="p-2 rounded-full bg-slate-100 border border-slate-200 text-cyan-600
          shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]
          dark:bg-white/10 dark:border-white/10 dark:text-cyan-400 dark:shadow-none">
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      <button onClick={onOpenRobotPanel}
        className="p-2 rounded-full bg-cyan-100 border border-cyan-200 text-cyan-600
          shadow-[3px_3px_6px_#a5f3fc,-3px_-3px_6px_#ffffff]
          dark:bg-cyan-500/20 dark:border-cyan-500/30 dark:text-cyan-400 dark:shadow-none"
        title="Load S-Digit Robot">
        <Bot size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
}
