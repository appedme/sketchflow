import type { Metadata } from "next";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
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
  title: "SketchFlow - Visual Collaboration Without Limits",
  description: "SketchFlow combines powerful diagramming, documentation, and real-time collaboration in one seamless platform. Create, share, and collaborate on visual projects with your team anywhere, anytime.",
  keywords: ["diagramming", "collaboration", "visual", "documentation", "real-time", "team"],
  authors: [{ name: "SketchFlow Team" }],
  openGraph: {
    title: "SketchFlow - Visual Collaboration Without Limits",
    description: "SketchFlow combines powerful diagramming, documentation, and real-time collaboration in one seamless platform.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SketchFlow - Visual Collaboration Without Limits",
    description: "SketchFlow combines powerful diagramming, documentation, and real-time collaboration in one seamless platform.",
  },
  robots: {
    index: true,
    follow: true,
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
        <StackProvider app={stackServerApp}>
          <StackTheme>
            {children}
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}