import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import SmoothScrolling from "@/components/SmoothScrolling";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Add Poppins for the CodeSplash specific design
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "CodeSplash | National Level University Hackathon",
  description: "CodeSplash 2026 is the ultimate convergence of logic and creativity.",
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
        geistSans.variable,
        geistMono.variable,
        inter.variable,
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
        <SmoothScrolling>
          <TooltipProvider>{children}</TooltipProvider>
        </SmoothScrolling>
      </body>
    </html>
  );
}