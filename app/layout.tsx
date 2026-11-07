import type { Metadata } from "next";
import { Newsreader, Outfit } from "next/font/google";
import { BagProvider } from "@/components/bag-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://danielbooneoutdoors.com"),
  title: {
    default: "Daniel Boone Outdoors",
    template: "%s · Daniel Boone Outdoors",
  },
  description: "Packs, camp kit, and carry goods for the day ahead. An independent outdoor outfitter.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${newsreader.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <BagProvider>
          <SiteHeader />
          <main id="content" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </BagProvider>
      </body>
    </html>
  );
}
