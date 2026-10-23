"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TradingViewWidget } from "@/components/dashboard/trading-view";
import { TransactionHistory } from "@/components/dashboard/transaction-history";
import { toast } from "sonner";
import { Eye, EyeOff, Activity, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/format-currency";

interface Account {
  id: number;
  account_type: string;
  balance: number;
  kyc_verified: boolean;
}

interface Transaction {
  id: number;
  amount: number;
  transaction_type: "deposit" | "withdrawal" | "trade";
  description: string;
  created_at: string;
}

interface DashboardData {
  user: {
    username: string;
    email: string;
    phone: string;
    is_sashi: boolean;
    is_email_verified: boolean;
    accounts: Account[];
  };
  accounts: Array<{
    account_type: string;
    balance: number;
    transactions: Transaction[];
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string>("standard");
  const [loginType, setLoginType] = useState<string>("real");
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);

  const showSuccess = (message: string) => toast.success(message);
  const showError = (message: string) => toast.error(message);

  const normalizeDashboardData = (raw: unknown): DashboardData | null => {
    if (!raw || typeof raw !== "object") return null;
    const rawData = raw as Record<string, unknown>;
    if (!rawData.user || typeof rawData.user !== "object") return null;
    const user = rawData.user as Record<string, unknown>;

    const normalizedUserAccounts: Account[] = Array.isArray(user.accounts)
      ? user.accounts.map((acc: unknown) => {
          if (!acc || typeof acc !== "object") return null;
          const a = acc as Record<string, unknown>;
          return {
            id: Number(a.id),
            account_type: String(a.account_type || ""),
            balance: Number(a.balance) || 0,
            kyc_verified: Boolean(a.kyc_verified),
          };
        }).filter((acc): acc is Account => acc !== null)
      : [];

    const normalizedAccounts = Array.isArray(rawData.accounts)
      ? (rawData.accounts as unknown[]).map((acc: unknown) => {
          if (!acc || typeof acc !== "object") return null;
          const a = acc as Record<string, unknown>;
          const transactions: Transaction[] = Array.isArray(a.transactions)
            ? (a.transactions as unknown[]).map((tx: unknown) => {
                if (!tx || typeof tx !== "object") return null;
                const t = tx as Record<string, unknown>;
                return {
                  id: Number(t.id),
                  amount: Number(t.amount) || 0,
                  transaction_type: (["deposit", "withdrawal", "trade"].includes(String(t.transaction_type))
                    ? t.transaction_type : "deposit") as "deposit" | "withdrawal" | "trade",
                  description: String(t.description || ""),
                  created_at: String(t.created_at || ""),
                };
              }).filter((tx): tx is Transaction => tx !== null)
            : [];
          return {
            account_type: String(a.account_type || ""),
            balance: Number(a.balance) || 0,
            transactions,
          };
        }).filter((acc): acc is NonNullable<typeof acc> => acc !== null)
      : [];

    return {
      user: {
        username: String(user.username || ""),
        email: String(user.email || ""),
        phone: String(user.phone || ""),
        is_sashi: Boolean(user.is_sashi),
        is_email_verified: Boolean(user.is_email_verified),
        accounts: normalizedUserAccounts,
      },
      accounts: normalizedAccounts,
    };
  };

  const fetchData = () => {
    setLoading(true);
    setError(null);
    api.getDashboard()
      .then((res) => {
        if (res.error) { setError(res.error); return; }
        const normalizedData = normalizeDashboardData(res.data);
        if (normalizedData) {
          setData(normalizedData);
          const activeId = localStorage.getItem("active_account_id");
          const found = normalizedData.user.accounts.find((acc) => String(acc.id) === String(activeId));
          if (found) setActiveAccount(found);
        } else {
          setError("Invalid dashboard data");
        }
        const activeType = localStorage.getItem("account_type") || "standard";
        setSelectedAccount(activeType);
        setLoginType(activeType === "demo" ? "demo" : "real");
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchData();
      const handleSessionUpdate = () => {
        setSelectedAccount(localStorage.getItem("account_type") || "standard");
        fetchData();
      };
      window.addEventListener("session-updated", handleSessionUpdate);
      return () => window.removeEventListener("session-updated", handleSessionUpdate);
    }
  }, []);

  const handleResetDemo = async () => {
    try {
      const res = await api.resetDemoBalance();
      if (res.error) throw new Error(res.error);
      showSuccess("Demo balance reset to $10,000");
      window.dispatchEvent(new Event("session-updated"));
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Failed to reset");
    }
  };

  const isRealAccount = loginType === "real";
  const selectedAccountData = data?.accounts?.find((a) => a.account_type === selectedAccount);
  const txCount = selectedAccountData?.transactions?.length || 0;
  const isDemo = loginType === "demo" || activeAccount?.account_type === "mt5-demo" || activeAccount?.account_type === "demo";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="text-center">
          <p className="text-slate-700 dark:text-white mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-cyan-500 text-white rounded-lg">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Dark mode background */}
      <div className="fixed inset-0 z-0 dark:block hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/15 via-transparent to-transparent" />
      </div>
      {/* Light mode background */}
      <div className="fixed inset-0 z-0 block dark:hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-50" />
      </div>

      <div className="relative z-10 p-4 lg:p-6">
        <div className="max-w-[1400px] mx-auto space-y-4">
          
          {/* TOP BAR */}
          <div className="flex items-center justify-between rounded-2xl px-5 py-3
            bg-white border border-slate-200
            shadow-[8px_8px_16px_#b8bdc6,-8px_-8px_16px_#ffffff]
            dark:bg-white/[0.07] dark:border-white/20 dark:shadow-none dark:backdrop-blur-[32px] dark:saturate-150">
            <div className="flex items-center gap-4">
              <img src="/images/traderiser-logo-192.png" alt="BetaTrader" className="h-9 w-9 rounded-lg" />
              <div>
                <p className="text-xs text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">BetaTrader</p>
                <h1 className="text-slate-800 dark:text-white font-semibold">{data?.user?.username}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium
                ${isRealAccount 
                  ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300" 
                  : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"}`}>
                {isRealAccount ? "● Live" : "● Demo"}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{selectedAccount}</span>
            </div>
          </div>

          {/* BENTO GRID */}
          <div className="grid grid-cols-12 gap-4">
            
            {/* Balance Card */}
            <div className="col-span-12 lg:col-span-4 rounded-2xl p-6 text-white relative overflow-hidden
              bg-gradient-to-br from-cyan-500 to-blue-600
              shadow-[10px_10px_20px_#0e7490,-6px_-6px_16px_#22d3ee]
              dark:shadow-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/15 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <p className="text-cyan-100 text-sm mb-1">Available Balance</p>
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl font-bold tracking-tight">
                    {showBalance ? `$${formatCurrency(selectedAccountData?.balance || 0)}` : "••••••"}
                  </h2>
                  <button onClick={() => setShowBalance(!showBalance)} className="p-1.5 hover:bg-white/10 rounded-lg">
                    {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-cyan-100">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  {isDemo ? "Practice Mode" : "Live Trading"}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="col-span-6 lg:col-span-2 rounded-2xl p-5 flex flex-col justify-center
              bg-white border border-slate-200
              shadow-[8px_8px_16px_#b8bdc6,-8px_-8px_16px_#ffffff]
              dark:bg-white/[0.07] dark:border-white/20 dark:shadow-none dark:backdrop-blur-[32px]">
              <Activity className="text-cyan-500 dark:text-cyan-400 mb-2" size={20} />
              <p className="text-3xl font-bold text-slate-800 dark:text-white">{txCount}</p>
              <p className="text-xs text-slate-500 dark:text-white/60">Transactions</p>
            </div>

            <div className="col-span-6 lg:col-span-2 rounded-2xl p-5 flex flex-col justify-center
              bg-white border border-slate-200
              shadow-[8px_8px_16px_#b8bdc6,-8px_-8px_16px_#ffffff]
              dark:bg-white/[0.07] dark:border-white/20 dark:shadow-none dark:backdrop-blur-[32px]">
              <Wallet className="text-cyan-500 dark:text-cyan-400 mb-2" size={20} />
              <p className="text-3xl font-bold text-slate-800 dark:text-white">{data?.user?.accounts?.length || 0}</p>
              <p className="text-xs text-slate-500 dark:text-white/60">Accounts</p>
            </div>

            {/* Quick Actions */}
            <div className="col-span-12 lg:col-span-4 rounded-2xl p-5
              bg-white border border-slate-200
              shadow-[8px_8px_16px_#b8bdc6,-8px_-8px_16px_#ffffff]
              dark:bg-white/[0.07] dark:border-white/20 dark:shadow-none dark:backdrop-blur-[32px]">
              <p className="text-xs text-slate-500 dark:text-white/60 mb-3 uppercase tracking-wide">Quick Actions</p>
              <div className="flex gap-3">
                <button
                  onClick={() => !isDemo && window.location.assign("/wallet")}
                  disabled={isDemo}
                  className={`drop-on-top relative flex-1 py-3 rounded-xl font-medium text-sm transition-all overflow-hidden
                    ${isDemo 
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-white/5 dark:text-white/30" 
                      : "bg-cyan-500 text-white shadow-[6px_6px_12px_#0891b2,-4px_-4px_10px_#22d3ee] dark:bg-gradient-to-br dark:from-cyan-500/70 dark:to-blue-500/70 dark:shadow-none dark:border dark:border-white/30"}`}
                >
                  <span className="relative z-[1]">Deposit</span>
                </button>
                <button
                  onClick={() => !isDemo && window.location.assign("/wallet")}
                  disabled={isDemo}
                  className={`drop-on-top relative flex-1 py-3 rounded-xl font-medium text-sm transition-all overflow-hidden
                    ${isDemo 
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-white/5 dark:text-white/30" 
                      : "bg-slate-200 text-slate-700 shadow-[6px_6px_12px_#cbd5e1,-4px_-4px_10px_#ffffff] dark:bg-white/[0.08] dark:text-white dark:shadow-none dark:border dark:border-white/20"}`}
                >
                  <span className="relative z-[1]">Withdraw</span>
                </button>
              </div>
              {isDemo && (
                <button onClick={handleResetDemo} className="drop-on-top relative w-full mt-3 py-2 text-xs text-cyan-600 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/30 rounded-lg overflow-hidden">
                  <span className="relative z-[1]">Reset Demo Balance</span>
                </button>
              )}
            </div>

            {/* Chart */}
            <div className="col-span-12 lg:col-span-8">
              <TradingViewWidget symbol="NASDAQ:AAPL" />
            </div>

            {/* Activity - Uses TransactionHistory component */}
            <div className="col-span-12 lg:col-span-4">
              <TransactionHistory transactions={selectedAccountData?.transactions?.slice(0, 8) || []} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
