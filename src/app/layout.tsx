import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { inter } from "@/lib/fonts";
import "./globals.css";
import { Toaster } from "sonner";
import PwaServiceWorker from "@/components/PwaServiceWorker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0b1220",
};

export const metadata: Metadata = {
  title: "LEGIS AI",
  description: "Asistente jurídico inteligente centrado en el caso activo.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LEGIS AI",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <PwaServiceWorker />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
