"use client";

import { useState, useEffect } from "react";
import { Message } from "@/../types/message";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Paperclip, Calendar, User, FileText, X } from "lucide-react";

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
        <h1 className="underline text-primary">メッセージ履歴</h1>

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
              <h2 className="underline text-primary">
                {selectedMessage.sent === "0"
                  ? "受信メッセージ詳細"
                  : "送信メッセージ詳細"}
              </h2>
            </div>
          </div>
          {selectedMessage.sent === "0" ? (
            <div className="px-6 max-w-2xl mx-auto pb-20">
              <Card className="shadow-sm border-muted">
                <div className="flex justify-end mx-4">
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <CardHeader className="bg-muted/30 pb-4">
                  <CardTitle className="text-xl font-bold tracking-tight">
                    {selectedMessage.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Intl.DateTimeFormat("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(selectedMessage.created_at))}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      宛先: {selectedMessage.to}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      本文
                    </h4>
                    <p className="text-sm leading-relaxed text-foreground bg-muted/20 p-3.5 rounded-md whitespace-pre-wrap">
                      {selectedMessage.detail}
                    </p>
                  </div>

                  <hr className="border-muted" />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      <Paperclip className="w-4 h-4" />
                      添付ファイル
                    </h4>
                    <div>
                      {selectedMessage.file_path ? (
                        <a
                          href={`api/proxy/messages/${selectedMessage.id}/download`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-md hover:bg-muted hover:text-primary transition-colors bg-background shadow-sm"
                        >
                          <Paperclip className="w-4 h-4 text-muted-foreground" />
                          <span className="underline-offset-4 hover:underline">
                            {selectedMessage.file_path.split("/").pop()}
                          </span>
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          なし
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="px-6 max-w-2xl mx-auto pb-20">
              <Card className="shadow-sm border-muted">
                <div className="flex justify-end mx-4">
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Intl.DateTimeFormat("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(selectedMessage.created_at))}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      本文
                    </h4>
                    <p className="text-sm leading-relaxed text-foreground bg-muted/20 p-3.5 rounded-md whitespace-pre-wrap">
                      {selectedMessage.detail}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
