import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import Providers from "@/app/providers";
import NonMenuHeader from "@/components/NonMenuHeader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "幼稚園連絡アプリ",
  description: "Laravel + Next.js ECサイト",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Providers>
          <NonMenuHeader />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
