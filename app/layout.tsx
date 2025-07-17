import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Compound Interest Calculator - Calculate Investment Growth",
  description: "Free compound interest calculator to estimate your investment growth over time. Calculate returns on savings, investments, and retirement planning with our easy-to-use tool.",
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
    "financial planning tool"
  ],
  authors: [{ name: "Compound Interest Calculator" }],
  creator: "Compound Interest Calculator",
  publisher: "Compound Interest Calculator",
  robots: "index, follow",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: "Compound Interest Calculator - Calculate Investment Growth",
    description: "Free compound interest calculator to estimate your investment growth over time. Calculate returns on savings, investments, and retirement planning.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Compound Interest Calculator',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compound Interest Calculator - Calculate Investment Growth",
    description: "Free compound interest calculator to estimate your investment growth over time.",
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
