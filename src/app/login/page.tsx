"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { loginSchema, type LoginInput } from "@/modules/auth/auth.schema";
import type { AuthResponse } from "@/modules/auth/auth.types";

export default function LoginPage() {
  const { setUser, setToken } = useAuth();
  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginInput>>({});
  const [apiError, setApiError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setApiError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError("");

    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<LoginInput> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginInput;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setApiError(data.error || "Invalid credentials");
        } else if (response.status === 400) {
          setApiError("Invalid input. Please check your fields.");
        } else {
          setApiError(data.error || "An error occurred during login");
        }
        return;
      }

      const authData = data as AuthResponse;
      setUser(authData.user);
      setToken(authData.token);
      window.location.href = "/account";
    } catch {
      setApiError("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060608] flex items-center">
      {/* Background noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Animated gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-amber-500/8 via-transparent to-transparent blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-[-30%] right-[-10%] w-[800px] h-[800px] rounded-full bg-gradient-to-tl from-emerald-500/6 via-transparent to-transparent blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full bg-gradient-to-r from-amber-400/5 via-amber-300/3 to-transparent blur-2xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />

      {/* Geometric grid lines */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
      }} />

      {/* Diagonal accent line */}
      <div className="absolute top-0 right-[35%] w-px h-full bg-gradient-to-b from-transparent via-amber-500/20 to-transparent" />

      {/* Content container */}
      <div className="relative z-10 w-full px-6 flex items-center justify-center py-12">

        {/* Login form */}
        <div className="w-full max-w-md" style={{ animation: 'fadeInUp 0.8s ease-out 0.2s both' }}>
          <div className="relative">
            {/* Card background with border gradient effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-neutral-800/50 to-neutral-900/30 blur-xl" />
            <div className="relative rounded-3xl border border-neutral-800/50 bg-neutral-900/60 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-black/20">
              
              {/* Form header */}
              <div className="space-y-2 mb-8">
                <h2 className="text-2xl font-semibold text-white tracking-tight">Welcome back</h2>
                <p className="text-sm text-neutral-400">Enter your credentials to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Email field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium uppercase tracking-wider text-neutral-400"
                  >
                    Email
                  </label>
                  <div className="relative group">
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-400/20 transition-opacity duration-300 ${focusedField === 'email' ? 'opacity-100' : 'opacity-0'}`} />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className="relative w-full rounded-xl border border-neutral-700/50 bg-neutral-800/50 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
                      placeholder="you@example.com"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-400 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium uppercase tracking-wider text-neutral-400"
                  >
                    Password
                  </label>
                  <div className="relative group">
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-400/20 transition-opacity duration-300 ${focusedField === 'password' ? 'opacity-100' : 'opacity-0'}`} />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className="relative w-full rounded-xl border border-neutral-700/50 bg-neutral-800/50 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
                      placeholder="Enter your password"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-400 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* API Error */}
                {apiError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                    <p className="text-sm text-red-400 flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {apiError}
                    </p>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-3.5 text-sm font-semibold text-[#060608] shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-amber-500/30 hover:from-amber-400 hover:to-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-neutral-800" />
                <span className="text-xs text-neutral-500 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-neutral-800" />
              </div>

              {/* Register link */}
              <p className="text-center text-sm text-neutral-400">
                Don&apos;t have an account?{' '}
                <a href="/register" className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
                  Create one now
                </a>
              </p>
            </div>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 mt-6 text-neutral-500">
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Secured with end-to-end encryption</span>
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
