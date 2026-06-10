"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import ReceivedMessageModal from "@/components/staff/ReceivedMessageModal";
import SendMessageModal from "@/components/staff/SendMessageModal";
import CreateMessageModal from "@/components/staff/CreateMessageModal";
import {
  MessageApiResponse,
  StaffMessage,
  ParentMessage,
  GroupOption,
  UserOption,
} from "@/../types/staff/message";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Paperclip } from "lucide-react";
import Loading from "@/components/Loading";

export default function MessagePage() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const [sendMessages, setSendMessages] = useState<StaffMessage[]>([]);
  const [selectedSendMessage, setSelectedSendMessage] =
    useState<StaffMessage | null>(null);
  const [receivedMessages, setReceivedMessages] = useState<ParentMessage[]>([]);
  const [selectedReceivedMessage, setSelectedReceivedMessage] =
    useState<ParentMessage | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);


  const fetchMessages = React.useCallback(async () => {
    if (!token) return;

    // 1. ローディングを開始
    setIsLoading(true);

    try {
      // 2. 3つの新APIを並行（同時）して叩く
      const [staffRes, parentRes, groupsRes] = await Promise.all([
        fetch("/api/proxy/staff/staff_messages", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("/api/proxy/staff/parent_messages", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("/api/proxy/staff/groups", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      // 3. それぞれレスポンスをJSONパース
      const staffData = (await staffRes.json()) as StaffMessage[];
      const parentData = (await parentRes.json()) as ParentMessage[];
      const groupsData = (await groupsRes.json()) as GroupOption[];

      // 4. ステートにそれぞれセット
      setSendMessages(staffData || []);
      setReceivedMessages(parentData || []);
      setGroups(groupsData || []);
    } catch (err) {
      console.error("データ取得に失敗しました:", err);
    } finally {
      // 5. 最後にローディングを終了
      setIsLoading(false);
    }
  }, [token]);


  const refreshSendMessages = React.useCallback(() => {
    if (!token) return;

    fetch("/api/proxy/staff/staff_messages", {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json() as Promise<StaffMessage[]>)
      .then((data) => {
        setSendMessages(data || []);
      })
      .catch((err) => console.error(err));
  }, [token]);
  
  useEffect(() => {
    const loadData = async () => {
      await fetchMessages();
    };
    loadData();
  }, [fetchMessages]);

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
            {isLoading ? (
              <Loading />
            ) : receivedMessages.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                受信履歴はありません
              </div>
            ) : (
              receivedMessages.map((msg) => (
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
              ))
            )}
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
              <Button
                className="px-4 py-2"
                onClick={() => setIsCreateOpen(true)}
              >
                新規作成
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[350px] overflow-y-auto space-y-2 pr-4 pt-2 pb-6 px-6">
            {isLoading ? (
              <Loading />
            ) : sendMessages.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                送信履歴はありません
              </div>
            ) : (
              sendMessages.map((msg) => (
                <Card
                  key={msg.id}
                  className="p-3 hover:bg-muted cursor-pointer transition-colors shadow-none"
                  onClick={() => setSelectedSendMessage(msg)}
                >
                  <div className="flex px-2 items-center">
                    <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                      {format(msg.created_at, "yyyy/MM/dd HH:mm")}
                    </span>
                    <span className="ml-2 truncate">
                      {msg.to_type === 0 ? msg.receiver_name + "(" + msg.group_names + ")" : msg.group_names}
                    </span>
                    <span className="ml-2 truncate">{msg.title}</span>
                    {msg.file_path ? (
                      <Paperclip className="w-3.5 h-3.5 ml-1 text-muted-foreground" />
                    ) : null}
                  </div>
                </Card>
              ))
            )}
            {selectedSendMessage && (
              <SendMessageModal
                message={selectedSendMessage}
                onClose={() => setSelectedSendMessage(null)}
                token={token}
              />
            )}
            {isCreateOpen && (
              <CreateMessageModal
                groups={groups}
                onClose={() => setIsCreateOpen(false)}
                token={token}
                onSuccess={refreshSendMessages}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
