"use client";

import { useEffect } from "react";

const SESSION_KEY = "cms_session";

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.clear();
  } catch {}
  window.location.replace("/cms/login");
}

export default function LogoutPage() {
  useEffect(() => {
    clearSession();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <script
        dangerouslySetInnerHTML={{
          __html: `try{localStorage.removeItem("${SESSION_KEY}");sessionStorage.clear();}catch(e){}window.location.replace("/cms/login");`,
        }}
      />
      <div className="flex flex-col items-center gap-4">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-sm text-white/40">Signing out...</p>
      </div>
    </div>
  );
}
