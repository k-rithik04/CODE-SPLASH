import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SWRegistrar } from "@/components/sw-registrar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const rebeca = localFont({
  src: "../public/font/Rebeca-yYx23.ttf",
  variable: "--font-rebeca",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CodeSplash | National Level University Hackathon",
  description: "CodeSplash 2026 is the ultimate convergence of logic and creativity.",
  openGraph: {
    title: "CodeSplash | National Level University Hackathon",
    description: "CodeSplash 2026 is the ultimate convergence of logic and creativity.",
    type: "website",
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
        poppins.variable,
        rebeca.variable
      )}
    >
      <body className={cn(
        "min-h-full flex flex-col",
        "bg-bg text-white font-main overflow-x-hidden"
      )}>
        <SWRegistrar />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}