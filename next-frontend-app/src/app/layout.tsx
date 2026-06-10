import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME,
  description: "幼稚園連絡アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={cn("font-sans", geist.variable)}>
      <body className="bg-parent-soft min-h-screen">
        <Providers>
          <div className="sticky top-0 z-50 w-full">
            <Header />
          </div>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
