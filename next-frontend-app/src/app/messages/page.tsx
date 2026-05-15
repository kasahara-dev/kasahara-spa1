"use client";

import { useState, useEffect } from "react";
import { Message } from "@/../types/message";
import { useSession } from "next-auth/react";

export default function MessagesPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const token = session?.accessToken;

  useEffect(() => {
    if (!token) return;
    fetch("/api/proxy/messages", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => res.json())
    .then((data) => {
      console.log("実際に届いたデータ:", data); // これをチェック！
      setMessages(data);
    })
      // .then((data) => setMessages(data))
    .catch((err) => console.error(err));
  }, [token]);

  if (!session) return <div className="p-8">認証中...</div>;

  return (
    <div className="px-4 flex flex-col items-center">
      <div className="w-full md:w-1/2">
        <h1 className="underline text-chic-gray">メッセージ履歴</h1>

        {messages.length === 0 ? (
          <p>メッセージはまだありません。</p>
        ) : (
          <div className="">
            {messages.map((msg, index) => (
              <div key={index} className="my-4">
                <div>
                  <span className="">
                    {new Intl.DateTimeFormat("ja-JP").format(
                      new Date(msg.created_at),
                    )}
                  </span>
                  <span className="mx-2">{msg.to}</span>
                </div>
                <div>
                  <p className="truncate">
                    {
                      msg.sent === "0"
                        ? msg.title || "（タイトルなし）" // 受信メッセージ(0)ならタイトルを表示
                        : msg.detail || "（本文なし）" // 送信メッセージ(1)なら本文を表示
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
