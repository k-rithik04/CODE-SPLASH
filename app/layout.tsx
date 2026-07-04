import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import SmoothScrolling from "@/components/SmoothScrolling";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const viewport: Viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "CodeSplash | National Level University Hackathon",
  description: "CodeSplash 2026 is the ultimate convergence of logic and creativity.",
  keywords: ["hackathon", "CodeSplash", "university", "coding", "competition", "Sri Lanka", "2026"],
  openGraph: {
    title: "CodeSplash | National Level University Hackathon",
    description: "CodeSplash 2026 is the ultimate convergence of logic and creativity.",
    siteName: "CodeSplash 2026",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeSplash | National Level University Hackathon",
    description: "CodeSplash 2026 is the ultimate convergence of logic and creativity.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        poppins.variable
      )}
    >
      <body 
        suppressHydrationWarning
        className={cn(
          "min-h-full flex flex-col",
          "bg-bg text-white font-main overflow-x-hidden hide-scrollbar"
        )}
      >
        <link rel="preload" href="/font/Rebeca-yYx23.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/assets/frames/frame_001.webp" as="image" type="image/webp" />
        <link rel="preload" href="/assets/frames/frame_002.webp" as="image" type="image/webp" />
        <link rel="preload" href="/assets/frames/frame_003.webp" as="image" type="image/webp" />
        <SmoothScrolling>
          <TooltipProvider>{children}</TooltipProvider>
        </SmoothScrolling>
      </body>
    </html>
  );
}