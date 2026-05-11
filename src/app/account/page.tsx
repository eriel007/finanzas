"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface Account {
  id: string;
  name: string;
  balance: number;
  userId: string;
  createdAt: string;
}

export default function AccountPage() {
  const { user, isHydrated, logout, token } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const initAccount = async () => {
      try {
        const res = await fetch(`/api/accounts?userId=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch accounts");
        const data = await res.json();
        let accountsList = Array.isArray(data) ? data : [];

        if (accountsList.length === 0) {
          const createRes = await fetch("/api/accounts", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name: "Main", userId: user.id, balance: 0 }),
          });
          if (createRes.ok) {
            const newAccount = await createRes.json();
            accountsList = [newAccount];
          }
        }

        setAccounts(accountsList);

        const catsRes = await fetch(`/api/categories?userId=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (catsRes.ok) {
          const cats = await catsRes.json();
          const categoriesList = Array.isArray(cats) ? cats : [];

          if (categoriesList.length === 0) {
            const defaultCategories = [
              { name: "Salary", type: "INCOME" },
              { name: "Freelance", type: "INCOME" },
              { name: "Investments", type: "INCOME" },
              { name: "Other Income", type: "INCOME" },
              { name: "Food", type: "EXPENSE" },
              { name: "Transport", type: "EXPENSE" },
              { name: "Entertainment", type: "EXPENSE" },
              { name: "Health", type: "EXPENSE" },
              { name: "Education", type: "EXPENSE" },
              { name: "Other Expense", type: "EXPENSE" },
            ];

            const createdCategories: { id: string; name: string; type: string }[] = [];
            for (const cat of defaultCategories) {
              const catRes = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...cat, userId: user.id }),
              });
              if (catRes.ok) {
                createdCategories.push(await catRes.json());
              }
            }

            if (createdCategories.length > 0) {
              setAccounts((prev) => [...prev]);
            }
          }
        }
      } catch {
        setError("Unable to initialize accounts");
      } finally {
        setLoading(false);
      }
    };

    initAccount();
  }, [user, router, isHydrated]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] flex items-center justify-center">
      {/* Background effects */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-amber-500/8 via-transparent to-transparent blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-[-30%] right-[-10%] w-[800px] h-[800px] rounded-full bg-gradient-to-tl from-emerald-500/6 via-transparent to-transparent blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
      }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6 py-12" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Welcome back</p>
            <h2 className="text-lg font-semibold text-white">{user?.name || user?.email}</h2>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-neutral-500 hover:text-amber-400 transition-colors uppercase tracking-wider"
          >
            Logout
          </button>
        </div>

        {/* Balance card */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-amber-500/10 to-amber-500/5 blur-xl" />
          <div className="relative rounded-3xl border border-neutral-800/50 bg-neutral-900/60 backdrop-blur-xl p-8 shadow-2xl shadow-black/20">
            <p className="text-sm text-neutral-400 mb-2">Total Balance</p>
            {loading ? (
              <div className="h-10 w-48 bg-neutral-800/50 rounded-lg animate-pulse" />
            ) : error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : (
                <p className={`text-4xl font-bold tracking-tight ${totalBalance >= 0 ? 'text-white' : 'text-red-400'}`}>
                Bs. {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}
            {accounts.length > 0 && (
              <p className="text-xs text-neutral-500 mt-2">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link
            href="/account/income"
            className="group relative rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center transition-all duration-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-white">Ingresos</p>
            <p className="text-xs text-neutral-500 mt-1">View history</p>
          </Link>

          <Link
            href="/account/expense"
            className="group relative rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/10"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1V9a1 1 0 012 0v2.586l4.293-4.293a1 1 0 011.414 0L16 9.586V7a1 1 0 112 0v5a1 1 0 01-1 1h-5z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-white">Egresos</p>
            <p className="text-xs text-neutral-500 mt-1">View history</p>
          </Link>
        </div>

        {/* Accounts list */}
        {accounts.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-neutral-500 uppercase tracking-wider">Accounts</p>
            {accounts.map((account) => (
              <div
                key={account.id}
                className="rounded-xl border border-neutral-800/50 bg-neutral-900/40 backdrop-blur-sm p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-white">{account.name}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Created {new Date(account.createdAt).toLocaleDateString()}</p>
                </div>
                <p className={`text-sm font-semibold ${account.balance >= 0 ? 'text-white' : 'text-red-400'}`}>
                  Bs. {account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
          </div>
        )}

        {accounts.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-sm text-neutral-500">No accounts yet</p>
          </div>
        )}

        {/* Management links */}
        <div className="mt-8 flex gap-4">
          <Link
            href="/account/manage"
            className="flex-1 rounded-xl border border-neutral-800/50 bg-neutral-900/40 backdrop-blur-sm p-4 text-center transition-all duration-300 hover:border-amber-500/20 hover:bg-neutral-900/60"
          >
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Manage Accounts</p>
          </Link>
          <Link
            href="/account/categories"
            className="flex-1 rounded-xl border border-neutral-800/50 bg-neutral-900/40 backdrop-blur-sm p-4 text-center transition-all duration-300 hover:border-amber-500/20 hover:bg-neutral-900/60"
          >
            <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Manage Categories</p>
          </Link>
        </div>
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
