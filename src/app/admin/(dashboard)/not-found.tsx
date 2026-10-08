import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="card mx-auto max-w-md p-10 text-center">
      <p className="font-display text-5xl font-extrabold gradient-text">404</p>
      <h1 className="font-display mt-3 text-xl font-bold text-ink-900">Not found</h1>
      <p className="mt-2 text-sm text-ink-500">This record may have been deleted.</p>
      <Link href="/admin" className="btn btn-primary btn-sm mt-6">
        Back to overview
      </Link>
    </div>
  );
}
