"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  LogOut,
  Menu,
  X,
  WalletIcon,
  Bot,
  User,
  Zap,
  MessageSquare,
  Headset,
  Briefcase,
  Copy,
  Hash,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { Account } from "@/types/account";
import { ThemeToggle } from "@/components/ThemeToggle";

type LoginType = "real" | "demo" | string;

interface SidebarProps {
  loginType: LoginType;
  activeAccount?: Account | null;
  accounts?: Account[];
  onSwitchAccount?: (account: Account) => void;
}

const ACTIVE_ACCOUNT_KEY = "active_account_id";

export function Sidebar({
  loginType,
  activeAccount: propActiveAccount,
  accounts = [],
  onSwitchAccount,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [activeAccount, setActiveAccount] = useState<Account | null>(propActiveAccount ?? null);

  useEffect(() => {
    const storedId = Number(localStorage.getItem(ACTIVE_ACCOUNT_KEY));
    if (Array.isArray(accounts) && accounts.length > 0) {
      let found = accounts.find((a) => a.id === storedId);
      if (!found) {
        if (loginType === "demo") {
          found = accounts.find((a) => a.account_type === "demo" && a.platform === "traderiser") || accounts.find((a) => a.account_type === "demo");
        } else {
          found = accounts.find((a) => a.account_type === "standard") || accounts[0];
        }
      }
      setActiveAccount(found || accounts[0]);
    } else if (propActiveAccount) {
      setActiveAccount(propActiveAccount);
    }
  }, [accounts, propActiveAccount, loginType]);

  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ account: Account }>;
      setActiveAccount(ev.detail.account);
    };
    window.addEventListener("account-switch", handler);
    return () => window.removeEventListener("account-switch", handler);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const newBalance = (e as CustomEvent).detail;
      setActiveAccount((prev) => (prev ? { ...prev, balance: newBalance } : prev));
    };
    window.addEventListener("balance-updated", handler);
    return () => window.removeEventListener("balance-updated", handler);
  }, []);

  useEffect(() => setIsOpen(false), [pathname]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const switchAccount = (account: Account) => {
    setActiveAccount(account);
    localStorage.setItem(ACTIVE_ACCOUNT_KEY, String(account.id));
    onSwitchAccount?.(account);
    window.dispatchEvent(new CustomEvent("account-switch", { detail: { account } }));
  };

  const displayedAccounts = loginType === "demo"
    ? accounts.filter((acc) => acc.account_type === "demo" || acc.account_type === "mt5-demo")
    : accounts.filter((acc) => acc.account_type !== "demo" && acc.account_type !== "mt5-demo");

  const navItems = (() => {
    if (!activeAccount) {
      return [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/trading", label: "Trading", icon: TrendingUp },
      ];
    }

    const isDemo = activeAccount.account_type === "demo" || activeAccount.account_type === "mt5-demo";
    const isMt5 = activeAccount.platform === "mt5";
    const isProFx = activeAccount.account_type === "pro-fx";

    let items;
    if (isProFx) {
      items = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/fx-pro-trading", label: "Pro-FX Trading", icon: Zap },
        { href: "/fx-pro-robots", label: "Pro-Robots", icon: Bot },
        { href: "/wallet", label: "Wallet", icon: WalletIcon },
        { href: "/profile", label: "Profile", icon: User },
        { href: "/copy-trading", label: "Copy Trading", icon: Copy },
        { href: "/customercare", label: "Customer Care", icon: MessageSquare },
        { href: "/agents", label: "Agent Services", icon: Headset },
        { href: "/management", label: "Account Management", icon: Briefcase },
      ];
    } else if (isMt5) {
      items = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/mt5", label: "MT5 Trading", icon: TrendingUp },
        { href: "/ea-robots", label: "EA Robots", icon: Zap },
        { href: "/wallet", label: "Wallet", icon: WalletIcon },
        { href: "/profile", label: "Profile", icon: User },
        { href: "/customercare", label: "Customer Care", icon: MessageSquare },
        { href: "/agents", label: "Agent Services", icon: Headset },
      ];
    } else {
      items = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/trading", label: "Trading", icon: TrendingUp },
        { href: "/digits-trading", label: "Digits Trading", icon: Hash },
        { href: "/robots", label: "Robots", icon: Bot },
        { href: "/wallet", label: "Wallet", icon: WalletIcon },
        { href: "/profile", label: "Profile", icon: User },
        { href: "/copy-trading", label: "Copy Trading", icon: Copy },
        { href: "/customercare", label: "Customer Care", icon: MessageSquare },
        { href: "/agents", label: "Agent Services", icon: Headset },
        { href: "/management", label: "Account Management", icon: Briefcase },
      ];
    }

    if (isDemo) items = items.filter((item) => item.href !== "/wallet");
    return items;
  })();

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-60 md:hidden bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-lg shadow-[4px_4px_12px_#0891b2] dark:shadow-none">
        {isOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-64 sm:w-60 md:w-64 z-50 transform transition-transform duration-300 overflow-hidden flex flex-col
        bg-white border-r border-slate-200 shadow-[8px_0_20px_#c8cdd6]
        dark:bg-slate-950/80 dark:border-white/10 dark:shadow-none dark:backdrop-blur-2xl
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        
        {/* Header with Beta Trader Logo */}
        <div className="relative h-40 sm:h-36 md:h-48 w-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
          <img 
            src="/images/beta-trader-logo.png" 
            alt="Beta Trader" 
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 p-3 sm:p-3 md:p-4 flex-1 overflow-y-auto">
          {activeAccount && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl flex-shrink-0
              bg-slate-50 border border-slate-200 shadow-[inset_2px_2px_4px_#e2e8f0]
              dark:bg-white/[0.05] dark:border-white/10 dark:shadow-none dark:backdrop-blur-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {activeAccount.platform === "mt5" ? "MT5" : "Beta"} - {activeAccount.account_type.charAt(0).toUpperCase() + activeAccount.account_type.slice(1)}
                </p>
                <p className="text-xs text-cyan-600 dark:text-cyan-400">${Number(activeAccount.balance ?? 0).toFixed(2)}</p>
              </div>
            </div>
          )}

          {Array.isArray(displayedAccounts) && displayedAccounts.length > 1 && (
            <select value={activeAccount?.id ?? ""}
              onChange={(e) => {
                const acc = displayedAccounts.find((a) => a.id === Number(e.target.value));
                if (acc) switchAccount(acc);
              }}
              className="px-3 py-2 rounded-xl w-full text-sm flex-shrink-0
                bg-white border border-slate-200 text-slate-900 shadow-[inset_2px_2px_4px_#e2e8f0]
                dark:bg-white/10 dark:border-white/10 dark:text-white dark:shadow-none">
              {displayedAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.platform === "mt5" ? "MT5" : "Beta"} - {acc.account_type.charAt(0).toUpperCase() + acc.account_type.slice(1)} (${Number(acc.balance).toFixed(2)})
                </option>
              ))}
            </select>
          )}

          <nav className="flex flex-col gap-1.5 min-h-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}
                  className={`relative flex items-center gap-3 px-4 py-2.5 md:py-3 rounded-xl transition-all group flex-shrink-0
                    ${isActive
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[4px_4px_12px_#0891b2] dark:shadow-none"
                      : "text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                    }`}>
                  <Icon size={20} className={isActive ? "text-white flex-shrink-0" : "text-slate-500 dark:text-white/50 group-hover:text-slate-900 dark:group-hover:text-white flex-shrink-0"} />
                  <span className="font-medium text-sm sm:text-sm md:text-base truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 p-3 sm:p-3 md:p-4 border-t border-slate-200 dark:border-white/10 flex-shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-slate-500 dark:text-white/50 font-medium">Theme</span>
            <ThemeToggle />
          </div>

          <Link href="/terms" onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-4 py-2 sm:py-2.5 rounded-xl text-sm transition-all
              ${pathname === "/terms"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[3px_3px_8px_#0891b2] dark:shadow-none"
                : "text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
              }`}>
            <FileText size={18} className="flex-shrink-0" />
            <span className="font-medium truncate">Terms & Conditions</span>
          </Link>

          <div className="rounded-xl px-3 py-2 bg-white border border-slate-200 shadow-[inset_2px_2px_4px_#e2e8f0] dark:bg-white/[0.05] dark:border-white/10 dark:shadow-none">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">Beta Trader v1.0</p>
              <span className="rounded-full border border-cyan-400/60 bg-cyan-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Beta</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-white/50">Smart Trading Platform</p>
          </div>

          <button onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 sm:py-2.5 md:py-3 rounded-xl text-slate-600 dark:text-white/70 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all w-full group text-sm md:text-base">
            <LogOut size={20} className="text-slate-500 dark:text-white/50 group-hover:text-rose-600 dark:group-hover:text-rose-400 flex-shrink-0" />
            <span className="font-medium truncate">Logout</span>
          </button>
        </div>
      </aside>

      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
}
