"use client"

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-3 border-neutral-200 border-t-neutral-900" />
        <p className="text-xs font-medium text-neutral-500">Loading details...</p>
      </div>
    </div>
  );
}