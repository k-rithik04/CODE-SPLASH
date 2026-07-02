"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-white px-4">
      <h1 className="text-4xl font-extrabold mb-4">Something went wrong</h1>
      <p className="text-lg text-white/70 mb-8">An unexpected error occurred.</p>
      <button
        onClick={reset}
        className="interactive-btn text-sm"
      >
        Try Again
      </button>
    </div>
  );
}
