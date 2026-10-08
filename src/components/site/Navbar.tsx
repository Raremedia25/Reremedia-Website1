"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, Search, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

export function Navbar({ announcement }: { announcement?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50">
      {announcement ? (
        <div className="gradient-brand text-white text-center text-sm font-medium px-4 py-2">{announcement}</div>
      ) : null}
      <div
        className={cn(
          "transition-all duration-300 border-b",
          scrolled || open ? "bg-white/90 backdrop-blur-md border-ink-200 shadow-sm" : "bg-white/70 backdrop-blur border-transparent",
        )}
      >
        <div className="container-x flex h-[72px] items-center justify-between gap-4">
          <Logo />

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-full text-sm font-medium transition-colors",
                  isActive(link.href) ? "text-brand-700 bg-brand-50" : "text-ink-700 hover:text-ink-900 hover:bg-ink-100",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <Link href="/search" className="grid h-10 w-10 place-items-center rounded-full text-ink-700 hover:bg-ink-100" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
            <Link href="/request-project" className="btn btn-primary btn-sm">
              Get Your System Built <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex lg:hidden items-center gap-1">
            <Link href="/search" className="grid h-10 w-10 place-items-center rounded-full text-ink-700 hover:bg-ink-100" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full text-ink-900 hover:bg-ink-100"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          className={cn(
            "lg:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out border-t border-ink-100",
            open ? "max-h-[85vh] opacity-100 overflow-y-auto" : "max-h-0 opacity-0 border-transparent",
          )}
        >
          <nav className="container-x py-4 flex flex-col gap-1" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-3 rounded-xl text-base font-medium",
                  isActive(link.href) ? "text-brand-700 bg-brand-50" : "text-ink-800 hover:bg-ink-100",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/request-project" className="px-4 py-3 rounded-xl text-base font-medium text-ink-800 hover:bg-ink-100">
              Request a Project
            </Link>
            <Link href="/request-project" className="btn btn-primary mt-3 w-full">
              Get Your System Built <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
