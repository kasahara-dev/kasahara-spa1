"use client";

import CalendarSection from "@/components/CalendarSection";
import Link from "next/link";

export default function Home() {
  return (
    <div className="px-4 flex flex-col items-center">
      <div className="w-full md:w-1/2">
        <div className="my-2">
          <h2 className="underline text-chic-gray">予定</h2>
          <CalendarSection apiUrl="/api/proxy" />
        </div>
        <div className="my-2">
          <Link href="/messages">
            <h2 className="underline text-chic-gray">メッセージ履歴</h2>
          </Link>
        </div>
        <div className="my-2">
          <h2 className="underline text-chic-gray">お問い合わせ</h2>
        </div>
        <div className="my-2">
          <h2 className="underline text-chic-gray">保護者情報編集</h2>
        </div>
      </div>
    </div>
  );
}
