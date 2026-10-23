"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Account } from "@/types/account";
import { ThemeToggle } from "@/components/ThemeToggle";

interface User {
  username: string;
  email: string;
  image?: string;
  accounts: Account[];
}

interface TopNavbarProps {
  isLoggedIn?: boolean;
  user?: User | null;
  accountBalance: number;
  showBalance?: boolean;
  activeAccount: Account | null;
  accounts: Account[];
  onSwitchAccount: (account: Account) => void;
  onLogout?: () => void;
}

const ACTIVE_ACCOUNT_KEY = "active_account_id";

export function TopNavbar({
  isLoggedIn = false,
  user = null,
  accountBalance,
  showBalance = false,
  activeAccount: propActiveAccount,
  accounts,
  onSwitchAccount,
  onLogout,
}: TopNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeAccount, setActiveAccount] = useState<Account | null>(propActiveAccount);

  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ account: Account }>;
      setActiveAccount(ev.detail.account);
    };
    window.addEventListener("account-switch", handler);
    return () => window.removeEventListener("account-switch", handler);
  }, []);

  useEffect(() => {
    if (propActiveAccount) {
      setActiveAccount(propActiveAccount);
      localStorage.setItem(ACTIVE_ACCOUNT_KEY, String(propActiveAccount.id));
    }
  }, [propActiveAccount]);

  const handleAccountChange = (accountId: string) => {
    const selected = accounts.find((a) => String(a.id) === accountId);
    if (selected) {
      setActiveAccount(selected);
      localStorage.setItem(ACTIVE_ACCOUNT_KEY, String(selected.id));
      onSwitchAccount(selected);
      window.dispatchEvent(new CustomEvent("account-switch", { detail: { account: selected } }));
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    onLogout?.();
    setIsMobileMenuOpen(false);
    localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    window.dispatchEvent(new Event("custom-storage-change"));
  };

  const formatAccountType = (type: string) => type ? type.charAt(0).toUpperCase() + type.slice(1) : "Unknown";

  const formattedBalance = typeof accountBalance === "number" && !isNaN(accountBalance) ? accountBalance.toFixed(2) : "0.00";

  return (
    <nav className="sticky top-0 z-50 w-full border-b
      bg-white/80 border-slate-200 shadow-[0_4px_12px_#c8cdd6]
      dark:bg-slate-950/80 dark:border-white/10 dark:shadow-none dark:backdrop-blur-2xl">
      <div className="px-4 sm:px-6 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-[3px_3px_8px_#0891b2] dark:shadow-none">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white hidden sm:inline">Beta Trader</span>
          </Link>

          {isLoggedIn && user && activeAccount ? (
            <div className="hidden md:flex items-center gap-4">
              {showBalance && (
                <>
                  <span className="text-sm text-slate-500 dark:text-white/50">Balance</span>
                  <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">${formattedBalance}</span>
                </>
              )}
              <select value={activeAccount?.id || ""} onChange={(e) => handleAccountChange(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm
                  bg-slate-50 border border-slate-200 text-slate-900 shadow-[inset_2px_2px_4px_#e2e8f0]
                  dark:bg-white/10 dark:border-white/10 dark:text-white dark:shadow-none">
                {accounts.map((account) => (
                  <option key={String(account.id)} value={String(account.id)}>
                    {formatAccountType(account.account_type)} (${Number(account.balance).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[3px_3px_8px_#0891b2] dark:shadow-none">Sign In</Button>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {isLoggedIn && user ? (
              <>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user.username || "User"}</p>
                    <p className="text-xs text-slate-500 dark:text-white/50 capitalize">
                      {activeAccount ? formatAccountType(activeAccount.account_type) : "Loading..."}
                    </p>
                  </div>
                  {user.image && (
                    <img src={user.image || "/placeholder.svg"} alt={user.username || "User"}
                      className="w-8 h-8 rounded-full border-2 border-cyan-400 dark:border-cyan-500" />
                  )}
                  <Button onClick={handleLogout} variant="ghost" size="sm"
                    className="text-slate-500 dark:text-white/50 hover:text-rose-600 dark:hover:text-rose-400">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>

                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="sm:hidden p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                  {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-700 dark:text-white" /> : <Menu className="w-5 h-5 text-slate-700 dark:text-white" />}
                </button>
              </>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[3px_3px_8px_#0891b2] dark:shadow-none">Sign In</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && isLoggedIn && user && (
          <div className="sm:hidden mt-4 pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
            <div className="flex items-center gap-3 pb-3">
              {user.image && (
                <img src={user.image || "/placeholder.svg"} alt={user.username || "User"}
                  className="w-10 h-10 rounded-full border-2 border-cyan-400 dark:border-cyan-500" />
              )}
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user.username || "User"}</p>
                <p className="text-xs text-slate-500 dark:text-white/50 capitalize">
                  {activeAccount ? formatAccountType(activeAccount.account_type) : "Loading..."}
                </p>
              </div>
            </div>

            {showBalance && activeAccount && (
              <div className="rounded-xl p-3 bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10">
                <p className="text-xs text-slate-500 dark:text-white/50 mb-1">Account Balance</p>
                <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">${formattedBalance}</p>
                <select value={activeAccount?.id || ""} onChange={(e) => handleAccountChange(e.target.value)}
                  className="mt-2 w-full px-3 py-2 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                  {accounts.map((account) => (
                    <option key={String(account.id)} value={String(account.id)}>
                      {formatAccountType(account.account_type)} (${Number(account.balance).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button onClick={handleLogout} className="w-full bg-rose-600 hover:bg-rose-700 text-white">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
