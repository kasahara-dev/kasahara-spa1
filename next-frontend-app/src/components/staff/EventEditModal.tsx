"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EventItem } from "@/../../types/calendar";
import { format } from "date-fns";

interface EventEditModalProps {
  editingEvent: EventItem;
  date: Date | undefined;
  onClose: () => void;
  onSave: (params: {
    editingEvent: EventItem;
    title: string;
    detail: string;
  }) => Promise<Response>;
  onSuccess: () => void;
}

export default function EventEditModal({
  editingEvent,
  onClose,
  onSave,
  onSuccess,
}: EventEditModalProps) {
  const [title, setTitle] = React.useState(editingEvent.title || "");
  const [detail, setDetail] = React.useState(editingEvent.detail || "");
  const [formErrors, setFormErrors] = React.useState<Record<string, string[]>>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const trimmedDetail = detail.trim();
    const localErrors: Record<string, string[]> = {};

    if (!trimmedTitle) {
      localErrors.title = ["タイトルは必須入力です。"];
    }
    if (!trimmedDetail) {
      localErrors.detail = ["詳細は必須入力です。"];
    }

    if (Object.keys(localErrors).length > 0) {
      setFormErrors(localErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setFormErrors({});

      const response = await onSave({
        editingEvent,
        title: trimmedTitle,
        detail: trimmedDetail,
      });

      if (response.status === 200 || response.status === 201) {
        if (typeof onSuccess === "function") {
          onSuccess();
        }
        onClose();
        return;
      }
      if (response.status === 422) {
        const errorData = await response.json();
        setFormErrors(errorData.errors || {});
        return;
      }
      throw new Error();
    } catch (error) {
      console.error("保存エラー:", error);
      setFormErrors({
        global: [
          "保存に失敗しました。入力内容を確認するか、時間を置いて再度お試しください。",
        ],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed top-[64px] inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4 border">
        <h2 className="text-lg font-bold text-primary">
          {editingEvent.id === 0 ? "予定の新規登録" : "予定の編集"}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-600">タイトル</label>
            <Input
              value={title}
              placeholder="イベントタイトルを50字以内で入力してください"
              maxLength={50}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
            {formErrors.title && (
              <p className="text-xs text-red-500 mt-1">{formErrors.title[0]}</p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600">詳細</label>
            <Textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              disabled={isSubmitting}
              className="min-h-[120px] resize-none"
              maxLength={400}
              placeholder="イベント詳細を400字以内で入力してください"
            />
            {formErrors.detail && (
              <p className="text-xs text-red-500 mt-1">
                {formErrors.detail[0]}
              </p>
            )}
          </div>
        </div>

        {formErrors.global && (
          <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
            {formErrors.global[0]}
          </div>
        )}

        {editingEvent.id !== 0 && (
          <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1">
              <span className="font-bold">最終更新:</span>{" "}
              {editingEvent.updated_at
                ? format(new Date(editingEvent.updated_at), "yyyy/MM/dd HH:mm")
                : "---"}
            </div>
            {editingEvent.editor?.name && (
              <div className="flex items-center gap-1">
                <span className="font-bold">最終更新者:</span>{" "}
                {editingEvent.editor.name}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting
              ? "保存中..."
              : editingEvent.id === 0
                ? "予定を登録する"
                : "変更を保存する"}
          </Button>
        </div>
      </div>
    </div>
  );
}
