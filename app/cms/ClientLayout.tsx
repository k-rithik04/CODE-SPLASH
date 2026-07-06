"use client";

import { usePathname } from "next/navigation";
import { RoleProvider } from "./RoleProvider";
import { SidebarProvider } from "@/components/cms/SidebarContext";
import Sidebar from "./Sidebar";
import GSAPWrapper from "@/components/cms/GSAPWrapper";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/cms/login" || pathname === "/cms/change-password" || pathname.startsWith("/cms/login/") || pathname.startsWith("/cms/change-password/");

  if (isAuthRoute) {
    return (
      <RoleProvider>
        <div className="min-h-screen bg-black text-white">
          {children}
        </div>
      </RoleProvider>
    );
  }

  return (
    <RoleProvider>
      <SidebarProvider>
        <div className="min-h-screen bg-black text-white">
          <Sidebar />
          <main className="ml-[72px] min-h-screen p-6 md:p-8">
            <GSAPWrapper>{children}</GSAPWrapper>
          </main>
        </div>
      </SidebarProvider>
    </RoleProvider>
  );
}
