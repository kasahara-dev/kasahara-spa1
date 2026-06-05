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
import { Calendar, User, FileText } from "lucide-react";
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
        `/api/proxy/staff/messages/${messageId}/download`,
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
    <div className="fixed inset-0 top-[64px] z-40 bg-staff-soft overflow-y-auto">
      <div className="sticky top-0 z-10 bg-staff-soft">
        <div className="max-w-2xl mx-auto relative px-6 py-4 flex justify-center bg-staff-soft">
          <h1 className="text-2xl font-bold text-primary">
            送信メッセージ詳細
          </h1>
        </div>
      </div>

      <div className="px-6 max-w-2xl mx-auto pb-20">
        <Card className="shadow-sm border-muted">
          <CardHeader className="bg-muted/30 pb-2">
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
          </CardHeader>
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
        </Card>
        <div className="flex justify-center pt-3">
          <Button className="px-4 py-2" onClick={onClose}>
            戻る
          </Button>
        </div>
      </div>
    </div>
  );
}
