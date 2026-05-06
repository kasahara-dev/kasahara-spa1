"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Header() {
  const { data: session, status } = useSession();
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "幼稚園連絡アプリ";
  const handleSignOut = () => {
    const redirectUrl = session?.role === "staff" ? "/staff/login" : "/login";
    signOut({ callbackUrl: redirectUrl });
  };
  const userNameWithTitle = session?.user?.name + 'さん';
  const staffNavItems = [
    { label: "Top", href: "/staff" },
    { label: "メッセージ", href: "/staff/message" },
    { label: "連絡先一覧", href: "/staff/profile" },
  ];
  const pathname = usePathname();

  return (
    <header className="bg-header">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          href={session?.role === "staff" ? "/staff" : "/"}
          className="text-xl font-bold text-primary"
        >
          {status === "authenticated" && session?.role === "parent"
            ? userNameWithTitle
            : appName}
        </Link>
        {status === "authenticated" && session?.role === "staff" && (
          <nav className="hidden md:flex items-center gap-1">
            {staffNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 font-medium rounded-md transition-colors",
                  pathname === item.href
                    ? "text-primary hover:bg-muted underline"
                    : "text-muted-foreground hover:bg-muted underline",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
        <nav className="flex items-center gap-4">
          {status === "loading" && (
            <span className="text-gray-400 text-sm">読み込み中...</span>
          )}
          {status === "authenticated" && session && (
            <div className="flex items-center gap-4">
              {status === "authenticated" && session?.role === "staff"
                ? userNameWithTitle
                : null}
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
