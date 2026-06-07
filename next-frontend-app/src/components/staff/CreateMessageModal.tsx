"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface GroupOption {
  id: string | number;
  name: string;
  category: number;
  users: UserOption[];
}

interface UserOption {
  id: string | number;
  name: string;
  group_summary?: string;
}

interface CreateMessageModalProps {
  onClose: () => void;
  token: string | undefined;
  groups: GroupOption[];
}

export default function CreateMessageModal({
  onClose,
  token,
  groups = [],
}: CreateMessageModalProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => {
    const defaultGroup = groups.find((g) => g.category === 0);
    if (defaultGroup) return String(defaultGroup.id);
    return groups.length > 0 ? String(groups[0].id) : "";
  });
  const [selectedPersonId, setSelectedPersonId] = useState<string>("0");

  // 💡 追加：入力値と通信状態のState
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState("");

  const currentGroup = groups.find((g) => String(g.id) === selectedGroupId);
  const displayUsers = currentGroup ? currentGroup.users : [];

  // 🚀 💡 追加：送信処理
  const handleSend = async () => {
    setIsSubmitting(true);
    setFormErrors({});
    setSuccessMessage("");

    // 1. to_type と to の判定（0: 全員/グループ宛, 1: 個人宛）
    const toType = selectedPersonId === "0" ? "0" : "1";
    const toValue =
      selectedPersonId === "0" ? selectedGroupId : selectedPersonId;

    // 2. FormDataの組み立て
    const formData = new FormData();
    formData.append("to_type", toType);
    formData.append("to", toValue);
    formData.append("title", title);
    formData.append("detail", detail);

    if (file) {
      formData.append("file_path", file);
    }

    try {
      const response = await fetch("/api/proxy/staff/messages", {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await response.json();

      if (response.status === 201) {
        setSuccessMessage("メッセージの送信とメール配信が完了しました！");
        setTitle("");
        setDetail("");
        setFile(null);
        // 少し余韻を残してモーダルを閉じる場合はここに setTimeout など
        return;
      }

      if (response.status === 422) {
        setFormErrors(data.errors || {});
        return;
      }

      throw new Error();
    } catch (error) {
      console.error("メッセージ送信エラー:", error);
      setFormErrors({
        global: ["送信に失敗しました。時間を置いて再度お試しください。"],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 top-[64px] z-40 bg-staff-soft overflow-y-auto">
      <div className="top-0 z-10 bg-staff-soft">
        <div className="max-w-2xl mx-auto relative px-6 py-4 flex justify-center bg-staff-soft">
          <h1 className="text-2xl font-bold text-primary">新規メッセージ</h1>
        </div>
      </div>
      <div className="px-6 max-w-2xl mx-auto pb-20">
        <Card className="shadow-sm border-muted p-4 space-y-4">
          {/* 💡 成功メッセージの表示 */}
          {successMessage && (
            <div className="p-3 bg-blue-50 text-blue-700 rounded text-sm font-medium">
              {successMessage}
            </div>
          )}

          {/* 💡 グローバルエラーの表示 */}
          {formErrors.global && (
            <div className="p-3 bg-red-50 text-red-700 rounded text-sm font-medium">
              {formErrors.global[0]}
            </div>
          )}

          <div className="flex gap-4">
            <div>
              <Label className="text-primary" htmlFor="group-select">
                宛先グループ選択
              </Label>
              <Select
                value={selectedGroupId}
                onValueChange={(val) => {
                  setSelectedGroupId(val);
                  setSelectedPersonId("0");
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger id="group-select" className="w-[180px]">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={String(g.id)}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-primary" htmlFor="person-select">
                宛先個人選択
              </Label>
              <Select
                value={selectedPersonId}
                onValueChange={setSelectedPersonId}
                disabled={isSubmitting}
              >
                <SelectTrigger id="person-select" className="w-[180px]">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="0">全員</SelectItem>
                    {displayUsers.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-primary mb-1">選択中宛先</h2>
            <div className="text-sm text-slate-700 bg-slate-50 p-2 rounded border">
              {(() => {
                if (selectedPersonId === "0") {
                  if (displayUsers.length === 0) return "宛先がありません";
                  return displayUsers.map((u: UserOption) => u.name).join("、");
                }
                const selectedUser = displayUsers.find(
                  (u: UserOption) => String(u.id) === selectedPersonId,
                );
                if (selectedUser) {
                  return selectedUser.group_summary
                    ? `${selectedUser.name} (${selectedUser.group_summary})`
                    : selectedUser.name;
                }
                return "";
              })()}
            </div>
            {displayUsers.length > 0 && (
              <div className="text-xs text-muted-foreground font-normal mt-0.5">
                計 {selectedPersonId === "0" ? displayUsers.length : 1} 件
              </div>
            )}
          </div>
          <hr />

          {/* タイトル入力 */}
          <div>
            <Label className="text-primary" htmlFor="title">
              タイトル（50字以内）
            </Label>
            <Input
              id="title"
              placeholder="タイトルを50字以内で入力してください"
              maxLength={50}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
            {formErrors.title && (
              <p className="text-xs text-red-500 mt-1">{formErrors.title[0]}</p>
            )}
          </div>

          {/* 本文入力 */}
          <div>
            <Label className="text-primary" htmlFor="detail">
              本文（400字以内）
            </Label>
            <Textarea
              id="detail"
              placeholder="本文を400字以内で入力してください"
              className="min-h-40"
              maxLength={400}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              disabled={isSubmitting}
            />
            {formErrors.detail && (
              <p className="text-xs text-red-500 mt-1">
                {formErrors.detail[0]}
              </p>
            )}
          </div>

          {/* 添付ファイル */}
          <div>
            <Label className="text-primary" htmlFor="file">
              添付ファイル（PDF, 画像 / 5MB以内）
            </Label>
            <Input
              id="file"
              type="file"
              accept=".pdf, .jpg, .jpeg, .png"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={isSubmitting}
            />
            {formErrors.file_path && (
              <p className="text-xs text-red-500 mt-1">
                {formErrors.file_path[0]}
              </p>
            )}
          </div>
        </Card>

        <div className="flex justify-center pt-3 gap-8">
          <Button
            className="bg-muted-primary text-primary hover:bg-slate-200"
            onClick={onClose}
            disabled={isSubmitting}
          >
            戻る
          </Button>
          <Button
            className="px-4 py-2"
            onClick={handleSend}
            disabled={isSubmitting}
          >
            {isSubmitting ? "送信中..." : "送信"}
          </Button>
        </div>
      </div>
    </div>
  );
}
