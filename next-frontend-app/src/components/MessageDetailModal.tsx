"use client";

import { Message } from "@/../types/message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Paperclip, Calendar, User, FileText, X } from "lucide-react";

interface MessageDetailModalProps {
  message: Message;
  token: string | undefined;
  onClose: () => void;
}

export default function MessageDetailModal({
  message,
  token,
  onClose,
}: MessageDetailModalProps) {
  const isReceived = message.sent === "0";

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
      if (!response.ok) throw new Error("ダウンロードリクエストに失敗しました");

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

  return (
    <div className="fixed inset-0 top-[64px] z-40 bg-parent-soft overflow-y-auto">
      <div className="sticky top-0 z-10 bg-parent-soft">
        <div className="max-w-2xl mx-auto relative px-6 py-4 flex justify-between bg-parent-soft">
          <h2 className="underline text-primary font-bold">
            {isReceived ? "受信メッセージ詳細" : "送信メッセージ詳細"}
          </h2>
        </div>
      </div>

      <div className="px-6 max-w-2xl mx-auto pb-20">
        <Card className="shadow-sm border-muted">
          <div className="flex justify-end mx-4">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <CardHeader className="bg-muted/30 pb-4 rounded-t-none">
            {isReceived && (
              <CardTitle className="text-xl font-bold tracking-tight">
                {message.title}
              </CardTitle>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Intl.DateTimeFormat("ja-JP", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(message.created_at))}
              </span>
              {isReceived && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  宛先: {message.to}
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                本文
              </h4>
              <p className="text-sm leading-relaxed text-foreground bg-muted/20 p-3.5 rounded-md whitespace-pre-wrap">
                {message.detail}
              </p>
            </div>
            {isReceived && (
              <>
                <hr className="border-muted" />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4" />
                    添付ファイル
                  </h4>
                  <div>
                    {message.file_path ? (
                      <button
                        onClick={() =>
                          handleDownload(
                            message.id,
                            message.file_path?.split("/").pop(),
                          )
                        }
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-md hover:bg-muted hover:text-primary transition-colors bg-background shadow-sm"
                      >
                        <Paperclip className="w-4 h-4 text-muted-foreground" />
                        <span>{message.file_path?.split("/").pop()}</span>
                      </button>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        なし
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
