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
 * =================================
 * Portfolio project by Rithika, Pahan, and Yasiru
 * https://codesplash.cssa.lk
 *
 * Original idea & base code: https://github.com/JanishkaM/code-splash-web (pahan-demo2, performance-updates)
 * Personal development:     https://github.com/k-rithik04/CODE-SPLASH
 * Production deployment:    https://github.com/cssa-uok/code-splash
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://codesplash.cssa.lk"),
  title: {
    default: "CodeSplash 2026 | National Level University & School Hackathon",
    template: "%s | CodeSplash 2026",
  },
  description:
    "CodeSplash 2026 is Sri Lanka's premier national-level hackathon bridging university and school talent. A convergence of logic, creativity, and innovation — organized by CSSA, University of Kelaniya.",
  keywords: [
    "hackathon",
    "CodeSplash",
    "CSSA",
    "Computer Science Students Association",
    "University of Kelaniya",
    "Sri Lanka hackathon",
    "coding competition",
    "national hackathon",
    "university hackathon",
    "school hackathon",
    "tech event 2026",
    "inter-university hackathon",
    "inter-school hackathon",
    "Agentic AI challenge",
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
    ],
    apple: [
      { url: "/CodeSplash.png", sizes: "180x180", type: "image/png" },
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
      "@type": "EducationalOrganization",
      "@id": "https://codesplash.cssa.lk/#organization",
      name: "CSSA — Computer Science Students' Association",
      url: "https://cssa.lk",
      sameAs: [
        "https://www.facebook.com/cssa_uok",
        "https://www.linkedin.com/company/cssauok/",
        "https://www.instagram.com/cssa_uok/",
        "https://youtube.com/@cssauok",
        "https://github.com/k-rithik04/CODE-SPLASH",
        "https://github.com/cssa-uok/code-splash",
        "https://fct.kln.ac.lk/",
        "https://fct.kln.ac.lk/degree-programmes/computer-science",
      ],
      parentOrganization: {
        "@type": "CollegeOrUniversity",
        name: "University of Kelaniya",
        url: "https://kelaniya.ac.lk",
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
      startDate: "2026-07-04",
      endDate: "2026-09-02",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "LKR",
        availability: "https://schema.org/InStock",
        validFrom: "2026-07-04",
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://codesplash.cssa.lk/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is CodeSplash?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "CodeSplash is the flagship inter-university hackathon conducted by the Computer Science Students' Association (CSSA) of the University of Kelaniya. At CodeSplash, you get to push your limits in idea generation, build under pressure and create a solution that will work regardless of the field.",
          },
        },
        {
          "@type": "Question",
          name: "Who can participate?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The hackathon will be conducted under two main categories: the inter-school phase and the inter-university phase. The inter-university phase will be open for islandwide university students. The inter-school phase will be open to school students representing various grades and academic levels across the island who are interested in technology, innovation and problem-solving.",
          },
        },
        {
          "@type": "Question",
          name: "How can I participate in this hackathon?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Once registration opens on our official website, fill out the registration form and you'll be ready to join the CodeSplash hackathon.",
          },
        },
        {
          "@type": "Question",
          name: "What is the competition format?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "CodeSplash '26 is conducted in multiple stages, guiding participants from idea generation to solution development and final presentations. Each stage is designed to evaluate creativity, technical skills and problem-solving ability.",
          },
        },
        {
          "@type": "Question",
          name: "When do registrations open?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Registration dates will be announced through the official website and social media platforms. Stay tuned for the latest updates and important deadlines.",
          },
        },
        {
          "@type": "Question",
          name: "Is participation free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! Participation in CodeSplash '26 is completely free, providing every eligible student with an equal opportunity to compete and innovate.",
          },
        },
        {
          "@type": "Question",
          name: "What rewards can winners expect?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Winning teams will receive exciting prizes, certificates, exclusive recognition and opportunities to showcase their innovations to industry professionals.",
          },
        },
      ],
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
      copyrightHolder: {
        "@type": "Person",
        name: "Rithika",
        url: "https://github.com/k-rithik04",
      },
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://kcfwibhzmfwipipwbzrw.supabase.co" />
        <link rel="preconnect" href="https://gcymcwaocowoczvvsaxw.supabase.co" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body className={cn(
        "min-h-full flex flex-col",
        "bg-bg text-white font-main overflow-x-hidden"
      )}>
        <div
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: '<!-- Originally developed by Rithika (github.com/k-rithik04/CODE-SPLASH) | Production deployment at cssa-uok/code-splash -->',
          }}
        />
        <SmoothScroll>
          <SWRegistrar />
          <TooltipProvider>{children}</TooltipProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
