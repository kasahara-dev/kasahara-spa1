"use client";

import * as React from "react";
import { X } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// 💡 古い RadioGroup 関連や Input のインポートを削り、共通コンポーネントをインポート
import AttendanceStatusSelector from "@/components/AttendanceStatusSelector";

const isPastDeadline = (
  targetDateStr: string,
  deadlineTime: string,
): boolean => {
  const jstString = new Date().toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });
  const now = new Date(jstString);
  return now > new Date(`${targetDateStr}T${deadlineTime}`);
};

interface CalendarEvent {
  id: number;
  title: string;
  detail?: string | null;
}

interface AttendanceModalProps {
  date: Date;
  dayData:
    | {
        id: number;
        date: string;
        working: number;
        events: CalendarEvent[];
        attendance?: {
          id: number;
          status: number;
          user_id: number;
          calendar_id: number;
          detail?: string | null;
        } | null;
      }
    | undefined;
  deadlineTime: string;
  isSaving: boolean;
  submitMessage: string;
  submitMessageType: "success" | "error" | "";
  onClose: () => void;
  onSave: (formStatus: number, formDetail: string) => Promise<void>;
}

export function AttendanceModal({
  date,
  dayData,
  deadlineTime,
  isSaving,
  submitMessage,
  submitMessageType,
  onClose,
  onSave,
}: AttendanceModalProps) {
  const attendance = dayData?.attendance;
  const targetDateStr = format(date, "yyyy-MM-dd");
  const formattedDate = format(date, "M月d日", { locale: ja });
  const isExpired = isPastDeadline(targetDateStr, deadlineTime);
  const [formStatus, setFormStatus] = React.useState<number>(
    attendance?.status ?? 0,
  );
  const [formDetail, setFormDetail] = React.useState<string>(
    attendance?.detail ?? "",
  );
  let statusText = "出席";
  let statusColor = "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30";
  if (attendance) {
    if (attendance.status === 1) {
      statusText = "欠席";
      statusColor = "text-red-600 bg-red-50 dark:bg-red-950/30";
    } else if (attendance.status === 2) {
      statusText = "遅刻その他";
      statusColor = "text-amber-600 bg-amber-50 dark:bg-amber-950/30";
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 top-[64px] z-40 bg-parent-soft overflow-y-auto bg-black/10 backup-blur-sm">
      <div className="max-w-2xl mx-auto px-6 py-6 space-y-8 flex flex-col">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <section className="space-y-2">
          <h3 className="underline text-primary font-bold text-lg">
            {formattedDate}の出欠予定
          </h3>
          <div>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
            >
              {statusText}
            </span>
            <p className="mt-2 text-sm text-muted-foreground">
              {attendance?.detail}
            </p>
          </div>
        </section>
        <section className="space-y-4">
          <h3 className="underline text-primary font-bold text-lg">
            {formattedDate}の出欠予定変更
          </h3>
          <Card className="overflow-hidden shadow-sm">
            <CardContent className="px-5 space-y-5">
              {/* 💡 【修正点1】detail と onDetailChange、そしてユニークな name をしっかり渡します */}
              <AttendanceStatusSelector
                value={formStatus}
                onChange={setFormStatus}
                detail={formDetail}
                onDetailChange={setFormDetail}
                disabled={isExpired || isSaving}
                name={`parent-modal-${dayData?.id ?? "new"}`}
              />

              {/* 💡 【修正点2】古い {formStatus === 2 && ( ... )} の入力エリアの塊は、共通部品の中に引っ越したので丸ごと削除しました！ */}

              <div className="pt-2 space-y-3">
                <Button
                  type="button"
                  disabled={isExpired || isSaving}
                  onClick={() => onSave(formStatus, formDetail)}
                  className="w-full md:w-48 font-medium shadow-sm"
                >
                  {isSaving ? "保存中..." : "変更を保存する"}
                </Button>

                {submitMessage && (
                  <div
                    className={`p-3 rounded-lg text-sm font-medium border animate-in fade-in duration-200 ${
                      submitMessageType === "success"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400"
                        : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400"
                    }`}
                  >
                    {submitMessage}
                  </div>
                )}
                <p className="text-red-500 text-xs font-medium leading-relaxed text-center md:text-start">
                  ※アプリでの変更は当日{deadlineTime}まで可能です
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
        <section className="space-y-4 pb-20">
          <h3 className="underline text-primary font-bold text-lg">
            {formattedDate}の予定
          </h3>
          <div className="pt-1">
            {dayData?.events && dayData.events.length > 0 ? (
              <div className="space-y-4">
                {dayData.events.map((event) => (
                  <Card
                    key={event.id}
                    className="relative overflow-hidden shadow-sm"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
                    <CardContent className="p-5 pl-7 space-y-3">
                      <h4 className="font-bold text-foreground text-base tracking-tight">
                        {event.title}
                      </h4>
                      {event.detail ? (
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed bg-muted/30 p-3.5 rounded-lg border border-muted/40">
                          {event.detail}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground/70 italic pl-1">
                          ※詳細の登録はありません
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col border border-dashed border-muted rounded-xl bg-muted/20 p-6 text-center">
                <p className="text-sm text-muted-foreground font-medium">
                  この日の予定はありません
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
