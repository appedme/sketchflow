import type { Metadata } from "next";
import { StackProvider } from "@stackframe/stack";
import { stackClientApp } from "@/lib/stack";
import { Nunito } from 'next/font/google'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SketchFlow - Visual Collaboration Without Limits",
  description: "SketchFlow combines powerful diagramming, documentation, and real-time collaboration in one seamless platform. Create, share, and collaborate on visual projects with your team anywhere, anytime.",
  keywords: ["diagramming", "collaboration", "visual", "documentation", "real-time", "team"],
  authors: [{ name: "SketchFlow Team" }],
  metadataBase: new URL('https://sketchflow.space'),
  manifest: '/manifest.json',
  openGraph: {
    title: "SketchFlow - Visual Collaboration Without Limits",
    description: "SketchFlow combines powerful diagramming, documentation, and real-time collaboration in one seamless platform.",
    type: "website",
    locale: "en_US",
    url: 'https://sketchflow.space',
    siteName: 'SketchFlow',
    images: [
      {
        url: '/og.png',
        width: 1496,
        height: 1122,
        alt: 'SketchFlow OG',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SketchFlow - Visual Collaboration Without Limits",
    description: "SketchFlow combines powerful diagramming, documentation, and real-time collaboration in one seamless platform.",
    images: ['/icons/icon-512x512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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
        {/* PWA Meta Tags */}
        <meta name="application-name" content="SketchFlow" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SketchFlow" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#000000" />

        {/* Additional PWA Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/logo.svg" color="#000000" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Preload critical resources */}
        <link rel="preload" href="/logo.svg" as="image" type="image/svg+xml" />
      </head>
      <body
        className={`${nunito.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StackProvider app={stackClientApp}>
            {children}
            <PWAInstallPrompt />
          </StackProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}