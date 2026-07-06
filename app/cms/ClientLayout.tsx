"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RoleProvider, useRole } from "./RoleProvider";
import { SidebarProvider, useSidebar } from "@/components/cms/SidebarContext";
import Sidebar from "./Sidebar";
import GSAPWrapper from "@/components/cms/GSAPWrapper";
import { cn } from "@/lib/utils";

type Role = "admin" | "editor" | "viewer";
const ROLE_HIERARCHY: Record<Role, number> = { viewer: 0, editor: 1, admin: 2 };

const ROUTE_ROLES: Record<string, Role> = {
  "/cms/settings/users": "admin",
  "/cms/audit": "admin",
  "/cms/content/chapters": "editor",
  "/cms/content/prizes": "editor",
  "/cms/content/timeline": "editor",
  "/cms/content/partners": "editor",
  "/cms/content/team": "editor",
  "/cms/content/faq": "editor",
  "/cms/settings": "editor",
  "/cms/settings/hero": "editor",
  "/cms/settings/cta": "editor",
  "/cms/settings/connect": "editor",
};

function getMinRole(pathname: string): Role {
  const exact = ROUTE_ROLES[pathname];
  if (exact) return exact;
  if (pathname.startsWith("/cms/settings/users")) return "admin";
  if (pathname.startsWith("/cms/audit")) return "admin";
  if (pathname.startsWith("/cms/content/")) return "editor";
  if (pathname.startsWith("/cms/settings/")) return "editor";
  return "viewer";
}

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRole();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/cms/login");
      return;
    }
    const minRole = getMinRole(pathname);
    const userLevel = ROLE_HIERARCHY[user.role] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;
    if (userLevel < requiredLevel) {
      router.push("/cms/dashboard");
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-white/30">Loading...</div>;
  }

  if (!user) return null;

  const minRole = getMinRole(pathname);
  const userLevel = ROLE_HIERARCHY[user.role] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;
  if (userLevel < requiredLevel) return null;

  return <>{children}</>;
}

function MainContent({ children }: { children: React.ReactNode }) {
  const { open } = useSidebar();
  return (
    <main className={cn("min-h-screen p-6 md:p-8 transition-all duration-300", open ? "ml-[260px]" : "ml-[72px]")}>
      <GSAPWrapper>{children}</GSAPWrapper>
    </main>
  );
}

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
        <RouteGuard>
          <div className="min-h-screen bg-black text-white">
            <Sidebar />
            <MainContent>{children}</MainContent>
          </div>
        </RouteGuard>
      </SidebarProvider>
    </RoleProvider>
  );
}
