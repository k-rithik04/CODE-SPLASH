"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/components/cms/SidebarContext";
import { useRole } from "@/app/cms/RoleProvider";
import { cn } from "@/lib/utils";

type Role = "admin" | "editor" | "viewer";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  minRole?: Role;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Content",
    items: [
      { label: "Chapters", href: "/cms/content/chapters", icon: "M4 6h16M4 12h16M4 18h7", minRole: "editor" },
      { label: "Prizes", href: "/cms/content/prizes", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", minRole: "editor" },
      { label: "Timeline", href: "/cms/content/timeline", icon: "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z", minRole: "editor" },
      { label: "Partners", href: "/cms/content/partners", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75", minRole: "editor" },
      { label: "Team", href: "/cms/content/team", icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z", minRole: "editor" },
      { label: "FAQ", href: "/cms/content/faq", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM9 9h.01M15 9h.01M9.5 15a3.5 3.5 0 015 0", minRole: "editor" },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Site Settings", href: "/cms/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", minRole: "editor" },
      { label: "Hero Section", href: "/cms/settings/hero", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4", minRole: "editor" },
      { label: "CTA Section", href: "/cms/settings/cta", icon: "M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5", minRole: "editor" },
      { label: "Footer / Connect", href: "/cms/settings/connect", icon: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9", minRole: "editor" },
      { label: "User Management", href: "/cms/settings/users", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75", minRole: "admin" },
    ],
  },
  {
    label: "Data",
    items: [
      { label: "Registrations", href: "/cms/registrations", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
      { label: "Audit Log", href: "/cms/audit", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", minRole: "admin" },
    ],
  },
];

const ROLE_HIERARCHY: Record<Role, number> = { viewer: 0, editor: 1, admin: 2 };

function canAccess(userRole: Role, minRole?: Role): boolean {
  if (!minRole) return true;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole];
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { open, hovered, setHovered } = useSidebar();
  const expanded = open || hovered;
  const { user } = useRole();
  const role = (user?.role ?? "viewer") as Role;

  const handleLogout = async () => {
    await fetch("/cms/api/logout", { method: "POST" });
    router.push("/cms/login");
  };

  return (
    <aside
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "fixed top-0 left-0 h-full z-50 flex flex-col border-r border-white/[0.06] bg-black/80 backdrop-blur-2xl transition-all duration-300",
        expanded ? "w-[260px] translate-x-0" : "w-[72px] -translate-x-full md:translate-x-0"
      )}
    >
      <div className="h-16 flex items-center px-5 border-b border-white/[0.06]">
        <Link href="/cms/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-orange/10 border border-orange/30 flex items-center justify-center shrink-0">
            <span className="text-orange font-bold text-sm">CS</span>
          </div>
          <span className={cn(
            "text-sm font-semibold text-white whitespace-nowrap transition-opacity duration-300",
            expanded ? "opacity-100" : "opacity-0"
          )}>
            CodeSplash <span className="text-orange">CMS</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-none">
        <Link
          href="/cms/dashboard"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
            pathname === "/cms/dashboard"
              ? "bg-orange/10 text-orange border border-orange/20"
              : "text-white/50 hover:text-white hover:bg-white/5"
          )}
        >
          <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
          </svg>
          <span className={cn(
            "transition-opacity duration-300 whitespace-nowrap",
            expanded ? "opacity-100" : "opacity-0"
          )}>Dashboard</span>
        </Link>

        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => canAccess(role, item.minRole));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label}>
              <div className={cn(
                "px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/25 transition-opacity duration-300 whitespace-nowrap overflow-hidden",
                expanded ? "opacity-100" : "opacity-0"
              )}>
                {group.label}
              </div>
              <div className="space-y-0.5">
                {visibleItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                      pathname === item.href
                        ? "bg-orange/10 text-orange border border-orange/20"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <span className={cn(
                      "transition-opacity duration-300 whitespace-nowrap",
                      expanded ? "opacity-100" : "opacity-0"
                    )}>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        {user && (
          <div className={cn(
            "px-3 mb-2 transition-opacity duration-300 overflow-hidden",
            expanded ? "opacity-100" : "opacity-0"
          )}>
            <div className="text-xs text-white/40 truncate">{user.username}</div>
            <div className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              user.role === "admin" && "text-orange",
              user.role === "editor" && "text-blue-400",
              user.role === "viewer" && "text-green-400"
            )}>
              {user.role}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className={cn(
            "transition-opacity duration-300 whitespace-nowrap",
            expanded ? "opacity-100" : "opacity-0"
          )}>Logout</span>
        </button>
      </div>
    </aside>
  );
}
