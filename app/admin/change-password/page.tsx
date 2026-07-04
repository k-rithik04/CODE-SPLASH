"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { STORAGE_BASE_URL } from "@/lib/utils";

const LockIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcons = ({ show }: { show: boolean }) => show ? (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" />
  </svg>
) : (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user?.full_name) setUsername(d.user.full_name);
        else if (d.user?.username) setUsername(d.user.username);
      })
      .catch(() => {});
  }, []);

  const passwordStrength = (pw: string): { label: string; color: string; width: string } => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "w-1/5" };
    if (score <= 2) return { label: "Fair", color: "bg-orange", width: "w-2/5" };
    if (score <= 3) return { label: "Good", color: "bg-yellow-500", width: "w-3/5" };
    if (score <= 4) return { label: "Strong", color: "bg-green-500", width: "w-4/5" };
    return { label: "Very Strong", color: "bg-emerald-400", width: "w-full" };
  };

  const strength = passwordStrength(newPassword);
  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from your current password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to change password.");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-black">
      {/* Background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-orange/5 rounded-full blur-[160px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-orange/3 rounded-full blur-[140px] animate-pulse pointer-events-none" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.01] rounded-full blur-[200px] pointer-events-none" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="w-full max-w-[400px] relative z-10">
        {/* Glow behind */}
        <div className="absolute -inset-2 bg-gradient-to-b from-orange/8 via-transparent to-transparent rounded-3xl blur-2xl opacity-60 pointer-events-none" />

        {/* Single glass container — logo + form */}
        <div className="relative bg-[#080808]/90 border border-white/[0.06] rounded-3xl p-8 shadow-2xl shadow-black/60" style={{ WebkitBackdropFilter: "blur(48px)", backdropFilter: "blur(48px)" }}>
          {/* Top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-orange/50 to-transparent" />

          {/* Logo inside the glass */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={`${STORAGE_BASE_URL}/assets/CodeSplash.webp`}
              alt="CodeSplash"
              className="h-10 w-auto mb-3"
            />
            <h2 className="text-lg font-bold text-white">
              Welcome, <span className="text-orange">{username || "User"}</span>
            </h2>
            <p className="text-white/30 text-xs mt-1">Set a new password to continue</p>
          </div>

          {/* Warning banner */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-orange/5 border border-orange/20 mb-5">
            <svg className="w-4 h-4 text-orange mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" /><path d="M12 17h.01" />
            </svg>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Your account was created with a temporary password. Please set a new secure password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-sm flex items-center gap-2.5">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
                </svg>
                {error}
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-2">
              <label htmlFor="cp-current" className="text-[11px] font-medium text-white/40 uppercase tracking-[0.15em]">Current Password</label>
              <div className="relative group">
                <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-orange/60 transition-colors" />
                <input
                  id="cp-current"
                  name="current_password"
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full h-12 pl-11 pr-12 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-orange/30 focus:bg-white/[0.05] transition-all duration-300"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors" tabIndex={-1}>
                  <EyeIcons show={showCurrent} />
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="cp-new" className="text-[11px] font-medium text-white/40 uppercase tracking-[0.15em]">New Password</label>
              <div className="relative group">
                <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-orange/60 transition-colors" />
                <input
                  id="cp-new"
                  name="new_password"
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full h-12 pl-11 pr-12 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder:text-white/15 focus:outline-none focus:border-orange/30 focus:bg-white/[0.05] transition-all duration-300"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors" tabIndex={-1}>
                  <EyeIcons show={showNew} />
                </button>
              </div>
              {newPassword.length > 0 && (
                <div className="space-y-1">
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} rounded-full transition-all duration-300 ${strength.width}`} />
                  </div>
                  <p className="text-[10px] text-white/30">{strength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="cp-confirm" className="text-[11px] font-medium text-white/40 uppercase tracking-[0.15em]">Confirm New Password</label>
              <div className="relative group">
                <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-orange/60 transition-colors" />
                <input
                  id="cp-confirm"
                  name="confirm_password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full h-12 pl-11 pr-12 bg-white/[0.03] border rounded-xl text-white text-sm placeholder:text-white/15 focus:outline-none transition-all duration-300 ${
                    passwordsMatch
                      ? "border-green-500/50 focus:ring-1 focus:ring-green-500/20"
                      : passwordsMismatch
                      ? "border-red-500/50 focus:ring-1 focus:ring-red-500/20"
                      : "border-white/[0.06] focus:border-orange/30 focus:bg-white/[0.05]"
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors" tabIndex={-1}>
                  <EyeIcons show={showConfirm} />
                </button>
              </div>
              {passwordsMatch && (
                <p className="text-[10px] text-green-400 flex items-center gap-1">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  Passwords match
                </p>
              )}
              {passwordsMismatch && (
                <p className="text-[10px] text-red-400">Passwords do not match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="w-full h-12 bg-gradient-to-r from-orange to-[#ff8533] hover:from-[#ff8533] hover:to-orange disabled:from-white/10 disabled:to-white/10 disabled:text-white/30 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-orange/10 hover:shadow-orange/20 disabled:shadow-none mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Update Password
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/15 text-[11px] mt-6 tracking-wide">
          CodeSplash CMS — Secured Access
        </p>
      </div>
    </div>
  );
}
