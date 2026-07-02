import Link from "next/link";
import { basePath } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-white px-4">
      <img src={`${basePath}/assets/CodeSplash.png`} alt="CodeSplash" className="w-32 h-auto mb-8 opacity-80" />
      <h1 className="text-6xl font-extrabold mb-4">404</h1>
      <p className="text-xl text-white/70 mb-8">This page does not exist yet.</p>
      <Link
        href="/"
        className="interactive-btn text-sm"
      >
        Return Home
      </Link>
    </div>
  );
}
