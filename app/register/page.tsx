"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [status, setStatus] = useState<"loading" | "open" | "closed">("loading");
  const [countdown, setCountdown] = useState(15);
  const [buttonText, setButtonText] = useState("Register");

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      try {
        const { data } = await supabase
          .from("cta_content")
          .select("is_active, button_text")
          .eq("id", 1)
          .maybeSingle();
        const row = data as { is_active: boolean; button_text: string } | null;
        setStatus(row?.is_active ? "open" : "closed");
        if (row?.button_text) setButtonText(row.button_text);
      } catch {
        setStatus("closed");
      }
    })();
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? (clearInterval(interval), 0) : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (countdown !== 0) return;
    window.location.href = "/";
  }, [countdown]);

  return (
    <div
      className="dark min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed text-white flex items-center justify-center"
      style={{
        backgroundImage: `url('https://gcymcwaocowoczvvsaxw.supabase.co/storage/v1/object/public/cms-images/assets/register-bg.gif')`,
      }}
    >
      <div className="container mx-auto max-w-2xl py-10 px-4 text-center">
        {status === "loading" ? (
          <div className="space-y-4">
            <div className="w-12 h-12 border-4 border-white/20 border-t-[#ff6b00] rounded-full animate-spin mx-auto" />
            <p className="text-lg text-gray-300">Checking registration status...</p>
          </div>
        ) : status === "open" ? (
          <div className="space-y-6 bg-black/70 backdrop-blur-md border border-neutral-800 rounded-2xl p-8 shadow-2xl">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-rebeca text-3xl md:text-4xl font-bold text-white">
              Registration is Open!
            </h1>
            <p className="text-lg text-gray-300">
              Head back to the site and hit the <span className="text-[#ff6b00] font-bold">{buttonText}</span> button to choose your track.
            </p>
            <p className="text-sm text-gray-400">
              Redirecting to home page in <span className="text-[#ff6b00] font-bold">{countdown}s</span>...
            </p>
          </div>
        ) : (
          <div className="space-y-6 bg-black/70 backdrop-blur-md border border-neutral-800 rounded-2xl p-8 shadow-2xl">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="font-rebeca text-3xl md:text-4xl font-bold text-white">
              Registration is Currently Closed
            </h1>
            <p className="text-lg text-gray-300">
              Registrations are not open at this time. Stay tuned for the next edition!
            </p>
            <p className="text-sm text-gray-400">
              Redirecting to home page in <span className="text-[#ff6b00] font-bold">{countdown}s</span>...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
