export default function Loading() {
  return (
    <div className="flex items-center justify-center py-12" role="status">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green" aria-hidden="true"></div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
