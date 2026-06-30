export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-foreground/5" />
      <div className="card p-6 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-8 animate-pulse rounded-lg bg-foreground/5" />
        ))}
      </div>
    </div>
  );
}
