import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SWRegistrar } from "@/components/sw-registrar";
import SmoothScroll from "@/components/SmoothScroll";

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

/*
 * Root Layout — CodeSplash 2026
 * Portfolio project by Rithika (lead), Pahan, and Yasiru
 * https://codesplash.cssa.lk
 * Repo: https://github.com/cssa-uok/code-splash
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://codesplash.cssa.lk"),
  title: {
    default: "CodeSplash 2026 | National Level University & School Hackathon",
    template: "%s | CodeSplash 2026",
  },
  description:
    "CodeSplash 2026 is Sri Lanka's premier national-level hackathon bridging university and school talent. A convergence of logic, creativity, and innovation — organised by CSSA, University of Kelaniya.",
  keywords: [
    "hackathon",
    "CodeSplash",
    "CSSA",
    "University of Kelaniya",
    "Sri Lanka hackathon",
    "coding competition",
    "national hackathon",
    "university hackathon",
    "school hackathon",
    "tech event 2026",
  ],
  authors: [
    { name: "Rithika", url: "https://github.com/k-rithik04" },
    { name: "Pahan" },
    { name: "Yasiru" },
  ],
  creator: "Rithika",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://codesplash.cssa.lk",
    siteName: "CodeSplash 2026",
    title: "CodeSplash 2026 | National Level University & School Hackathon",
    description:
      "Sri Lanka's premier national-level hackathon bridging university and school talent. A convergence of logic, creativity, and innovation.",
    images: [
      {
        url: "https://codesplash.cssa.lk/og-card.png",
        width: 1200,
        height: 630,
        alt: "CodeSplash 2026 — National Level Hackathon by CSSA, University of Kelaniya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeSplash 2026 | National Level Hackathon",
    description:
      "Sri Lanka's premier national-level hackathon bridging university and school talent.",
    images: ["https://codesplash.cssa.lk/og-card.png"],
  },
  alternates: {
    canonical: "https://codesplash.cssa.lk",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://codesplash.cssa.lk/#organization",
      name: "CSSA — Computer Science Students' Association",
      url: "https://cssa.lk",
      parentOrganization: {
        "@type": "CollegeOrUniversity",
        name: "University of Kelaniya",
        url: "https://keluniya.ac.lk",
      },
    },
    {
      "@type": "Event",
      "@id": "https://codesplash.cssa.lk/#event",
      name: "CodeSplash 2026",
      description:
        "Sri Lanka's premier national-level hackathon bridging university and school talent. A convergence of logic, creativity, and innovation.",
      url: "https://codesplash.cssa.lk",
      image: "https://codesplash.cssa.lk/og-card.png",
      organizer: { "@id": "https://codesplash.cssa.lk/#organization" },
      location: {
        "@type": "Place",
        name: "University of Kelaniya",
        address: {
          "@type": "PostalAddress",
          addressCountry: "LK",
          addressRegion: "Western Province",
        },
      },
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
    },
    {
      "@type": "WebSite",
      "@id": "https://codesplash.cssa.lk/#website",
      url: "https://codesplash.cssa.lk",
      name: "CodeSplash 2026",
      publisher: { "@id": "https://codesplash.cssa.lk/#organization" },
      author: [
        {
          "@type": "Person",
          name: "Rithika",
          url: "https://github.com/k-rithik04",
        },
      ],
    },
  ],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body className={cn(
        "min-h-full flex flex-col",
        "bg-bg text-white font-main overflow-x-hidden"
      )}>
        <SmoothScroll>
          <SWRegistrar />
          <TooltipProvider>{children}</TooltipProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
