export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-foreground/5" />)}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-96 rounded-2xl bg-foreground/5" />
        <div className="h-96 rounded-2xl bg-foreground/5 lg:col-span-2" />
      </div>
    </div>
  );
}
