import { requireRole } from "@/lib/auth-guard";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  await requireRole("admin");

  return (
    <div className="max-w-5xl mx-auto">
      <UsersClient />
    </div>
  );
}
