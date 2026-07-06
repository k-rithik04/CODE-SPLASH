"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface SidebarContextValue {
  open: boolean;
  hovered: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  setHovered: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  open: false,
  hovered: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
  setHovered: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const toggleSidebar = useCallback(() => setOpen((o) => !o), []);
  const closeSidebar = useCallback(() => setOpen(false), []);

  return (
    <SidebarContext.Provider value={{ open, hovered, toggleSidebar, closeSidebar, setHovered }}>
      {children}
    </SidebarContext.Provider>
  );
}
