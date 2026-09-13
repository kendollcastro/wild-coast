import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
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
  title: {
    template: "%s · Wild Coast",
    default: "Wild Coast · casas de alquiler y tours en Jacó, Costa Rica",
  },
  description:
    "Casas de alquiler y tours en Jacó, Costa Rica. Reservá directo con anfitriones locales — playa, selva y atardeceres del Pacífico.",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: "/images/wild-coast-favicon-32x32.svg", type: "image/svg+xml" },
      { url: "/images/Wild-Coast-favicon-big-android.png", sizes: "192x192", type: "image/png" },
      { url: "/images/Wild-Coast-favicon-xl-pwa-app.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/images/Wild-Coast-favicon-apple.png",
  },
  openGraph: {
    type: "website",
    locale: "es_CR",
    siteName: "Wild Coast",
    title: "Wild Coast · casas de alquiler y tours",
    description:
      "Casas de alquiler y tours en Jacó, Costa Rica. Reservá directo con anfitriones locales.",
    url: siteUrl,
    images: [
      {
        url: "/images/og-img-wild-coast.jpg",
        width: 1200,
        height: 630,
        alt: "Wild Coast — casas, tours y paquetes en Jacó, Costa Rica",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wild Coast · casas de alquiler y tours",
    description:
      "Casas de alquiler y tours en Jacó, Costa Rica. Reservá directo con anfitriones locales.",
    images: ["/images/og-img-wild-coast.jpg"],
  },
};

// Resource hints para orígenes externos que impactan LCP (hero de Unsplash).

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const h = await headers();
  const lang = h.get("x-locale") === "en" ? "en" : "es";
  return (
    <html lang={lang} className={`${onest.variable} ${instrument.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <ResourceHints />
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}