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
import { ParentMessage } from "@/../types/staff/message";

interface ReceivedMessageModalProps {
  message: ParentMessage;
  onClose: () => void;
}

export default function ReceivedMessageModal({
  message,
  onClose,
}: ReceivedMessageModalProps) {
  return (
    <div
      className="fixed top-[64px] inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <Card
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border flex flex-col max-h-[85vh] animate-scale-up overflow-hidden"
      >
        {/* ヘッダー */}
        <CardHeader className="border-b text-primary flex justify-center text-base font-bold">
          <CardTitle>受信メッセージ詳細</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
          <span className="flex items-start gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {format(message.created_at, "yyyy/MM/dd HH:mm")}
          </span>
          <div className="flex">
            <User className="w-3.5 h-3.5 mr-1" />
            <div>
              <div className="text-foreground">{message.sender_name}</div>
              <div>({message.group_names})</div>
            </div>
          </div>
        </CardContent>
        <CardContent className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            本文
          </h4>
          <p className="text-sm leading-relaxed text-foreground bg-muted/20 p-3.5 rounded-md whitespace-pre-wrap">
            {message.detail}
          </p>
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
