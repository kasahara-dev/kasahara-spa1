"use client";

import { useState, useMemo } from "react";
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
  users: UserOption[];
}

interface UserOption {
  id: string | number;
  name: string;
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
  const [selectedGroupId, setSelectedGroupId] = useState<string>("0");
  const [selectedPersonId, setSelectedPersonId] = useState<string>("0");
  const currentGroup = groups.find((g) => String(g.id) === selectedGroupId);

  // そのグループに属するユーザー一覧（なければ空配列）
  // ※もしグループが「全体("0")」なら、全グループのユーザーを表示したい場合は後述
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
              <Label className="text-muted-foreground" htmlFor="group-select">
                宛先グループ選択
              </Label>
              <Select
                value={selectedGroupId}
                onValueChange={(val) => {
                  setSelectedGroupId(val);
                  setSelectedPersonId("0"); // グループが変わったら個人選択はリセット
                }}
              >
                <SelectTrigger id="group-select" className="w-[180px]">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="0">全体</SelectItem>
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
              <Label className="text-muted-foreground" htmlFor="person-select">
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
            <h2 className="text-muted-foreground">選択中宛先</h2>
            <div>テスト、テスト、テスト</div>
          </div>
          <hr />
          <div>
            <Label className="text-muted-foreground" htmlFor="title">
              タイトル
            </Label>
            <Input id="title" placeholder="保護者会"></Input>
          </div>
          <div>
            <Label className="text-muted-foreground" htmlFor="detail">
              本文
            </Label>
            <Textarea
              id="detail"
              placeholder="14時開始予定です。スリッパをお持ちください。"
              className="min-h-40"
            ></Textarea>
          </div>
          <div>
            <Label className="text-muted-foreground" htmlFor="file">
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
