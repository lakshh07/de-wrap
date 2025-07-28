import type { Metadata } from "next";
import localFont from "next/font/local";
import { Cairo } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

const clashDisplay = localFont({
  src: [
    {
      path: "../public/assets/fonts/ClashDisplay-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/assets/fonts/ClashDisplay-Semibold.otf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-clash-display",
});

const garamond = localFont({
  src: "../public/assets/fonts/Garamond-I.woff2",
  variable: "--font-garamond",
});

const cairo = Cairo({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "DeWrap",
  description: "Web3-Native smart payments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} ${clashDisplay.variable} ${garamond.variable}`}
        suppressHydrationWarning={true}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
