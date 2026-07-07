"use client";

import { useEffect } from "react";

export function SWRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // Auto-update when new SW available
          reg.addEventListener("updatefound", () => {});
        })
        .catch(() => {});
    }
  }, []);

  return null;
}
