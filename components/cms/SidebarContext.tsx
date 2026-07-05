"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface SidebarContextValue {
  open: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  open: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggleSidebar = useCallback(() => setOpen((o) => !o), []);
  const closeSidebar = useCallback(() => setOpen(false), []);

  return (
    <SidebarContext.Provider value={{ open, toggleSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}
