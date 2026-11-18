import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/site/Logo";

/**
 * The interactive demos run entirely in the browser on sample data, so this
 * layout deliberately reads nothing from the database: the pages stay fast
 * and keep working even when the CMS database is unavailable.
 */
export default function DemosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/90 backdrop-blur-md">
        <div className="container-x flex h-16 items-center justify-between gap-3">
          <Logo />
          <nav className="flex items-center gap-1 text-sm font-medium" aria-label="Demo navigation">
            <Link href="/demos" className="hidden rounded-full px-3 py-2 text-ink-700 hover:bg-ink-100 sm:block">
              All demos
            </Link>
            <Link href="/projects" className="rounded-full px-3 py-2 text-ink-700 hover:bg-ink-100">
              Projects
            </Link>
            <Link href="/request-project" className="btn btn-primary btn-sm">
              <span className="hidden sm:inline">Request a system</span>
              <span className="sm:hidden">Request</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-ink-50">{children}</main>
      <footer className="border-t border-ink-200 bg-white">
        <div className="container-x flex flex-col gap-2 py-6 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Demonstrations use sample data only and are not connected to any customer or production system.</p>
          <Link href="/" className="font-semibold text-brand-700 hover:underline">
            Back to the Raremedia website
          </Link>
        </div>
      </footer>
    </>
  );
}
