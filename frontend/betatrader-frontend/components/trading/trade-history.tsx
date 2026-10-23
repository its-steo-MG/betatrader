"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { CheckCircle, XCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Trade {
  id: string | number;
  market: string | { name: string } | null;
  direction: string | null;
  amount: number;
  is_win: boolean;
  profit: number;
  created_at: string;
  entrySpot?: number;
  exitSpot?: number;
  trade_type_id?: number;
  buyPrice?: number;
}

interface TradeHistoryProps {
  sessionTrades?: Trade[];
}

export function TradeHistory({ sessionTrades }: TradeHistoryProps) {
  const { toast } = useToast();
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [tradeTypes, setTradeTypes] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const tradesPerPage = 10;

  useEffect(() => {
    const fetchTradeTypes = async () => {
      try {
        const response = await api.getTradeTypes();
        const { data, error } = response as { data?: { id: number; name: string }[]; error?: unknown };
        if (!error && Array.isArray(data)) setTradeTypes(data);
      } catch (err) {
        console.error("Failed to fetch trade types:", err);
      }
    };
    fetchTradeTypes();
  }, []);

  useEffect(() => {
    const fetchAllTrades = async () => {
      setIsLoading(true);
      try {
        const response = (await api.getTradeHistory()) as { data?: { trades: Trade[] }; error?: unknown };
        const { data, error } = response;
        if (error) {
          toast({ title: "Error", description: "Failed to load trade history", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        const tradeData = Array.isArray(data?.trades) ? data.trades : [];
        setAllTrades(tradeData.reverse());
        setCurrentPage(1);
      } catch {
        toast({ title: "Error", description: "Failed to fetch trade history", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllTrades();
  }, [toast]);

  const getDirectionLabel = (direction: string | null, tradeTypeId?: number) => {
    if (!direction) return "DIGIT";
    const tradeType = tradeTypes.find((t) => t.id === tradeTypeId);
    const tradeTypeName = tradeType?.name?.toLowerCase() || "";
    if (tradeTypeName === "rise/fall") return direction.toLowerCase() === "rise" ? "RISE" : "FALL";
    return direction.toUpperCase();
  };

  const formatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  const totalPages = Math.max(1, Math.ceil(allTrades.length / tradesPerPage));
  const startIndex = (currentPage - 1) * tradesPerPage;
  const displayTrades = allTrades.slice(startIndex, startIndex + tradesPerPage);

  return (
    <section className="overflow-hidden rounded-2xl p-4 sm:p-5
      bg-white border border-slate-200
      shadow-[8px_8px_16px_#b8bdc6,-8px_-8px_16px_#ffffff]
      dark:bg-white/[0.05] dark:border-white/10 dark:shadow-none dark:backdrop-blur-sm">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-800 dark:text-white sm:text-lg">Trade History</h3>
        <span className="shrink-0 text-xs text-slate-500 dark:text-white/50">{allTrades.length}</span>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-white/50">Loading trades...</p>
      ) : allTrades.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-white/50">No trades yet</p>
      ) : (
        <>
          <div className="space-y-2">
            {displayTrades.map((trade) => {
              const win = trade.is_win;
              const market = typeof trade.market === "string" ? trade.market : trade.market?.name || "Unknown";
              const dateStr = formatDate(trade.created_at);
              return (
                <div key={trade.id} className="drop-on-top relative flex w-full items-center gap-3 p-3 rounded-xl overflow-hidden
                  bg-slate-50 border border-slate-100
                  dark:bg-white/[0.05] dark:border-white/10">
                  <span className={`relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
                    ${win
                      ? "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400"
                      : "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"}`}>
                    {win ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  </span>
                  <div className="relative z-[1] min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-white">{market}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-white/50">
                      {getDirectionLabel(trade.direction, trade.trade_type_id)} • ${Number(trade.amount || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="relative z-[1] shrink-0 text-right">
                    <p className={`text-sm font-semibold ${win ? "text-cyan-600 dark:text-cyan-400" : "text-rose-500 dark:text-rose-400"}`}>
                      {win ? "+" : "-"}${Math.abs(Number(trade.profit || 0)).toFixed(2)}
                    </p>
                    {dateStr && (
                      <p className="text-[10px] text-slate-400 dark:text-white/40">
                        {dateStr}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <p className="text-xs text-slate-500 dark:text-white/50">
              Page <span className="font-bold text-slate-700 dark:text-white">{currentPage}</span> of{" "}
              <span className="font-bold text-slate-700 dark:text-white">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <Button onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)} disabled={currentPage === 1}
                className="h-9 rounded-lg bg-slate-100 px-3 text-xs font-semibold text-slate-700 disabled:opacity-50
                  shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]
                  dark:bg-white/10 dark:text-white dark:shadow-none">
                Previous
              </Button>
              <Button onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}
                className="flex h-9 items-center gap-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 text-xs font-semibold text-white disabled:opacity-50
                  shadow-[3px_3px_6px_#0891b2,-2px_-2px_4px_#22d3ee] dark:shadow-none">
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
