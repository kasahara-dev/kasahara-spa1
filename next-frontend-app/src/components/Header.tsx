"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { data: session, status } = useSession();
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "幼稚園連絡アプリ";
  const handleSignOut = () => {
    const redirectUrl = session?.role === "staff" ? "/staff/login" : "/login";
    signOut({ callbackUrl: redirectUrl });
  };

  return (
    <header className="bg-header">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          href={session?.role === "staff" ? "/staff" : "/"}
          className="text-xl font-bold text-primary"
        >
          {appName}
        </Link>
        <nav className="flex items-center gap-4">
          {status === "loading" && (
            <span className="text-gray-400 text-sm">読み込み中...</span>
          )}
          {status === "authenticated" && session && (
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm">
                {session.user?.name}さん
              </span>
              <Button className="px-3 py-6" onClick={handleSignOut} size="sm">
                ログアウト
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
