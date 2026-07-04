"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useRole } from "@/app/admin/RoleProviderWrapper";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type Role = "admin" | "editor" | "viewer";

const NAV_ITEMS: { label: string; href: string; icon: string; roles: Role[] }[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "📊", roles: ["admin", "editor", "viewer"] },
  { label: "Database", href: "/admin/content/database", icon: "🗄️", roles: ["admin", "editor", "viewer"] },
  { label: "Hero", href: "/admin/content/hero", icon: "🏠", roles: ["admin", "editor"] },
  { label: "Chapters", href: "/admin/content/chapters", icon: "📖", roles: ["admin", "editor"] },
  { label: "Prizes", href: "/admin/content/prizes", icon: "🏆", roles: ["admin", "editor"] },
  { label: "Timeline", href: "/admin/content/timeline", icon: "📅", roles: ["admin", "editor"] },
  { label: "Partners", href: "/admin/content/partners", icon: "🤝", roles: ["admin", "editor"] },
  { label: "Team", href: "/admin/content/team", icon: "👥", roles: ["admin", "editor"] },
  { label: "FAQ", href: "/admin/content/faq", icon: "❓", roles: ["admin", "editor"] },
  { label: "CTA", href: "/admin/content/cta", icon: "🎯", roles: ["admin", "editor"] },
  { label: "Connect", href: "/admin/content/connect", icon: "📧", roles: ["admin", "editor"] },
  { label: "Users", href: "/admin/content/users", icon: "👤", roles: ["admin"] },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useRole();
  const sidebarRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      ".nav-item",
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.05, ease: "power2.out", delay: 0.1 }
    );
  }, { scope: sidebarRef });

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside 
      ref={sidebarRef} 
      className="fixed left-0 top-0 w-[260px] h-screen bg-black/60 backdrop-blur-2xl border-r border-white/5 flex flex-col z-50 shadow-[4px_0_24px_rgba(0,0,0,0.5)] overflow-hidden"
    >
      <div className="p-6 border-b border-white/5">
        <Link href="/admin/dashboard" className="text-xl font-bold tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange to-orange-glow">CodeSplash</span> CMS
        </Link>
      </div>

      <nav className="flex-1 overflow-hidden py-6 px-4">
        {NAV_ITEMS.map((item) => {
          if (!item.roles.includes((user?.role as Role) || "viewer")) return null;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "nav-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 mb-1.5 relative group overflow-hidden",
                isActive
                  ? "bg-orange/10 text-orange font-medium shadow-[inset_0_0_12px_rgba(255,107,0,0.1)] border border-orange/20"
                  : "text-white/50 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              {/* Active subtle glow indicator on the left */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-orange rounded-r-full shadow-[0_0_8px_#ff6b00]" />
              )}
              
              <span className={cn(
                "text-lg transition-transform duration-300",
                isActive ? "scale-110" : "group-hover:scale-110"
              )}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 shrink-0">
            <span className="text-xs font-bold text-white/80">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-white/90 truncate">{user?.username}</span>
            <span className="text-[10px] text-orange/80 uppercase font-semibold tracking-wider">
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2.5 text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 text-left flex items-center gap-2 border border-transparent hover:border-red-500/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
