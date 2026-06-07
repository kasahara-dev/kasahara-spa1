"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    if (defaultGroup) {
      return String(defaultGroup.id);
    }
    return groups.length > 0 ? String(groups[0].id) : "";
  });
  const [selectedPersonId, setSelectedPersonId] = useState<string>("0");

  const currentGroup = groups.find((g) => String(g.id) === selectedGroupId);

  const displayUsers = currentGroup ? currentGroup.users : [];

  return (
    <div className="fixed inset-0 top-[64px] z-40 bg-staff-soft overflow-y-auto">
      <div className="sticky top-0 z-10 bg-staff-soft">
        <div className="max-w-2xl mx-auto relative px-6 py-4 flex justify-center bg-staff-soft">
          <h1 className="text-2xl font-bold text-primary">新規メッセージ</h1>
        </div>
      </div>
      <div className="px-6 max-w-2xl mx-auto pb-20">
        <Card className="shadow-sm border-muted px-4">
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
            <h2 className="text-primary">選択中宛先</h2>
            <div>
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
          <div>
            <Label className="text-primary" htmlFor="title">
              タイトル
            </Label>
            <Input
              id="title"
              placeholder="タイトルを50字以内で入力してください"
              maxLength={50}
            ></Input>
          </div>
          <div>
            <Label className="text-primary" htmlFor="detail">
              本文
            </Label>
            <Textarea
              id="detail"
              placeholder="本文を400字以内で入力してください"
              className="min-h-40"
              maxLength={400}
            ></Textarea>
          </div>
          <div>
            <Label className="text-primary" htmlFor="file">
              添付ファイル
            </Label>
            <Input id="file" type="file"></Input>
          </div>
        </Card>
        <div className="flex justify-center pt-3 gap-8">
          <Button className="bg-muted-primary text-primary" onClick={onClose}>
            戻る
          </Button>
          <Button className="px-4 py-2">送信</Button>
        </div>
      </div>
    </div>
  );
}
