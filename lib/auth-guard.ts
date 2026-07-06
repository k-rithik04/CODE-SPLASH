import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";

type Role = "admin" | "editor" | "viewer";

const ROLE_HIERARCHY: Record<Role, number> = { viewer: 0, editor: 1, admin: 2 };

export async function requireRole(minRole: Role = "viewer") {
  const session = await getSessionFromCookies();
  if (!session) redirect("/cms/login");
  const userLevel = ROLE_HIERARCHY[session.role] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;
  if (userLevel < requiredLevel) redirect("/cms/dashboard");
  return session;
}
