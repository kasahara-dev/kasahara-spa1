"use client";

import { useState, useEffect } from "react";
import { Message } from "@/../types/message";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Paperclip, Calendar, User, Mail, Send, FileText, X } from "lucide-react";

export default function MessagesPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const token = session?.accessToken;
  const handleDownload = async (
    messageId: string | number,
    fileName: string | undefined,
  ) => {
    if (!fileName) return;
    try {
      const response = await fetch(
        `/api/proxy/messages/${messageId}/download`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error("ダウンロードリクエストに失敗しました");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("ダウンロードに失敗しました", error);
      alert("ファイルのダウンロードに失敗しました。");
    }
  };
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
    <div className="px-4 pb-20 flex flex-col items-center">
      <div className="w-full md:w-1/2 mt-2">
        <h1 className="underline text-primary font-bold">メッセージ履歴</h1>

        {messages.length === 0 ? (
          <p>メッセージはまだありません。</p>
        ) : (
          <div className="">
            {messages.map((msg, index) => {
              const isReceived = msg.sent === "0";

              return (
                <Card
                  key={index}
                  onClick={() => setSelectedMessage(msg)}
                  className="my-4 cursor-pointer border border-muted bg-card hover:border-primary/50 hover:shadow-sm transition-all duration-200 group"
                >
                  <CardContent className="px-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
                            isReceived
                              ? "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
                              : "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400"
                          }`}
                        >
                          {isReceived ? (
                            <Mail className="w-3 h-3" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          {isReceived ? "受信" : "送信"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Intl.DateTimeFormat("ja-JP").format(
                            new Date(msg.created_at),
                          )}
                        </span>
                        {isReceived && msg.file_path && (
                          <span
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground"
                            title="添付ファイルあり"
                          >
                            <Paperclip className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded text-foreground">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-medium">{msg.to}</span>
                      </span>
                    </div>
                    <div className="pt-1">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {isReceived ? msg.title : msg.detail}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      {selectedMessage && (
        <div className="fixed inset-0 top-[64px] z-40 bg-parent-soft overflow-y-auto">
          <div className="sticky top-0 z-10 bg-parent-soft">
            <div className="max-w-2xl mx-auto relative px-6 py-4 flex justify-between bg-parent-soft">
              <h2 className="underline text-primary font-bold">
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
                        <button
                          onClick={() =>
                            handleDownload(
                              selectedMessage.id,
                              selectedMessage.file_path?.split("/").pop(),
                            )
                          }
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-md hover:bg-muted hover:text-primary transition-colors bg-background shadow-sm"
                        >
                          <Paperclip className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {selectedMessage.file_path?.split("/").pop()}
                          </span>
                        </button>
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
                <CardHeader className="bg-muted/30">
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
