"use client";

import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User } from "lucide-react";
import { StaffMessage } from "@/../types/staff/message";
import { Paperclip } from "lucide-react";

interface SendMessageModalProps {
  message: StaffMessage;
  onClose: () => void;
  token: string | undefined;
}

export default function SendMessageModal({
  message,
  token,
  onClose,
}: SendMessageModalProps) {
  const handleDownload = async (
    messageId: string | number,
    fileName: string | undefined,
  ) => {
    if (!fileName) return;
    try {
      const response = await fetch(
        `/api/proxy/staff/staff_messages/${messageId}/download`,
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
    <div
      className="fixed top-[64px] inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <Card
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-scale-up overflow-hidden"
      >
        <CardHeader className="border-b text-primary flex justify-center text-base font-bold">
          <CardTitle>送信メッセージ詳細</CardTitle>
        </CardHeader>
        <CardContent className="">
          <div className="pb-2">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
              <span className="flex items-start gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {format(message.created_at, "yyyy/MM/dd HH:mm")}
              </span>
              <div className="flex">
                <User className="w-3.5 h-3.5 mr-1" />
                {message.to_type === 0 ? (
                  <div>
                    <div className="text-foreground">
                      {message.receiver_name}
                    </div>
                    <div>({message.group_names})</div>
                  </div>
                ) : (
                  <div className="text-foreground">{message.group_names}</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardContent className="">
          <div className="">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              タイトル
            </h4>
            <p className="text-sm leading-relaxed text-foreground bg-muted/20 p-3.5 rounded-md whitespace-pre-wrap">
              {message.title}
            </p>
          </div>
          <div className="">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              本文
            </h4>
            <p className="text-sm leading-relaxed text-foreground bg-muted/20 p-3.5 rounded-md whitespace-pre-wrap">
              {message.detail}
            </p>
          </div>
          {message.file_path ? (
            <div className="">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                添付ファイル
                <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
              </h4>
              <Button
                variant="outline"
                onClick={() =>
                  handleDownload(
                    message.id,
                    message.file_path?.split("/").pop(),
                  )
                }
                className="text-sm leading-relaxed text-foreground bg-muted/20 p-3.5 rounded-md whitespace-pre-wrap hover:bg-muted cursor-pointer"
              >
                {message.file_path?.split("/").pop()}
              </Button>
            </div>
          ) : null}
        </CardContent>
        <div className="flex justify-center pt-3">
          <Button className="px-4 py-2" onClick={onClose}>
            戻る
          </Button>
        </div>
      </Card>
    </div>
  );
}
