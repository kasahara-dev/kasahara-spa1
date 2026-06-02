"use client";

import * as React from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { AttendanceRecord } from "@/../../types/calendar";
import AttendanceStatusSelector from "@/components/AttendanceStatusSelector";

interface AttendanceDetailModalProps {
  attendance: AttendanceRecord;
  date: Date | undefined;
  formErrors?: Record<string, string[]>;
  working: number;
  onClose: () => void;
  onSave: (
    updatedData: AttendanceRecord & { working?: number },
  ) => Promise<Response | undefined>; // 💡 型に working を追加
  onSuccess: () => void;
}

export default function AttendanceEditModal({
  attendance,
  date,
  formErrors = {},
  onClose,
  working,
  onSave,
  onSuccess,
}: AttendanceDetailModalProps) {
  const [status, setStatus] = React.useState<number>(attendance.status);
  const [detail, setDetail] = React.useState(attendance.detail || "");

  const handleStatusChange = (newStatus: number) => {
    setStatus(newStatus);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border flex flex-col max-h-[85vh] animate-scale-up overflow-hidden">
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b text-primary flex items-center justify-center bg-slate-50 rounded-t-2xl">
          <h1 className="text-base font-bold text-primary">出欠等連絡詳細</h1>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {/* 日付表示 */}
          <div>
            <dt className="text-xs font-bold text-slate-600 mb-1">日付</dt>
            <dd className="text-sm text-slate-800">
              {date ? format(date, "M月d日(E)", { locale: ja }) : ""}
            </dd>
          </div>

          {/* 園児名 */}
          <div>
            <dt className="text-xs font-bold text-slate-600 mb-1">園児</dt>
            <dd className="text-sm font-bold text-slate-900 flex flex-wrap items-center gap-2">
              <span>{attendance.user.name}</span>
              {attendance.user.groups && attendance.user.groups.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {attendance.user.groups.map((group) => (
                    <span
                      key={group.id}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
                    >
                      {group.name}
                    </span>
                  ))}
                </div>
              )}
            </dd>
          </div>

          {/* ステータスセレクター */}
          <AttendanceStatusSelector
            value={status}
            onChange={handleStatusChange}
            detail={detail}
            onDetailChange={setDetail}
            name={String(attendance.id)}
          />

          {/* ------------------------------------------------------------- */}
          {/* 🔴 バリデーションエラー表示エリア（最適化版） */}
          {/* ------------------------------------------------------------- */}
          {/* ① detail（詳細未入力など）のエラー */}
          {formErrors.detail && formErrors.detail.length > 0 && (
            <div className="p-3 rounded-lg text-sm font-medium border bg-red-50 border-red-200 text-red-800 animate-in fade-in duration-200">
              {formErrors.detail[0]}
            </div>
          )}

          {/* ② working（園休日チェックなど）のエラー */}
          {formErrors.working && formErrors.working.length > 0 && (
            <div className="p-3 rounded-lg text-sm font-medium border bg-red-50 border-red-200 text-red-800 animate-in fade-in duration-200">
              {formErrors.working[0]}
            </div>
          )}

          {/* ③ global などの汎用エラー（保険用） */}
          {formErrors.global && formErrors.global.length > 0 && (
            <div className="p-3 rounded-lg text-sm font-medium border bg-red-50 border-red-200 text-red-800 animate-in fade-in duration-200">
              {formErrors.global[0]}
            </div>
          )}
          {/* ------------------------------------------------------------- */}

          {/* タイムスタンプ関係 */}
          {attendance.editor_id !== null &&
          attendance.editor_id !== undefined ? (
            <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-1">
                <span>最終更新:</span>
                <time>
                  {format(new Date(attendance.updated_at), "yyyy/MM/dd HH:mm", {
                    locale: ja,
                  })}
                </time>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-slate-500">
                  {attendance.editor?.name}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        {/* フッター */}
        <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
          <Button
            onClick={onClose}
            className="px-4 py-2 border text-primary rounded-lg bg-white"
          >
            戻る
          </Button>
          <Button
            onClick={async () => {
              try {
                // 💡 元々のデータに入っている、またはカレンダーに紐づくworking状態をそのまま添付して送信
                // （※もし attendance.calendar.working などのデータがあればそちら、なければデフォルト1など）
                const response = await onSave?.({
                  ...attendance,
                  status: status,
                  detail: status === 2 ? detail : null,
                  working: working, // 👈 🔴 送信データにworkingを混ぜる！
                });

                if (response && response.ok) {
                  if (typeof onSuccess === "function") {
                    onSuccess();
                  }
                  onClose();
                  return;
                }
              } catch (error) {
                console.error("出欠保存エラー:", error);
              }
            }}
            className="px-4 py-2 rounded-lg"
          >
            変更を保存する
          </Button>
        </div>
      </div>
    </div>
  );
}
