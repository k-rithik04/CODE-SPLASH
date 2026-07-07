"use client";

import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/cms/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid username or password.");
        setShakeError(true);
        setTimeout(() => setShakeError(false), 400);
        setLoading(false);
        return;
      }

      if (data.user.must_change_password) {
        window.location.href = "/cms/change-password";
      } else {
        window.location.href = "/cms/dashboard";
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-black">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-orange/5 rounded-full blur-[160px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-orange/3 rounded-full blur-[140px] animate-pulse pointer-events-none" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.01] rounded-full blur-[200px] pointer-events-none" />

      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="w-full max-w-[400px] relative z-10">
        <div className="absolute -inset-2 bg-gradient-to-b from-orange/8 via-transparent to-transparent rounded-3xl blur-2xl opacity-60 pointer-events-none" />

        <div className="relative bg-[#080808]/90 border border-white/[0.06] rounded-3xl p-6 md:p-8 shadow-2xl shadow-black/60" style={{ WebkitBackdropFilter: "blur(48px)", backdropFilter: "blur(48px)" }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-orange/50 to-transparent" />

          <div className="flex flex-col items-center mb-8">
            <Image
              src="/CodeSplash.png"
              alt="CodeSplash"
              width={160}
              height={40}
              unoptimized
              className="h-10 w-auto mb-4"
            />
            <div className="flex items-center gap-2">
              <div className="h-px w-6 bg-white/10" />
              <span className="text-white/25 text-[10px] uppercase tracking-[0.2em] font-medium">Admin Portal</span>
              <div className="h-px w-6 bg-white/10" />
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div
                className={`p-3 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-sm flex items-center gap-2.5 ${
                  shakeError ? "animate-[shake_0.3s_ease-in-out]" : ""
                }`}
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" /><path d="M12 17h.01" />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="login-username" className="text-[11px] font-medium text-white/40 uppercase tracking-[0.15em]">Username</label>
              <div className="relative group">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-orange/60 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  className="w-full h-12 pl-11 pr-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-orange/30 focus:bg-white/[0.05] transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="text-[11px] font-medium text-white/40 uppercase tracking-[0.15em]">Password</label>
              <div className="relative group">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-orange/60 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 pl-11 pr-12 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-orange/30 focus:bg-white/[0.05] transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full h-12 bg-gradient-to-r from-orange to-[#ff8533] hover:from-[#ff8533] hover:to-orange disabled:from-white/10 disabled:to-white/10 disabled:text-white/30 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-orange/10 hover:shadow-orange/20 disabled:shadow-none mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/15 text-[11px] mt-6 tracking-wide">
          CodeSplash 2026 — Organized by CSSA, University of Kelaniya
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
