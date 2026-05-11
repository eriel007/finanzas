"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface Account {
  id: string;
  name: string;
  balance: number;
  createdAt: string;
}

export default function ManageAccountsPage() {
  const { user, isHydrated, token } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const fetchAccounts = useCallback(async () => {
    if (!user || !token) return;
    try {
      const res = await fetch(`/api/accounts?userId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch {
      setError("Unable to load accounts");
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) { router.push("/login"); return; }
    Promise.resolve().then(() => fetchAccounts());
  }, [user, isHydrated, fetchAccounts, router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !user || !token) return;
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName.trim(), userId: user.id }),
      });
      if (!res.ok) throw new Error("Failed to create");
      setNewName("");
      await fetchAccounts();
    } catch {
      setError("Failed to create account");
    }
  };

  const handleRename = async (id: string) => {
    if (!editName.trim() || !token) return;
    try {
      const res = await fetch(`/api/accounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!res.ok) throw new Error("Failed to rename");
      setEditId(null);
      setEditName("");
      await fetchAccounts();
    } catch {
      setError("Failed to rename account");
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm("Delete this account? This will also delete all its transactions.")) return;
    try {
      const res = await fetch(`/api/accounts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchAccounts();
    } catch {
      setError("Failed to delete account");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608]">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-amber-500/8 via-transparent to-transparent blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
      }} />

      <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-12" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
        <div className="flex items-center gap-4 mb-8">
          <Link href="/account" className="w-10 h-10 rounded-xl border border-neutral-800/50 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center hover:border-amber-500/30 transition-colors">
            <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Manage Accounts</h1>
            <p className="text-sm text-neutral-500">Create, rename or delete your accounts</p>
          </div>
        </div>

        {/* Create form */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-500/10 to-amber-500/5 blur-xl" />
          <div className="relative rounded-2xl border border-neutral-800/50 bg-neutral-900/60 backdrop-blur-xl p-6 shadow-xl shadow-black/20">
            <form onSubmit={handleCreate} className="flex gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Account name"
                className="flex-1 rounded-xl border border-neutral-700/50 bg-neutral-800/50 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
              />
              <button
                type="submit"
                disabled={!newName.trim()}
                className="rounded-xl bg-amber-500/15 border border-amber-500/20 px-5 py-2.5 text-sm font-medium text-amber-400 hover:bg-amber-500/25 transition-all duration-300 disabled:opacity-50"
              >
                Add Account
              </button>
            </form>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Accounts list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-neutral-800/50 bg-neutral-900/40 p-4 animate-pulse">
                <div className="h-4 w-32 bg-neutral-800/50 rounded" />
              </div>
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-neutral-400">No accounts yet. Create one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="rounded-xl border border-neutral-800/50 bg-neutral-900/40 backdrop-blur-sm p-4 transition-all duration-300 hover:border-amber-500/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {editId === account.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 rounded-lg border border-amber-500/50 bg-neutral-800/50 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/20"
                          autoFocus
                        />
                        <button
                          onClick={() => handleRename(account.id)}
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditId(null); setEditName(""); }}
                          className="text-xs text-neutral-500 hover:text-neutral-400 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-white">{account.name}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Bs. {account.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                  </div>
                  {editId !== account.id && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditId(account.id); setEditName(account.name); }}
                        className="w-8 h-8 rounded-lg border border-neutral-700/50 bg-neutral-800/50 flex items-center justify-center hover:border-amber-500/30 transition-colors"
                        title="Rename"
                      >
                        <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="w-8 h-8 rounded-lg border border-neutral-700/50 bg-neutral-800/50 flex items-center justify-center hover:border-red-500/30 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
