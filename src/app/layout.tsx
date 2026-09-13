import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SITE_URL = "https://russellsharpfamily.com";
const OG_IMAGE = "/images/og-image.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Russell–Sharp Family Reunion | Atlanta 2027",
  description:
    "Save the date: September 3–5, 2027, Atlanta, Georgia. Same Roots. New Vibes. Join the interest list for the Russell–Sharp Family Reunion.",
  icons: {
    icon: [
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Russell–Sharp Family Reunion | Atlanta 2027",
    description: "Same Roots. New Vibes. September 3–5, 2027 · Atlanta, Georgia.",
    url: SITE_URL,
    siteName: "Russell–Sharp Family Reunion",
    images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Russell–Sharp Family Reunion | Atlanta 2027",
    description: "Same Roots. New Vibes. September 3–5, 2027 · Atlanta, Georgia.",
    images: [OG_IMAGE],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

