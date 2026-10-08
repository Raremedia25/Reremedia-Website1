export default function Loading() {
  return (
    <div className="container-x py-24" aria-busy="true" aria-live="polite">
      <div className="mx-auto max-w-3xl space-y-4 animate-pulse">
        <div className="h-4 w-32 rounded-full bg-ink-100" />
        <div className="h-10 w-3/4 rounded-xl bg-ink-100" />
        <div className="h-4 w-full rounded-full bg-ink-100" />
        <div className="h-4 w-5/6 rounded-full bg-ink-100" />
        <div className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-ink-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
