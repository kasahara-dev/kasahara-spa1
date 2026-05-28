"use client";

import * as React from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AttendanceStatusSelector from "@/components/AttendanceStatusSelector";

interface GroupWithUsers {
  id: number;
  name: string;
  category: number; // 💡 category の型もしっかり確保！
  users: { id: number; name: string }[];
}

interface AttendanceCreateModalProps {
  date: Date | undefined;
  groups: GroupWithUsers[];
  groupCategories: Record<string, string>;
  registeredUserIds: number[];
  calendarId: number; // 💡 【追加】親から選択中の日のカレンダーIDを受け取る
  formErrors?: Record<string, string[]>;
  onClose: () => void;
  // 💡 【修正】フックの関数の型（calendar_id が含まれる型）に完璧に合わせます
  onSave: (bodyData: {
    status: number;
    detail: string | null;
    user_id: number;
    calendar_id: number;
  }) => Promise<Response | undefined>;
}

export default function AttendanceCreateModal({
  date,
  groups = [],
  groupCategories = {},
  registeredUserIds = [],
  calendarId,
  formErrors = {},
  onClose,
  onSave,
}: AttendanceCreateModalProps) {
  const [selectedUserId, setSelectedUserId] = React.useState<number | null>(
    null,
  );
  const [status, setStatus] = React.useState<number>(1); // 初期値：お休み(1)
  const [detail, setDetail] = React.useState("");

  const [isStatusChanged, setIsStatusChanged] = React.useState(false);
  const [prevFormErrors, setPrevFormErrors] = React.useState(formErrors);

  if (formErrors !== prevFormErrors) {
    setIsStatusChanged(false);
    setPrevFormErrors(formErrors);
  }

  // 大分類ごとにグループをフィルタリングする関数
  const getGroupsByCategory = (catNum: number) => {
    return groups.filter((group) => group.category === catNum);
  };

  // Laravelから届いたカテゴリ設定のキーを数値配列にしてソート
  const categorizedGroups = React.useMemo(() => {
    const activeCategories = Object.keys(groupCategories).map(Number);
    return activeCategories.sort();
  }, [groupCategories]);

  const handleStatusChange = (newStatus: number) => {
    setStatus(newStatus);
    setIsStatusChanged(true);
  };

  const currentErrors = isStatusChanged && status !== 2 ? {} : formErrors;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border flex flex-col max-h-[85vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b text-primary flex items-center justify-center bg-slate-50 rounded-t-2xl">
          <h1 className="text-base font-bold text-primary">
            出欠連絡の新規登録
          </h1>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {/* 日付表示 */}
          <div>
            <dt className="text-xs font-bold text-slate-600 mb-1">対象日</dt>
            <dd className="text-sm text-slate-800 font-medium">
              {date ? format(date, "M月d日(E)", { locale: ja }) : ""}
            </dd>
          </div>

          {/* 園児選択（2重入れ子アコーディオン） */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">園児選択</label>

            {/* ▽ 階層1: 大分類（全園児、学年、組、通園方法など） */}
            <Accordion
              type="multiple"
              className="w-full border rounded-lg px-2 bg-slate-50/50"
            >
              {categorizedGroups.map((catNum) => (
                <AccordionItem
                  key={catNum}
                  value={`cat-${catNum}`}
                  className="border-b last:border-b-0"
                >
                  <AccordionTrigger className="text-sm font-bold text-slate-800 hover:no-underline px-2 py-3">
                    {groupCategories[String(catNum)] || "その他"}
                  </AccordionTrigger>

                  <AccordionContent className="pt-1 pb-3 px-2 h-auto overflow-visible">
                    {/* ▽ 階層2: 各大分類の中のグループ名（年長、ひよこ組など） */}
                    <Accordion
                      type="single"
                      collapsible
                      className="w-full border bg-white rounded-lg px-2"
                    >
                      {getGroupsByCategory(catNum).map((group) => (
                        <AccordionItem
                          key={group.id}
                          value={`group-${group.id}`}
                          className="border-b last:border-b-0"
                        >
                          <AccordionTrigger className="text-xs font-bold text-slate-600 hover:no-underline px-2 py-2">
                            {group.name} ({group.users.length}名)
                          </AccordionTrigger>

                          <AccordionContent className="pt-2 pb-2 px-1 h-auto overflow-visible">
                            {/* ▽ 階層3: 園児のボタン一覧 */}
                            <div className="grid grid-cols-2 gap-2">
                              {group.users.map((user) => {
                                const isRegistered = registeredUserIds.includes(
                                  user.id,
                                );
                                const isSelected = selectedUserId === user.id;

                                return (
                                  <button
                                    key={user.id}
                                    type="button"
                                    disabled={isRegistered}
                                    onClick={() => setSelectedUserId(user.id)}
                                    className={`flex items-center justify-between p-2.5 text-xs rounded-lg border text-left transition-all ${
                                      isRegistered
                                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                        : isSelected
                                          ? "border-blue-500 bg-blue-50/50 text-blue-700 font-bold ring-1 ring-blue-500"
                                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                    }`}
                                  >
                                    <span>{user.name}</span>
                                    {isRegistered && (
                                      <Badge
                                        variant="secondary"
                                        className="text-[10px] bg-slate-200 text-slate-500 hover:bg-slate-200 px-1 py-0 scale-90"
                                      >
                                        登録済
                                      </Badge>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* 出欠ステータス選択 */}
          {selectedUserId && (
            <div className="pt-2 animate-in fade-in duration-200">
              <AttendanceStatusSelector
                value={status}
                onChange={handleStatusChange}
                detail={detail}
                onDetailChange={setDetail}
                name="create-modal"
              />
            </div>
          )}

          {/* バリデーションエラー */}
          {currentErrors.global && currentErrors.global.length > 0 && (
            <div className="p-3 rounded-lg text-sm font-medium border bg-red-50 border-red-200 text-red-800">
              {currentErrors.global[0]}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
          <Button
            onClick={onClose}
            className="px-4 py-2 border text-primary rounded-lg bg-white"
          >
            キャンセル
          </Button>
          <Button
            disabled={!selectedUserId}
            onClick={async () => {
              if (!selectedUserId) return;

              await onSave({
                user_id: selectedUserId,
                status: status,
                detail: status === 2 ? detail : null,
                calendar_id: calendarId,
              });
              onClose();
            }}
            className="px-4 py-2 rounded-lg"
          >
            登録する
          </Button>
        </div>
      </div>
    </div>
  );
}
