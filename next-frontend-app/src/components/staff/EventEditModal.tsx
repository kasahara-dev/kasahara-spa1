"use client";

import * as React from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { EventItem } from "@/../../types/calendar";

interface EventEditModalProps {
  editingEvent: EventItem;
  date: Date | undefined;
  editTitle: string;
  editDetail: string;
  formErrors: Record<string, string[]>;
  setEditTitle: (value: string) => void;
  setEditDetail: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export default function EventEditModal({
  editingEvent,
  date,
  editTitle,
  editDetail,
  formErrors,
  setEditTitle,
  setEditDetail,
  onClose,
  onSave,
}: EventEditModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border flex flex-col max-h-[85vh] animate-scale-up overflow-hidden">
        <div className="px-6 py-4 border-b text-primary flex items-center justify-center bg-slate-50 rounded-t-2xl">
          <h1 className="text-base font-bold text-primary">
            {editingEvent.id === 0 ? "新規予定の追加" : "行事詳細"}
          </h1>
        </div>
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          <dt className="text-xs font-bold text-slate-600 mb-2">日付</dt>
          <dt>{date ? format(date, "M月d日(E)", { locale: ja }) : ""}</dt>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">タイトル</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="例：お誕生日会"
            />
            {formErrors.title?.map((msg, i) => (
              <p
                key={i}
                className="text-xs font-semibold text-red-500 mt-1 pl-1"
              >
                {msg}
              </p>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">詳細</label>
            <textarea
              rows={6}
              value={editDetail}
              onChange={(e) => setEditDetail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
              placeholder="行事の詳細や持ち物、注意点などを入力してください"
            />
            {formErrors.detail?.map((msg, i) => (
              <p
                key={i}
                className="text-xs font-semibold text-red-500 mt-1 pl-1"
              >
                {msg}
              </p>
            ))}
            {formErrors.calendar_id && (
              <p className="text-xs font-semibold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
                日付データが正しく選択されていません。再度お試しください。
              </p>
            )}
          </div>

          {editingEvent.id !== 0 && (
            <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              {typeof editingEvent.updated_at === "string" && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <span>最終更新:</span>
                  <time>
                    {format(
                      new Date(editingEvent.updated_at),
                      "yyyy/MM/dd HH:mm",
                      { locale: ja },
                    )}
                  </time>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span>編集者:</span>
                <span className="font-medium text-slate-500">
                  {editingEvent.editor?.name ||
                    `スタッフ(ID: ${editingEvent.editor_id})`}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
          <Button
            onClick={onClose}
            className="px-4 py-2 border text-primary rounded-lg bg-white"
          >
            戻る
          </Button>
          <Button onClick={onSave} className="px-4 py-2 rounded-lg">
            {editingEvent.id === 0 ? "登録する" : "変更を保存する"}
          </Button>
        </div>
      </div>
    </div>
  );
}
