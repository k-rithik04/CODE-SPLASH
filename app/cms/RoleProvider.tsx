"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { SessionPayload } from "@/lib/auth-shared";

interface RoleContextValue {
  user: SessionPayload | null;
  loading: boolean;
  refresh: () => void;
}

const RoleContext = createContext<RoleContextValue>({
  user: null,
  loading: true,
  refresh: () => {},
});

export function useRole() {
  return useContext(RoleContext);
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(false);

  const fetchSession = async () => {
    try {
      const res = await fetch("/cms/api/session");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    fetchSession();
  }, []);

  return (
    <RoleContext.Provider value={{ user, loading, refresh: fetchSession }}>
      {children}
    </RoleContext.Provider>
  );
}
