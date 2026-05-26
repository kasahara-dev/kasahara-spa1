"use client";

import * as React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const ATTENDANCE_STATUS = {
  PRESENT: 0,
  ABSENT: 1,
  LATE: 2,
} as const;

// 選択肢の定義も外に出してスッキリ
const statusOptions = [
  {
    label: "出席",
    value: ATTENDANCE_STATUS.PRESENT,
    activeClass:
      "[&:has(:checked)]:border-blue-500 [&:has(:checked)]:bg-blue-50/20 text-slate-700",
  },
  {
    label: "お休み",
    value: ATTENDANCE_STATUS.ABSENT,
    activeClass:
      "[&:has(:checked)]:border-red-500 [&:has(:checked)]:bg-red-50/20 text-red-700",
  },
  {
    label: "遅刻その他",
    value: ATTENDANCE_STATUS.LATE,
    activeClass:
      "[&:has(:checked)]:border-amber-500 [&:has(:checked)]:bg-amber-50/20 text-amber-700",
  },
];

interface AttendanceStatusSelectorProps {
  value: number;
  onChange: (newValue: number) => void;
  detail: string;
  onDetailChange: (newDetail: string) => void;
  disabled?: boolean;
  name?: string;
}

export default function AttendanceStatusSelector({
  value,
  onChange,
  detail,
  onDetailChange,
  disabled = false,
  name = "default",
}: AttendanceStatusSelectorProps) {
  const memoizedDetail = React.useRef<string>(detail);
  React.useEffect(() => {
    if (detail && value === ATTENDANCE_STATUS.LATE) {
      memoizedDetail.current = detail;
    }
  }, [value,detail]);
  const handleTextChange = (text: string) => {
    onDetailChange(text);
    memoizedDetail.current = text;
  }

  // ステータス変更時に理由をクリアする共通ルール
  const handleStatusChange = (val: string) => {
    const nextStatus = Number(val);
    onChange(nextStatus);
    if (nextStatus === ATTENDANCE_STATUS.LATE) {
      onDetailChange(memoizedDetail.current);
    } else {
      onDetailChange("");
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. ステータス選択 */}
      <RadioGroup
        value={String(value)}
        onValueChange={handleStatusChange}
        className="flex flex-col sm:flex-row gap-3 pt-1"
        disabled={disabled}
      >
        {statusOptions.map((item) => {
          const uniqueId = `status-${name}-${item.value}`;
          return (
            <div
              key={uniqueId}
              className={`flex items-center space-x-2 border rounded-lg p-3 flex-1 transition-colors ${
                disabled ? "bg-slate-100 opacity-60 cursor-not-allowed" : `cursor-pointer hover:bg-slate-50 ${item.activeClass}`
              }`}
            >
              <RadioGroupItem value={String(item.value)} id={uniqueId} disabled={disabled} />
              <Label htmlFor={uniqueId} className="flex-1 font-bold text-sm cursor-pointer">
                {item.label}
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      {/* 2. 理由入力（遅刻その他の時だけ表示。スタッフ・保護者共通！） */}
      {value === ATTENDANCE_STATUS.LATE && (
        <div className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <label className="text-xs font-bold text-slate-600">
            理由・連絡内容 <span className="text-red-500 font-normal">（必須）</span>
          </label>
          <Textarea
            rows={4}
            value={detail}
            onChange={(e) => handleTextChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            placeholder="理由を詳しく入力してください"
          />
        </div>
      )}
    </div>
  );
}