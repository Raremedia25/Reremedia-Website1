export default function AdminLoading() {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true">
      <div className="h-8 w-56 rounded-xl bg-ink-200" />
      <div className="h-4 w-80 rounded-full bg-ink-100" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-ink-100" />
        ))}
      </div>
      <div className="h-72 rounded-2xl bg-ink-100" />
    </div>
  );
}
