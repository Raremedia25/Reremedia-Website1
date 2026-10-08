"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  ExternalLink,
  FileText,
  FolderKanban,
  Images,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  MessageSquare,
  MessageSquareQuote,
  Settings,
  Tags,
  Users,
  X,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import type { CurrentUser } from "@/lib/auth/current-user";
import { ROLE_LABELS, type Permission, type Role } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
  badge?: number;
}

export function AdminShell({ user, permissions, badges, children }: { user: CurrentUser; permissions: Permission[]; badges: { notifications: number; messages: number; requests: number }; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const allItems: NavItem[] = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/projects", label: "Projects", icon: FolderKanban, permission: "projects:manage" },
    { href: "/admin/posts", label: "Posts", icon: FileText, permission: "posts:manage" },
    { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote, permission: "testimonials:manage" },
    { href: "/admin/media", label: "Images", icon: Images, permission: "media:manage" },
    { href: "/admin/services", label: "Services", icon: Layers, permission: "services:manage" },
    { href: "/admin/categories", label: "Categories", icon: Tags, permission: "categories:manage" },
    { href: "/admin/messages", label: "Messages", icon: MessageSquare, permission: "messages:manage", badge: badges.messages },
    { href: "/admin/requests", label: "Project Requests", icon: Inbox, permission: "requests:manage", badge: badges.requests },
    { href: "/admin/users", label: "Users", icon: Users, permission: "users:manage" },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3, permission: "analytics:view" },
    { href: "/admin/activity", label: "Activity log", icon: Activity, permission: "analytics:view" },
    { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings:manage" },
  ];
  const items = allItems.filter((i) => !i.permission || permissions.includes(i.permission));

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            isActive(item.href) ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white",
          )}
        >
          <item.icon className="h-4.5 w-4.5 shrink-0" />
          <span className="flex-1">{item.label}</span>
          {item.badge ? <span className="rounded-full bg-accent-500 px-2 py-0.5 text-[11px] font-bold text-white">{item.badge}</span> : null}
        </Link>
      ))}
    </nav>
  );

  const sidebarFooter = (
    <div className="border-t border-white/10 p-3 space-y-1">
      <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-300 hover:bg-white/5 hover:text-white">
        <ExternalLink className="h-4.5 w-4.5" /> View website
      </Link>
      <Link href="/admin/account" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-300 hover:bg-white/5 hover:text-white">
        <KeyRound className="h-4.5 w-4.5" /> My account
      </Link>
      <form action={logoutAction}>
        <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-300 hover:bg-white/5 hover:text-white">
          <LogOut className="h-4.5 w-4.5" /> Sign out
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-night-900 text-white sticky top-0 h-dvh">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-lg font-extrabold">R</span>
          <div>
            <p className="font-display font-bold leading-tight">Raremedia</p>
            <p className="text-[11px] text-ink-300">Admin dashboard</p>
          </div>
        </div>
        {nav}
        {sidebarFooter}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-night-950/70" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-night-900 text-white shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <span className="font-display font-bold">Raremedia Admin</span>
              <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
            {sidebarFooter}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-ink-200 bg-white/90 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink-100 lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-sm text-ink-500 hidden sm:block">
              Signed in as <span className="font-semibold text-ink-900">{user.name}</span> · {ROLE_LABELS[user.role as Role] ?? user.role}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/notifications" className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-ink-100" aria-label="Notifications">
              <Bell className="h-5 w-5 text-ink-700" />
              {badges.notifications > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">{badges.notifications}</span>}
            </Link>
            <Link href="/" target="_blank" className="btn btn-secondary btn-sm hidden sm:inline-flex">
              <ExternalLink className="h-4 w-4" /> Site
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
