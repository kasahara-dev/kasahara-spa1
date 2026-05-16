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
      .then((data) => setMessages(data))
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
              <div
                key={index}
                onClick={() => setSelectedMessage(msg)}
                className="my-4 cursor-pointer"
              >
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
                    {msg.sent === "0" ? msg.title : msg.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedMessage && (
        <div className="fixed inset-0 top-[64px] z-40 bg-parent-soft overflow-y-auto">
          <div className="sticky top-0 z-10 bg-parent-soft">
            <div className="max-w-2xl mx-auto relative px-6 py-4 flex justify-between bg-parent-soft">
              <h2 className="underline text-chic-gray">
                {selectedMessage.sent === "0"
                  ? "受信メッセージ詳細"
                  : "送信メッセージ詳細"}
              </h2>
              <button
                onClick={() => setSelectedMessage(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 text-xl hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
          {selectedMessage.sent === "0" ? (
            <div className="px-6 max-w-2xl mx-auto pb-20">
              <dt>受信日時</dt>
              <dd className="mb-4">
                {new Intl.DateTimeFormat("ja-JP", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(selectedMessage.created_at))}
              </dd>
              <dt>宛先</dt>
              <dd className="mb-4">{selectedMessage.to}</dd>
              <dt>タイトル</dt>
              <dd className="mb-4">{selectedMessage.title}</dd>
              <dt>本文</dt>
              <dd className="mb-4">{selectedMessage.detail}</dd>
              <dt>添付ファイル</dt>
              {selectedMessage.file_path ? (
                <dd>
                  <a
                    href={`api/proxy/messages/${selectedMessage.id}/download`}
                    target="_blank"
                    className="underline"
                  >
                    {selectedMessage.file_path.split("/").pop()}
                  </a>
                </dd>
              ) : (
                <dd>なし</dd>
              )}
            </div>
          ) : (
            <div className="px-6 max-w-2xl mx-auto pb-20">
              <dt>送信日時</dt>
              <dd className="mb-4">
                {new Intl.DateTimeFormat("ja-JP", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(selectedMessage.created_at))}
              </dd>
              <dt>本文</dt>
              <dd className="mb-4">{selectedMessage.detail}</dd>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
