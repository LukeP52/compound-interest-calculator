import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Compound Interest Calculator - Calculate Investment Growth | MyCompoundCalculator.com",
  description: "Free compound interest calculator to estimate your investment growth over time. Calculate returns on savings, investments, and retirement planning with our comprehensive financial tool. Learn how compound interest works and plan your financial future.",
  keywords: [
    "compound interest calculator",
    "investment calculator", 
    "savings calculator",
    "retirement calculator",
    "investment growth",
    "compound interest formula",
    "financial calculator",
    "investment planning",
    "wealth building",
    "financial planning tool",
    "money growth calculator",
    "investment returns",
    "savings growth",
    "retirement planning tool"
  ],
  authors: [{ name: "MyCompoundCalculator.com" }],
  creator: "MyCompoundCalculator.com",
  publisher: "MyCompoundCalculator.com",
  robots: "index, follow",
  metadataBase: new URL('https://mycompoundcalculator.com'),
  alternates: {
    canonical: 'https://mycompoundcalculator.com',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
  },
  openGraph: {
    title: "Compound Interest Calculator - Calculate Investment Growth | MyCompoundCalculator.com",
    description: "Free compound interest calculator to estimate your investment growth over time. Calculate returns on savings, investments, and retirement planning with our comprehensive financial tool.",
    url: "https://mycompoundcalculator.com",
    siteName: "MyCompoundCalculator.com",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Compound Interest Calculator - Comprehensive financial planning tool',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compound Interest Calculator - Calculate Investment Growth",
    description: "Free compound interest calculator to estimate your investment growth over time. Plan your financial future with our comprehensive tool.",
    images: ['/og-image.png'],
  },
  other: {
    'google-site-verification': 'your-verification-code-here', // Add your Google Search Console verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1040597080432802"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Compound Interest Calculator",
              "description": "Free compound interest calculator to estimate your investment growth over time. Calculate returns on savings, investments, and retirement planning with our comprehensive financial tool.",
              "url": "https://mycompoundcalculator.com",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Organization",
                "name": "MyCompoundCalculator.com"
              },
              "featureList": [
                "Compound interest calculations",
                "Investment growth projections",
                "Retirement planning",
                "Savings calculator",
                "Multiple currency support",
                "Custom contribution frequencies",
                "One-time transaction support",
                "Annual contribution increases",
                "PDF and Excel export",
                "Visual charts and graphs"
              ],
              "screenshot": "https://mycompoundcalculator.com/og-image.png",
              "browserRequirements": "Requires JavaScript. Requires HTML5.",
              "softwareVersion": "1.0",
              "datePublished": "2024-01-01",
              "dateModified": new Date().toISOString().split('T')[0],
              "inLanguage": "en-US",
              "isAccessibleForFree": true,
              "license": "https://mycompoundcalculator.com",
              "mainEntity": {
                "@type": "SoftwareApplication",
                "name": "Compound Interest Calculator",
                "applicationCategory": "FinanceApplication"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
