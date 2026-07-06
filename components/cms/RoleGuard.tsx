"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/app/cms/RoleProvider";

type Role = "admin" | "editor" | "viewer";

const ROLE_HIERARCHY: Record<Role, number> = { viewer: 0, editor: 1, admin: 2 };

export default function RoleGuard({
  minRole = "viewer",
  children,
}: {
  minRole?: Role;
  children: React.ReactNode;
}) {
  const { user, loading } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/cms/login");
      return;
    }
    const userLevel = ROLE_HIERARCHY[user.role] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;
    if (userLevel < requiredLevel) {
      router.push("/cms/dashboard");
    }
  }, [user, loading, minRole, router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh] text-white/30">Loading...</div>;
  }

  if (!user) return null;
  const userLevel = ROLE_HIERARCHY[user.role] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;
  if (userLevel < requiredLevel) return null;

  return <>{children}</>;
}
