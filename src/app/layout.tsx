import type { Metadata } from "next";
import { Outfit, Geist } from "next/font/google";
import "./globals.css";
import React from 'react';
import PublicDecorators from "./components/PublicDecorators";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner"

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


// import {Toaster} from "sonner"

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Rudranarayan - Full Stack Developer",
  description:
    "Building scalable and performant web applications with modern technologies.",
  keywords: [
    "Rudranarayan Sahu",
    "Full Stack Developer",
    "React",
    "Next.js",
    "Portfolio",
    "Web Developer",
  ],
  openGraph: {
    title: "Rudranarayan - Portfolio",
    description:
      "Building scalable and performant web applications with modern technologies.",
    url: "https://rudranarayansahu.dev",
    siteName: "Rudranarayan Portfolio",
    images: [
      {
        url: "/img/preview.png",
        width: 1200,
        height: 630,
        alt: "Rudranarayan - Portfolio",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rudranarayan - Portfolio",
    description:
      "Building scalable and performant web applications with modern technologies.",
    images: ["/img/preview.png"],
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${outfit.variable} antialiased`}>
        <PublicDecorators />
        <Toaster position="top-right" richColors />
        {children}
      </body>
    </html>
  );
}