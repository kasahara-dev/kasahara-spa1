"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import ReceivedMessageModal from "@/components/staff/ReceivedMessageModal";
import SendMessageModal from "@/components/staff/SendMessageModal";
import {
  MessageApiResponse,
  StaffMessage,
  ParentMessage,
} from "@/../types/staff/message";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Paperclip } from "lucide-react";

export default function MessagePage() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [sendMessages, setSendMessages] = useState<StaffMessage[]>([]);
  const [selectedSendMessage, setSelectedSendMessage] = useState<StaffMessage | null>(
    null,
  );
  const [receivedMessages, setReceivedMessages] = useState<ParentMessage[]>([]);
  const [selectedReceivedMessage, setSelectedReceivedMessage] = useState<ParentMessage | null>(
    null,
  );

  useEffect(() => {
    if (!token) return;
    fetch("/api/proxy/staff/messages", {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json() as Promise<MessageApiResponse>)
      .then((data) => {
        setSendMessages(data.send_messages || []);
        setReceivedMessages(data.received_messages || []);
      })
      .catch((err) => console.error(err));
  }, [token]);

  if (!session) return <div className="p-8">認証中...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 pb-20">
      <div className="flex justify-center items-center">
        <h1 className="text-2xl font-bold text-primary">メッセージ</h1>
      </div>
      <div className="flex flex-col gap-6">
        <Card className="">
          <CardHeader className="px-6">
            <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
              受信履歴
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[350px] overflow-y-auto space-y-2 pr-4 pt-2 pb-6 px-6">
            {receivedMessages.map((msg) => (
              <Card
                key={msg.id}
                className="p-3 hover:bg-muted cursor-pointer transition-colors shadow-none"
                onClick={() => setSelectedReceivedMessage(msg)}
              >
                <div className="flex px-2 items-center">
                  <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                    {format(msg.created_at, "yyyy/MM/dd HH:mm")}
                  </span>
                  <span className="ml-2 truncate">{msg.sender_name}</span>
                  <span className="truncate">({msg.group_names})</span>
                  <span className="ml-2 truncate">{msg.detail}</span>
                </div>
              </Card>
            ))}
            {selectedReceivedMessage && (
              <ReceivedMessageModal
                message={selectedReceivedMessage}
                onClose={() => setSelectedReceivedMessage(null)}
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="px-6">
            <CardTitle className="text-lg font-semibold text-primary flex justify-between items-center">
              <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                送信履歴
              </h2>
              <Button className="px-4 py-2">新規作成</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[350px] overflow-y-auto space-y-2 pr-4 pt-2 pb-6 px-6">
            {sendMessages.map((msg) => (
              <Card
                key={msg.id}
                className="p-3 hover:bg-muted cursor-pointer transition-colors shadow-none"
                onClick={() => setSelectedSendMessage(msg)}
              >
                <div className="flex px-2 items-center">
                  <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                    {format(msg.created_at, "yyyy/MM/dd HH:mm")}
                  </span>
                  <span className="ml-2">
                    {msg.to_type === 0 ? msg.receiver_name : msg.group_names}
                  </span>
                  <span className="ml-2 truncate">{msg.title}</span>
                  {msg.file_path ? (
                    <Paperclip className="w-3.5 h-3.5 ml-1 text-muted-foreground" />
                  ) : null}
                </div>
              </Card>
            ))}
            {selectedSendMessage && (
              <SendMessageModal
                message={selectedSendMessage}
                onClose={() => setSelectedSendMessage(null)}
                token={token}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
