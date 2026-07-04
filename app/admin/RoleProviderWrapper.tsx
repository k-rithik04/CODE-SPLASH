"use client";

import { createContext, useContext, useState } from "react";

interface User {
  id: string;
  username: string;
  role: "admin" | "editor" | "viewer";
  full_name: string | null;
}

interface RoleContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  canEdit: boolean;
  refresh: () => void;
}

const RoleContext = createContext<RoleContextValue>({
  user: null,
  loading: false,
  isAdmin: false,
  isEditor: false,
  canEdit: false,
  refresh: () => {},
});

export function useRole() {
  return useContext(RoleContext);
}

export function RoleProviderWrapper({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const [, setTick] = useState(0);

  const refresh = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        setTick((t) => t + 1);
      }
    } catch {
      // ignore
    }
  };

  return (
    <RoleContext.Provider
      value={{
        user,
        loading: false,
        isAdmin: user.role === "admin",
        isEditor: user.role === "editor" || user.role === "admin",
        canEdit: user.role === "editor" || user.role === "admin",
        refresh,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}
