"use client";

import Link from "next/link";
import { useRole } from "@/app/cms/RoleProvider";
import { useSidebar } from "@/components/cms/SidebarContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  const { user } = useRole();
  const { toggleSidebar } = useSidebar();
  const headerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      ".header-anim",
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" }
    );
  }, { scope: headerRef });

  return (
    <div ref={headerRef} className={cn("mb-8", className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="header-anim flex items-center gap-2 text-sm text-white/40 mb-4 font-medium tracking-wide">
          <Link href="/admin/dashboard" className="hover:text-white transition-colors">
            CMS
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-white/20">/</span>
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-white transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-white/80 font-semibold">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="md:hidden text-white/70 hover:text-white shrink-0 mt-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
          <h1 className="header-anim text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60 drop-shadow-sm">
            {title}
          </h1>
          {description && (
            <p className="header-anim text-sm text-white/50 mt-1.5 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        </div>
        <div className="header-anim flex items-center gap-3 shrink-0">
          {user && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] uppercase tracking-widest px-2.5 py-1 font-bold shadow-sm backdrop-blur-md",
                user.role === "admin" && "border-orange/50 text-orange bg-orange/10 shadow-[inset_0_0_8px_rgba(255,107,0,0.1)]",
                user.role === "editor" && "border-blue-500/50 text-blue-400 bg-blue-500/10 shadow-[inset_0_0_8px_rgba(59,130,246,0.1)]",
                user.role === "viewer" && "border-green-500/50 text-green-400 bg-green-500/10 shadow-[inset_0_0_8px_rgba(34,197,94,0.1)]"
              )}
            >
              {user.role}
            </Badge>
          )}
          {actions}
        </div>
      </div>

      <div className="header-anim h-[1px] w-full mt-6 bg-gradient-to-r from-white/20 via-white/10 to-transparent" />
    </div>
  );
}
