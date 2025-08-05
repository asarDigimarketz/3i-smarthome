import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import ClientProviders from "../Components/providers/ClientProviders";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "3i SmartHome - Project Management",
  description:
    "Smart home project management system for efficient project tracking and team collaboration",
  keywords:
    "smart home, project management, automation, IoT, home security, 3i",
  authors: [{ name: "3i SmartHome Team" }],
  robots: "index, follow",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "3i SmartHome - Project Management",
    description:
      "Smart home project management system for efficient project tracking and team collaboration",
    type: "website",
    siteName: "3i SmartHome",
    images: [
      {
        url: "/3i-logo-512x512.png",
        width: 512,
        height: 512,
        alt: "3i SmartHome Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "3i SmartHome - Project Management",
    description: "Smart home project management system",
    images: ["/3i-logo-512x512.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "3i SmartHome",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then(() => {})
      .catch((err) => {
        console.error("Service worker registration failed:", err);
      });
  }
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
