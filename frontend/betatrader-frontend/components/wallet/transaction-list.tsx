"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { formatCurrency } from "@/lib/format-currency";
import { type WalletTransaction, api } from "@/lib/api";
import { TransactionItem } from "./transaction-items";
import { TransactionDetailModal } from "./transactio-detail-modal";
import { toast } from "sonner";

export function TransactionList() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<WalletTransaction | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      } else if (typeof res.data === "object") {
        data = Object.values(res.data).find(Array.isArray) || [];
      }
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      toast.error("Failed to load transactions");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    const handleSessionUpdate = () => fetchTransactions();
    window.addEventListener("session-updated", handleSessionUpdate);
    const interval = setInterval(fetchTransactions, 30000);
    return () => {
      window.removeEventListener("session-updated", handleSessionUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleViewAll = () => router.push("/wallet/transactions");
  const handleTransactionClick = (tx: WalletTransaction) => setSelectedTransaction(tx);

  return (
    <>
      <div className="rounded-2xl overflow-hidden
        bg-white border border-slate-200 shadow-[6px_6px_14px_#c8cdd6,-6px_-6px_14px_#ffffff]
        dark:bg-white/[0.05] dark:border-white/10 dark:shadow-none dark:backdrop-blur-xl">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-white/10">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">Transactions</h3>
          <button onClick={handleViewAll} className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 font-semibold text-xs sm:text-sm">
            View all
          </button>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-white/10">
          {loading ? (
            <div className="p-6 text-center text-slate-500 dark:text-white/50">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="p-6 text-center text-slate-500 dark:text-white/50">No transactions yet</div>
          ) : (
            transactions.slice(0, 6).map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={{
                  id: transaction.id,
                  type: transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1),
                  amount: `${formatCurrency(transaction.amount)} ${transaction.currency?.code || "USD"}`,
                  convertedAmount: transaction.converted_amount ? `${formatCurrency(transaction.converted_amount)} ${transaction.target_currency?.code || "USD"}` : undefined,
                  date: new Date(transaction.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
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
            ))
          )}
        </div>
      </div>

      {/* Portal the modal to document body so it's not clipped by overflow-hidden */}
      {mounted && selectedTransaction && createPortal(
        <TransactionDetailModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />,
        document.body
      )}
    </>
  );
}
