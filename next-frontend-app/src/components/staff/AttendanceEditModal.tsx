"use client";

import * as React from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { AttendanceRecord } from "@/../../types/calendar";

interface AttendanceDetailModalProps {
  attendance: AttendanceRecord;
  date: Date | undefined;
  onClose: () => void;
  onSave?: (updatedData: AttendanceRecord) => void; // 将来的にステータス変更などを保存する場合用
}

export default function AttendanceDetailModal({
  attendance,
  date,
  onClose,
  onSave,
}: AttendanceDetailModalProps) {
  // 理由やメモを編集できるように状態を持たせる（必要に応じて使ってください）
  const [detail, setDetail] = React.useState(attendance.detail || "");

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border flex flex-col max-h-[85vh] animate-scale-up overflow-hidden">
        {/* ヘッダー（EventEditModalと統一） */}
        <div className="px-6 py-4 border-b text-primary flex items-center justify-center bg-slate-50 rounded-t-2xl">
          <h1 className="text-base font-bold text-primary">出欠等連絡詳細</h1>
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {/* 日付表示 */}
          <div>
            <dt className="text-xs font-bold text-slate-600 mb-1">対象日</dt>
            <dd className="text-sm text-slate-800">
              {date ? format(date, "M月d日(E)", { locale: ja }) : ""}
            </dd>
          </div>

          {/* 園児名 */}
          <div>
            <dt className="text-xs font-bold text-slate-600 mb-1">対象園児</dt>
            <dd className="text-sm font-bold text-slate-900">
              {attendance.user?.name || "未登録の園児"}
            </dd>
          </div>

          {/* 区分（欠席 / 遅刻） */}
          <div>
            <dt className="text-xs font-bold text-slate-600 mb-1.5">
              連絡区分
            </dt>
            <dd>
              {attendance.status === 1 ? (
                <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                  欠席
                </span>
              ) : (
                <span className="px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                  遅刻その他
                </span>
              )}
            </dd>
          </div>

          {/* 理由・詳細（テキストエリア） */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">
              理由・連絡内容
            </label>
            <textarea
              rows={5}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none bg-slate-50/50"
              placeholder="保護者からの理由がここに表示されます"
            />
          </div>

          {/* タイムスタンプ関係（EventEditModalのフッター上の情報と統一） */}
          <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            {typeof attendance.updated_at === "string" && (
              <div className="flex items-center gap-1">
                <span>受信日時:</span>
                <time>
                  {format(new Date(attendance.updated_at), "yyyy/MM/dd HH:mm", {
                    locale: ja,
                  })}
                </time>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span>連絡者:</span>
              <span className="font-medium text-slate-500">保護者</span>
            </div>
          </div>
        </div>

        {/* フッター（ボタンエリア） */}
        <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
          <Button
            onClick={onClose}
            className="px-4 py-2 border text-primary rounded-lg bg-white"
          >
            戻る
          </Button>
          {/* 今後、確認済みにする機能などを入れる想定でボタンを配置 */}
          <Button
            onClick={() => onSave?.({ ...attendance, detail })}
            className="px-4 py-2 rounded-lg"
          >
            確認済みにする
          </Button>
        </div>
      </div>
    </div>
  );
}
