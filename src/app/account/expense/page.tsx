"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface Transaction {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  description: string | null;
  userId: string;
  accountId: string;
  categoryId: string;
  createdAt: string;
  account: { name: string };
  category: { name: string };
}

export default function ExpensePage() {
  const { user, isHydrated, token } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!user || !token) return;
    try {
      const res = await fetch(`/api/transactions?userId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = await res.json();
      const expenseTransactions = (Array.isArray(data) ? data : []).filter(
        (t: Transaction) => t.type === "EXPENSE"
      );
      setTransactions(expenseTransactions);
    } catch {
      setError("Unable to load transactions");
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.push("/login");
      return;
    }

    Promise.resolve().then(() => fetchTransactions());
  }, [user, router, isHydrated, fetchTransactions]);

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Delete this transaction?")) return;
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchTransactions();
    } catch {
      setError("Failed to delete transaction");
    }
  };

  const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608]">
      {/* Background effects */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-red-500/8 via-transparent to-transparent blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
      }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-12" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/account"
              className="w-10 h-10 rounded-xl border border-neutral-800/50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center hover:border-red-500/30 transition-colors"
            >
              <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">Expense History</h1>
              <p className="text-sm text-neutral-500">All your expense transactions</p>
            </div>
          </div>
          <Link
            href="/account/expense/new"
            className="flex items-center gap-2 rounded-xl bg-red-500/15 border border-red-500/20 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/25 transition-all duration-300"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New
          </Link>
        </div>

        {/* Summary card */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-red-500/10 to-red-500/5 blur-xl" />
          <div className="relative rounded-2xl border border-red-500/20 bg-neutral-900/60 backdrop-blur-xl p-6 shadow-xl shadow-black/20">
            <p className="text-sm text-neutral-400 mb-1">Total Expenses</p>
            {loading ? (
              <div className="h-8 w-36 bg-neutral-800/50 rounded-lg animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-red-400">
                Bs. {totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
            <p className="text-xs text-neutral-500 mt-2">{transactions.length} transaction{transactions.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Transactions list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-neutral-800/50 bg-neutral-900/40 p-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-neutral-800/50 rounded" />
                    <div className="h-3 w-24 bg-neutral-800/30 rounded" />
                  </div>
                  <div className="h-5 w-20 bg-neutral-800/50 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500/50" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1V9a1 1 0 012 0v2.586l4.293-4.293a1 1 0 011.414 0L16 9.586V7a1 1 0 112 0v5a1 1 0 01-1 1h-5z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-neutral-400">No expense transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="rounded-xl border border-neutral-800/50 bg-neutral-900/40 backdrop-blur-sm p-4 transition-all duration-300 hover:border-red-500/20 hover:bg-red-500/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1V9a1 1 0 012 0v2.586l4.293-4.293a1 1 0 011.414 0L16 9.586V7a1 1 0 112 0v5a1 1 0 01-1 1h-5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {transaction.description || "Expense"}
                      </p>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {transaction.category?.name} &middot; {transaction.account?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-400">
                        -Bs. {transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-neutral-600 mt-0.5">
                        {new Date(transaction.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/account/expense/edit/${transaction.id}`}
                        className="w-7 h-7 rounded-lg border border-neutral-700/50 bg-neutral-800/50 flex items-center justify-center hover:border-red-500/30 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-3 h-3 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="w-7 h-7 rounded-lg border border-neutral-700/50 bg-neutral-800/50 flex items-center justify-center hover:border-red-500/30 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-3 h-3 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
