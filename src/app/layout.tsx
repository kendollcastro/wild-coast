import type { Metadata, Viewport } from "next";
import { Onest, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ResourceHints } from "@/components/seo/ResourceHints";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const siteUrl = SITE_URL;

export const viewport: Viewport = {
  themeColor: "#faf8f5",
};

export const metadata: Metadata = {
  title: "jacó · casas de alquiler y tours",
  description:
    "Casas de alquiler y tours en Jacó, Costa Rica. Reservá directo con anfitriones locales — playa, selva y atardeceres del Pacífico.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "es_CR",
    siteName: "jacó",
    title: "jacó · casas de alquiler y tours",
    description:
      "Casas de alquiler y tours en Jacó, Costa Rica. Reservá directo con anfitriones locales.",
    url: siteUrl,
    images: [
      {
        url: "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Playa en Jacó, Costa Rica",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "jacó · casas de alquiler y tours",
    description:
      "Casas de alquiler y tours en Jacó, Costa Rica. Reservá directo con anfitriones locales.",
    images: ["https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=1200&q=80"],
  },
};

// Resource hints para orígenes externos que impactan LCP (hero de Unsplash).

export default async function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${onest.variable} ${instrument.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ResourceHints />
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}