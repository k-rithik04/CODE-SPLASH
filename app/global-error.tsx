"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
        <h1 className="text-4xl font-extrabold mb-4">Critical Error</h1>
        <p className="text-lg text-white/70 mb-8">Something went critically wrong.</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors"
        >
          Reload Page
        </button>
      </body>
    </html>
  );
}
