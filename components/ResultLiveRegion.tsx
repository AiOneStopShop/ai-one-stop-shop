'use client';

export function ResultLiveRegion({ message }: { message: string }) {
  return (
    <p aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </p>
  );
}
