"use client";

import CalendarSection from "@/components/CalendarSection";
import ContactForm from "@/components/ContactForm";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  return (
    <div className="px-4 pb-20 flex flex-col items-center">
      <div className="w-full md:w-1/2">
        <div className="my-2">
          <h2 className="underline text-primary font-bold">予定</h2>
          <CalendarSection apiUrl="/api/proxy" />
        </div>
        <div className="my-2">
          <Link href="/messages">
            <h2 className="underline text-primary font-bold">メッセージ履歴</h2>
          </Link>
        </div>
        <div className="my-2">
          <h2 className="underline text-primary font-bold">お問い合わせ</h2>
          <ContactForm token={token} />
        </div>
        <div className="my-2">
          <Link href="/profile">
            <h2 className="underline text-primary font-bold">保護者情報編集</h2>
          </Link>
        </div>
      </div>
    </div>
  );
}
