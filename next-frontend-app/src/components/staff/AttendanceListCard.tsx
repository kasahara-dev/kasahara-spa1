"use client";

import * as React from "react";
import { format } from "date-fns";
import { AttendanceRecord } from "@/../../types/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card"
import { ja } from "date-fns/locale";

interface AttendanceListCardProps {
  date: Date | undefined;
  absentStudents: AttendanceRecord[];
  lateStudents: AttendanceRecord[];
  onAttendanceClick: (attendance: AttendanceRecord) => void;
}

export default function AttendanceListCard({
  date,
  absentStudents,
  lateStudents,
  onAttendanceClick,
}: AttendanceListCardProps) {
  return (
    <Card className="min-h-[580px] flex flex-col bg-white">
      <CardHeader className="pb-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-base font-bold text-primary">
            {date
              ? `${format(date, "M月d日(E)", { locale: ja })} 欠席等連絡`
              : "欠席等連絡"}
          </CardTitle>
          <div className="flex gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100">
              お休み: {absentStudents.length} 名
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
              その他: {lateStudents.length} 名
            </span>
          </div>
        </div>
        <Button className="h-8 px-3 text-xs">新規登録</Button>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 overflow-y-auto max-h-[440px]">
        {absentStudents.length === 0 && lateStudents.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm italic border border-dashed rounded-xl p-8">
            {date
              ? `${format(date, "M月d日")} の欠席・遅刻児童の詳細がここに並びます`
              : "日付を選択してください"}
          </div>
        ) : (
          <div className="space-y-3">
            {absentStudents.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-red-100 bg-red-50/30 flex items-start flex-col gap-1 hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer "
                onClick={() => onAttendanceClick(item)}
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                    お休み
                  </span>
                  <h4 className="text-sm font-bold text-slate-800">
                    {item.user.name}
                  </h4>
                </div>
              </div>
            ))}
            {lateStudents.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 flex items-start flex-col gap-1 hover:bg-amber-50 hover:border-amber-300 transition-colors cursor-pointer "
                onClick={() => onAttendanceClick(item)}
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">
                    その他
                  </span>
                  <h4 className="text-sm font-bold text-slate-800">
                    {item.user.name}
                  </h4>
                </div>
                <p className="text-sm text-slate-600 pl-1 whitespace-pre-wrap">
                  {item.detail || "（理由は入力されていません）"}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
