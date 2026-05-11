"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface Account {
  id: string;
  name: string;
  balance: number;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

export default function NewIncomePage() {
  const { user, isHydrated, token } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const initData = async () => {
      try {
        const [accountsRes, categoriesRes] = await Promise.all([
          fetch(`/api/accounts?userId=${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/categories?userId=${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        let accs: Account[] = [];
        let cats: Category[] = [];

        if (accountsRes.ok) {
          accs = await accountsRes.json();
          accs = Array.isArray(accs) ? accs : [];
        }

        if (categoriesRes.ok) {
          cats = await categoriesRes.json();
          cats = Array.isArray(cats) ? cats : [];
        }

        if (accs.length === 0) {
          const createRes = await fetch("/api/accounts", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name: "Main", userId: user.id, balance: 0 }),
          });
          if (createRes.ok) {
            const newAcc = await createRes.json();
            accs = [newAcc];
          }
        }

        const existingCats = cats.filter((c) => c.type === "INCOME");
        if (existingCats.length === 0) {
          const defaultIncomeCategories = [
            { name: "Salary", type: "INCOME" },
            { name: "Freelance", type: "INCOME" },
            { name: "Investments", type: "INCOME" },
            { name: "Other Income", type: "INCOME" },
          ];

          const createdCats: Category[] = [];
          for (const cat of defaultIncomeCategories) {
            const catRes = await fetch("/api/categories", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ ...cat, userId: user.id }),
            });
            if (catRes.ok) {
              createdCats.push(await catRes.json());
            }
          }

          if (createdCats.length > 0) {
            cats = [...cats, ...createdCats];
          }
        }

        setAccounts(accs);
        setCategories(cats.filter((c) => c.type === "INCOME"));

        if (accs.length === 1) setAccountId(accs[0].id);
        const incomeCats = cats.filter((c) => c.type === "INCOME");
        if (incomeCats.length > 0) setCategoryId(incomeCats[0].id);
      } catch {
        setError("Unable to load data");
      }
    };

    initData();
  }, [user, router, isHydrated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!amount || !accountId || !categoryId) {
      setError("Please fill in all required fields");
      return;
    }

    if (!user) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          amount: parseFloat(amount),
          type: "INCOME",
          description: description || undefined,
          userId: user.id,
          accountId,
          categoryId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create transaction");
      }

      setSuccess(true);
      setTimeout(() => router.push("/account/income"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] flex items-center justify-center">
      {/* Background effects */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-emerald-500/8 via-transparent to-transparent blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
      }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6 py-12" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/account/income"
            className="w-10 h-10 rounded-xl border border-neutral-800/50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center hover:border-emerald-500/30 transition-colors"
          >
            <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">New Income</h1>
            <p className="text-sm text-neutral-500">Register a new income transaction</p>
          </div>
        </div>

        {/* Form card */}
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-emerald-500/10 to-emerald-500/5 blur-xl" />
          <div className="relative rounded-3xl border border-neutral-800/50 bg-neutral-900/60 backdrop-blur-xl p-8 shadow-2xl shadow-black/20">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Amount */}
              <div className="space-y-2">
                <label htmlFor="amount" className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Amount (Bs.)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 text-sm font-medium">Bs.</span>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-xl border border-neutral-700/50 bg-neutral-800/50 pl-12 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Description
                </label>
                <input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700/50 bg-neutral-800/50 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300"
                  placeholder="e.g. Salary, Freelance, etc."
                />
              </div>

              {/* Account */}
              <div className="space-y-2">
                <label htmlFor="account" className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Account
                </label>
                <select
                  id="account"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700/50 bg-neutral-800/50 px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300 appearance-none"
                  required
                >
                  <option value="" className="bg-neutral-900">Select account</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id} className="bg-neutral-900">{acc.name}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="block text-xs font-medium uppercase tracking-wider text-neutral-400">
                  Category
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-neutral-700/50 bg-neutral-800/50 px-4 py-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300 appearance-none"
                  required
                >
                  <option value="" className="bg-neutral-900">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-neutral-900">{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <p className="text-sm text-emerald-400">Income registered successfully!</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || success}
                className="group relative w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-6 py-3.5 text-sm font-semibold text-[#060608] shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Register Income"
                )}
              </button>
            </form>
          </div>
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
