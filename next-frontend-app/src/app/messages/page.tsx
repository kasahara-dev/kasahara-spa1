"use client";

import { useState, useEffect } from "react";
import { Message } from "@/../types/message";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Paperclip, Calendar, User, Mail, Send} from "lucide-react";
import MessageDetailModal from "@/components/MessageDetailModal";

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
        <MessageDetailModal
          message={selectedMessage}
          token={token}
          onClose={() => setSelectedMessage(null)}
        />
      )}
    </div>
  );
}
