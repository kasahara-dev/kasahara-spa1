"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Header() {
  const { data: session, status } = useSession();

  const handleSignOut = () => {
    // 職員ロールなら /staff/login、それ以外（保護者など）なら / へ
    const redirectUrl = session?.role === "staff" ? "/staff/login" : "/login";
    signOut({ callbackUrl: redirectUrl });
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          href={session?.role === "staff" ? "/staff" : "/"}
          className="text-xl font-bold text-gray-800"
        >
          ECサイト
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/buses" className="text-gray-600 hover:text-gray-800">
            バス一覧
          </Link>

          {status === "loading" ? (
            <span className="text-gray-400">読み込み中...</span>
          ) : session ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{session.user?.name}さん</span>
              <button
                onClick={handleSignOut}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
