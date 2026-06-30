export default function LoadingProventos() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-foreground/5" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-72 rounded-2xl bg-foreground/5" />
        <div className="h-72 rounded-2xl bg-foreground/5" />
      </div>
    </div>
  );
}
