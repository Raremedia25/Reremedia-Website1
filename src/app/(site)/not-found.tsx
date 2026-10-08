import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container-x text-center max-w-xl">
        <span className="font-display text-7xl font-extrabold gradient-text">404</span>
        <h1 className="font-display mt-4 text-2xl font-bold text-ink-900">We could not find that page</h1>
        <p className="mt-3 text-ink-500">The link may be outdated or the content may have been moved or unpublished.</p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <Link href="/search" className="btn btn-secondary">
            <Search className="h-4 w-4" /> Search the site
          </Link>
        </div>
      </div>
    </section>
  );
}
