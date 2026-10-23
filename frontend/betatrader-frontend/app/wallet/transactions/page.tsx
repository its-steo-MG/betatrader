"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type WalletTransaction, api } from "@/lib/api";
import { TransactionItem } from "@/components/wallet/transaction-items";
import { TransactionDetailModal } from "@/components/wallet/transactio-detail-modal";
import { formatCurrency } from "@/lib/format-currency";
import { toast } from "sonner";

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<WalletTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "deposits" | "withdrawals">("all");
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction | null>(null);

  const fetchTransactions = async () => {
    try {
      const res = await api.getWalletTransactions();
      if (res.error) throw new Error(res.error);

      let data: WalletTransaction[] = [];
      if (!res.data) {
        data = [];
      } else if (Array.isArray(res.data)) {
        data = res.data as WalletTransaction[];
      } else if (res.data.results && Array.isArray(res.data.results)) {
        data = res.data.results as WalletTransaction[];
      } else if (res.data.transactions && Array.isArray(res.data.transactions)) {
        data = res.data.transactions as WalletTransaction[];
      } else {
        data = [];
      }

      setTransactions(data);
      filterTransactions(data, activeTab);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      toast.error("Failed to load transactions");
      setTransactions([]);
      setFilteredTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = (data: WalletTransaction[], tab: typeof activeTab) => {
    let filtered = data;
    if (tab === "deposits") {
      filtered = data.filter((tx) => tx.transaction_type === "deposit");
    } else if (tab === "withdrawals") {
      filtered = data.filter((tx) => tx.transaction_type === "withdrawal");
    }
    setFilteredTransactions(filtered);
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterTransactions(transactions, activeTab);
  }, [activeTab, transactions]);

  const handleTransactionClick = (tx: WalletTransaction) => setSelectedTransaction(tx);

  return (
    <div className="relative min-h-screen text-foreground overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-500/20" />
        <div className="absolute top-1/4 -right-32 h-80 w-80 rounded-full bg-blue-400/15 blur-3xl dark:bg-blue-500/15" />
      </div>

      <div className="relative z-10 pt-12 pb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center
              bg-white border border-slate-200 shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]
              dark:bg-white/10 dark:border-white/10 dark:shadow-none
              hover:bg-slate-50 dark:hover:bg-white/20 transition"
          >
            <svg className="w-6 h-6 text-slate-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Transactions</h1>
          <div className="w-10" />
        </div>

        <div className="flex rounded-full p-1 mb-8
          bg-slate-100 border border-slate-200 shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]
          dark:bg-white/[0.05] dark:border-white/10 dark:shadow-none">
          {(["all", "deposits", "withdrawals"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-6 rounded-full text-sm font-medium capitalize transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[3px_3px_8px_#0891b2] dark:shadow-none"
                  : "text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              {tab === "all" ? "All" : tab === "deposits" ? "Deposits" : "Withdrawals"}
            </button>
          ))}
        </div>

        <div className="rounded-2xl overflow-hidden
          bg-white border border-slate-200 shadow-[6px_6px_14px_#c8cdd6,-6px_-6px_14px_#ffffff]
          dark:bg-white/[0.05] dark:border-white/10 dark:shadow-none dark:backdrop-blur-xl">
          {loading ? (
            <div className="p-8 text-center text-slate-500 dark:text-white/50">Loading transactions...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-white/50">
              <p className="text-lg">No {activeTab === "all" ? "" : activeTab} yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-white/10">
              {filteredTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={{
                    id: transaction.id,
                    type: transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1),
                    amount: `${formatCurrency(transaction.amount)} ${transaction.currency?.code || "USD"}`,
                    convertedAmount: transaction.converted_amount ? `${formatCurrency(transaction.converted_amount)} ${transaction.target_currency?.code || "USD"}` : undefined,
                    date: new Date(transaction.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
                    transactionType: transaction.transaction_type,
                    exchangeRateUsed: transaction.exchange_rate_used,
                    status: transaction.status,
                    currency: transaction.currency,
                    target_currency: transaction.target_currency,
                    reference_id: transaction.reference_id,
                    checkout_request_id: transaction.checkout_request_id,
                  }}
                  onClick={() => handleTransactionClick(transaction)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedTransaction && (
        <TransactionDetailModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
      )}
    </div>
  );
}
