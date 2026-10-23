"use client";

import { useEffect, useState } from "react";
import { WalletHeader } from "@/components/wallet/wallet-header";
import { BalanceCard } from "@/components/wallet/balance-card";
import { ActionButtons } from "@/components/wallet/action-buttons";
import { TransactionList } from "@/components/wallet/transaction-list";
import { DepositModal } from "@/components/wallet/deposit-modal";
import { WithdrawModal } from "@/components/wallet/withdraw-modal";
import { VerifyWithdrawalModal } from "@/components/wallet/verify-withdrawal-modal";
import { TransferModal } from "@/components/wallet/transfer-modal";
import { VerifyTransferModal } from "@/components/wallet/verify-transfer-modal";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DashboardData {
  user: { username: string; email: string; image?: string };
  accounts: Array<{ id: number; account_type: string; balance: number }>;
  session_active: boolean;
}

export default function Page() {
  const router = useRouter();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string>("standard");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showVerifyTransferModal, setShowVerifyTransferModal] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState<string>("");

  useEffect(() => {
    const storedAccountType = localStorage.getItem("account_type") || "standard";
    setSelectedAccount(storedAccountType);

    const fetchDashboardData = async () => {
      try {
        const dashboardRes = await api.getDashboard();
        if (dashboardRes.error) throw new Error(dashboardRes.error);
        const dashboard = dashboardRes.data as DashboardData;
        setDashboardData({
          ...dashboard,
          accounts: dashboard.accounts.map((acc) => ({ ...acc, balance: Number(acc.balance) || 0 })),
        });
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
        toast.error("Failed to load wallet data");
        if (!showDepositModal && !showWithdrawModal && !showVerifyModal) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();

    const handleSessionUpdate = () => {
      const newType = localStorage.getItem("account_type") || "standard";
      setSelectedAccount(newType);
      fetchDashboardData();
    };
    window.addEventListener("session-updated", handleSessionUpdate);

    window.dispatchEvent(
      new CustomEvent("modal-state", {
        detail: {
          isActive: showDepositModal || showWithdrawModal || showVerifyModal || showTransferModal || showVerifyTransferModal,
        },
      })
    );

    return () => window.removeEventListener("session-updated", handleSessionUpdate);
  }, [router, showDepositModal, showWithdrawModal, showVerifyModal, showTransferModal, showVerifyTransferModal]);

  const dismissMessage = () => setMessage(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-muted-foreground">
        <div className="text-cyan-500 animate-pulse">Loading wallet...</div>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-screen text-foreground overflow-hidden">
        {/* Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-500/20" />
          <div className="absolute top-1/4 -right-32 h-80 w-80 rounded-full bg-blue-400/15 blur-3xl dark:bg-blue-500/15" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-teal-300/10 blur-3xl dark:bg-teal-500/10" />
        </div>

        <main className="relative z-10 p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <WalletHeader />
            <BalanceCard />
            <ActionButtons
              onDeposit={() => setShowDepositModal(true)}
              onWithdraw={() => setShowWithdrawModal(true)}
              onTransfer={() => setShowTransferModal(true)}
            />
            <TransactionList />

            {showDepositModal && <DepositModal onClose={() => setShowDepositModal(false)} onSetMessage={setMessage} />}
            {showWithdrawModal && (
              <WithdrawModal
                onClose={() => setShowWithdrawModal(false)}
                onSuccess={(txId?: string) => {
                  setShowWithdrawModal(false);
                  if (txId) setSelectedTransactionId(txId);
                  setShowVerifyModal(true);
                }}
                onSetMessage={setMessage}
              />
            )}
            {showVerifyModal && (
              <VerifyWithdrawalModal transactionId={selectedTransactionId} onClose={() => setShowVerifyModal(false)} onSetMessage={setMessage} />
            )}
            {showTransferModal && (
              <TransferModal
                onClose={() => setShowTransferModal(false)}
                onSuccess={(txId?: string) => {
                  setShowTransferModal(false);
                  if (txId) setSelectedTransferId(txId);
                  setShowVerifyTransferModal(true);
                }}
                onSetMessage={setMessage}
              />
            )}
            {showVerifyTransferModal && (
              <VerifyTransferModal transactionId={selectedTransferId} onClose={() => setShowVerifyTransferModal(false)} onSetMessage={setMessage} />
            )}
          </div>
        </main>
      </div>

      {message && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 sm:p-8
            bg-white border border-slate-200 shadow-[8px_8px_20px_#c8cdd6,-8px_-8px_20px_#ffffff]
            dark:bg-slate-900/95 dark:border-white/10 dark:shadow-none dark:backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">Notice</h3>
              <button onClick={() => setMessage(null)} className="text-2xl font-bold text-slate-800 dark:text-white hover:text-slate-600">×</button>
            </div>
            <div className="mt-5">
              <p className={message.type === "error" ? "text-rose-500" : "text-cyan-600 dark:text-cyan-400"}>{message.text}</p>
            </div>
            <div className="mt-6">
              <button onClick={dismissMessage}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 font-semibold text-white
                  shadow-[4px_4px_12px_#0891b2,-2px_-2px_8px_#22d3ee] dark:shadow-none">
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
