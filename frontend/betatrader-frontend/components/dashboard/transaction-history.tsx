import { formatCurrency } from "@/lib/format-currency";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface Transaction {
  id: number;
  amount: number | string;
  transaction_type: "deposit" | "withdrawal" | "trade";
  description: string;
  created_at: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <section className="overflow-hidden rounded-2xl p-4 sm:p-5
      bg-white border border-slate-200
      shadow-[8px_8px_16px_#b8bdc6,-8px_-8px_16px_#ffffff]
      dark:bg-white/[0.05] dark:border-white/10 dark:shadow-none dark:backdrop-blur-sm">
      
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-800 dark:text-white sm:text-lg">Recent Activity</h3>
        <span className="shrink-0 text-xs text-slate-500 dark:text-white/50">{transactions.length}</span>
      </div>

      {transactions.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-white/50">No transactions yet</p>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => {
            const out = tx.transaction_type === "withdrawal";
            return (
              <div
                key={tx.id}
                className="drop-on-top relative flex w-full items-center gap-3 p-3 rounded-xl overflow-hidden
                  bg-slate-50 border border-slate-100
                  dark:bg-white/[0.05] dark:border-white/10"
              >
                <span
                  className={`relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                    ${out
                      ? "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                      : "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400"
                    }`}
                >
                  {out ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                </span>

                <div className="relative z-[1] min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-700 dark:text-white capitalize">
                    {tx.transaction_type}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-white/50">
                    {tx.description || "—"}
                  </p>
                </div>

                <div className="relative z-[1] shrink-0 text-right">
                  <p className={`text-sm font-semibold ${out ? "text-rose-500 dark:text-rose-400" : "text-cyan-600 dark:text-cyan-400"}`}>
                    {out ? "-" : "+"}${formatCurrency(tx.amount)}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-white/40">
                    {formatDate(tx.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
