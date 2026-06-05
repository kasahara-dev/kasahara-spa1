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
    <div className="fixed inset-0 top-[64px] z-40 bg-staff-soft overflow-y-auto">
      <div className="sticky top-0 z-10 bg-staff-soft">
        <div className="max-w-2xl mx-auto relative px-6 py-4 flex justify-center bg-staff-soft">
          <h1 className="text-2xl font-bold text-primary">
            受信メッセージ詳細
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
                <div>
                  <div className="text-foreground">{message.sender_name}</div>
                  <div>({message.group_names})</div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                本文
              </h4>
              <p className="text-sm leading-relaxed text-foreground bg-muted/20 p-3.5 rounded-md whitespace-pre-wrap">
                {message.detail}
              </p>
            </div>
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
