"use client";

import { formatCurrency } from "@/lib/format-currency";
import { type WalletTransaction } from "@/lib/api";
import Image from "next/image";
import { generateFakeMpesaReceipt } from "@/lib/mpesa-utils";
import { ChevronLeft } from "lucide-react";

interface TransactionDetailModalProps {
  transaction: WalletTransaction;
  onClose: () => void;
}

export function TransactionDetailModal({ transaction, onClose }: TransactionDetailModalProps) {
  const txType = transaction.transaction_type.toLowerCase();

  const flagSrc = (() => {
    if (txType === "deposit") return "/real-account-icon.png";
    if (txType === "withdrawal") return "/transaction-icon.png";
    if (txType === "transfer_in" || txType === "transfer_out") return "/transfer-in-icon.png";
    return "/transaction-icon.png";
  })();

  const title =
    txType === "deposit" ? "DEPOSIT" :
    txType === "withdrawal" ? "WITHDRAW" :
    txType === "transfer_in" ? "RECEIVED" :
    txType === "transfer_out" ? "SENT" : "TRANSACTION";

  let primaryAmount: string;
  let secondaryAmount: string = "";

  const formatAmount = (amount: number | string, currencyCode: string = "USD") => {
    const num = Number(amount);
    if (currencyCode.toUpperCase() === "KES" || currencyCode.toUpperCase() === "KSH") {
      return `KSH ${num.toLocaleString("en-US")}`;
    }
    return `$${num.toLocaleString("en-US")}`;
  };

  if (txType === "transfer_in" || txType === "transfer_out") {
    const amount = transaction.amount || transaction.converted_amount || 0;
    const sign = txType === "transfer_in" ? "+" : "-";
    primaryAmount = `${sign}$${formatCurrency(amount)}`;
  } else {
    if (txType === "deposit") {
      primaryAmount = formatAmount(transaction.amount, transaction.currency?.code || "KES");
    } else {
      primaryAmount = `$${formatCurrency(transaction.amount)}`;
    }
    if (txType === "deposit" && transaction.converted_amount) {
      secondaryAmount = `$${formatCurrency(transaction.converted_amount)} USD`;
    } else if (txType === "withdrawal" && transaction.converted_amount) {
      secondaryAmount = `KSH ${formatCurrency(transaction.converted_amount)}`;
    }
  }

  const derivId = transaction.reference_id ? transaction.reference_id.replace("WT-", "").replace("TR-", "") : "N/A";
  const mpesaId = transaction.checkout_request_id ? transaction.checkout_request_id : generateFakeMpesaReceipt(transaction);

  const formattedDate = new Date(transaction.created_at).toLocaleString("en-US", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="w-full max-w-md rounded-3xl p-6
          bg-white border border-slate-200 shadow-[8px_8px_24px_#c8cdd6,-8px_-8px_24px_#ffffff]
          dark:bg-slate-900/95 dark:border-white/10 dark:shadow-none dark:backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center
              bg-slate-100 border border-slate-200 shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]
              dark:bg-white/10 dark:border-white/10 dark:shadow-none
              hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <ChevronLeft className="w-6 h-6 text-slate-800 dark:text-white" />
          </button>
          <p className="text-sm font-medium text-slate-500 dark:text-white/50">{formattedDate}</p>
          <div className="w-10 h-10" />
        </div>

        <div className="rounded-2xl p-6 text-center
          bg-slate-50 border border-slate-200 shadow-[inset_2px_2px_6px_#e2e8f0]
          dark:bg-white/[0.05] dark:border-white/10 dark:shadow-none">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{title}</h3>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden">
            <Image src={flagSrc} alt="Flag" width={64} height={64} className="object-cover" />
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-white mb-1 tracking-tight">{primaryAmount}</p>
          {secondaryAmount && (
            <p className="text-xl font-semibold text-slate-500 dark:text-white/50 mb-6">{secondaryAmount}</p>
          )}
          <p className="text-sm text-slate-500 dark:text-white/50">BETA TRADER ID: {derivId}</p>
          {(txType === "deposit" || txType === "withdrawal") && (
            <p className="text-sm text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/15 inline-block px-3 py-1 rounded-full mt-3">
              M-PESA ID: {mpesaId}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
