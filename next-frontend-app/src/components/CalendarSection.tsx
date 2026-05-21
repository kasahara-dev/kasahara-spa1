"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ja } from "date-fns/locale";
import { parseISO, isWithinInterval,format } from "date-fns";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";
const isPastDeadline = (
  targetDateStr: string,
  deadlineTime: string,
): boolean => {
  const jstString = new Date().toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
  });
  const now = new Date(jstString);
  const deadline = new Date(`${targetDateStr}T${deadlineTime}`);

  return now > deadline;
};

interface CalendarEvent {
  id: number;
  title: string;
  detail?: string | null;
}
interface CalendarApiResponse {
  config: {
    start_date: string;
    end_date: string;
    deadline_time: string;
  };

  calendar_data: Array<{
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
  }>;
}

export default function CalendarSection({ apiUrl }: { apiUrl: string }) {
  const [data, setData] = React.useState<CalendarApiResponse | null>(null);
  const { data: session } = useSession();

  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [month, setMonth] = React.useState<Date>(new Date());

  const token = session?.accessToken;
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const [formStatus, setFormStatus] = React.useState<number>(0); // 0=出席, 1=欠席, 2=遅刻その他
  const [formDetail, setFormDetail] = React.useState<string>("");

  React.useEffect(() => {
    if (!token) return;
    fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`エラーが発生しました: ${res.status}`);
        }
        return res.json();
      })
      .then((json: CalendarApiResponse) => {
        setData(json);

        const start = parseISO(json.config.start_date);
        const end = parseISO(json.config.end_date);
        const today = new Date();
        const isTodayInInterval = isWithinInterval(today, { start, end });

        if (isTodayInInterval) {
          setMonth(today);
          setDate(today);
        } else {
          if (today > end) {
            setMonth(end);
            setDate(end);
          } else {
            setMonth(start);
            setDate(start);
          }
        }
      })
      .catch((err) => console.error("データ取得に失敗:", err));
  }, [apiUrl, token]);
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!data || !selectedDate) return;

    const targetDateStr = format(selectedDate, "yyyy-MM-dd");
    const dayData = data.calendar_data.find(
      (item) => item.date === targetDateStr,
    );

    // 休みの日、または期間外なら中断
    const isClosed = dayData?.working === 0;
    const start = parseISO(data.config.start_date);
    const end = parseISO(data.config.end_date);
    const isOutOfInterval = !isWithinInterval(selectedDate, { start, end });
    if (isClosed || isOutOfInterval) return;

    // 💡 モーダルを開く前に、現在の出欠データをフォームの初期値にセットする
    const currentStatus = dayData?.attendance?.status ?? 0; // 無い場合は 0（出席）
    const currentDetail = dayData?.attendance?.detail ?? ""; // 無い場合は 空文字
    setFormStatus(currentStatus);
    setFormDetail(currentDetail);

    setDate(selectedDate);
    setIsModalOpen(true);
  };

  if (!data)
    return (
      <div className="text-chic-gray-sub p-4 text-center">読み込み中...</div>
    );

  const closedDays = data.calendar_data
    .filter((item) => item.working === 0)
    .map((item) => parseISO(item.date));

  const minDate = parseISO(data.config.start_date);
  const maxDate = parseISO(data.config.end_date);

  return (
    <>
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateSelect}
        month={month}
        onMonthChange={setMonth}
        locale={ja}
        startMonth={minDate}
        endMonth={maxDate}
        disabled={[{ before: minDate, after: maxDate }, ...closedDays]}
        className="w-full [&_th:nth-child(1)]:text-red-400/80 [&_th:nth-child(7)]:text-blue-400/80"
        modifiers={{
          closed: closedDays,
          hasEvent: data.calendar_data
            .filter((d) => d.events && d.events.length > 0)
            .map((d) => parseISO(d.date)),
          absent: data.calendar_data
            .filter((d) => d.attendance?.status === 1)
            .map((d) => parseISO(d.date)),
          late: data.calendar_data
            .filter((d) => d.attendance?.status === 2)
            .map((d) => parseISO(d.date)),
        }}
        modifiersClassNames={{
          closed: "text-red-500 font-bold",
          absent:
            "relative before:content-['×'] before:absolute before:inset-0 before:flex before:items-center before:justify-center before:text-[28px] before:text-red-500 before:pointer-events-none before:font-bold",
          late: "relative before:content-['△'] before:absolute before:inset-0 before:flex before:items-center before:justify-center before:text-[28px] before:text-red-500 before:pointer-events-none before:font-bold",
          hasEvent:
            "relative after:content-[''] after:absolute after:bottom-1 md:after:bottom-3 after:left-1/2 after:-translate-x-1/2 after:w-2 after:h-2 after:bg-primary after:rounded-full aria-selected:after:bg-primary-foreground",
        }}
      />
      {isModalOpen &&
        date &&
        (() => {
          const formattedDate = format(date, "M月d日", { locale: ja });
          const targetDateStr = format(date, "yyyy-MM-dd");
          const dayData = data.calendar_data.find(
            (item) => item.date === targetDateStr,
          );
          const attendance = dayData?.attendance;

          let statusText = "出席";
          let statusColor =
            "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30";
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
            <div className="fixed inset-x-0 bottom-0 top-[64px] z-40 bg-parent-soft overflow-y-auto">
              <div className="sticky top-0 z-10 bg-parent-soft border-b border-muted">
                <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-end">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="max-w-2xl mx-auto px-6 py-6 space-y-8 flex flex-col">
                {/* セクション1: 現在の出欠予定 */}
                <section className="space-y-2">
                  <h3 className="underline text-primary font-bold text-lg">
                    {formattedDate}の出欠予定
                  </h3>
                  <div className="">
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

                {/* セクション2: 出欠予定変更 */}
                <section className="space-y-4">
                  <h3 className="underline text-primary font-bold text-lg">
                    {formattedDate}の出欠予定変更
                  </h3>
                  {(() => {
                    const deadlineTime = data.config.deadline_time ?? "08:00";
                    const isExpired = isPastDeadline(
                      targetDateStr,
                      deadlineTime,
                    );

                    return (
                      <div className="bg-background border border-muted p-4 rounded-xl space-y-4">
                        <RadioGroup
                          value={String(formStatus)}
                          onValueChange={(value) =>
                            setFormStatus(Number(value))
                          }
                          className="flex items-center gap-6"
                          disabled={isExpired}
                        >
                          {[
                            { label: "出席", value: 0 },
                            { label: "欠席", value: 1 },
                            { label: "遅刻その他", value: 2 },
                          ].map((item) => (
                            <div
                              key={item.value}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={String(item.value)}
                                id={`status-${item.value}`}
                                disabled={isExpired}
                              />
                              <Label
                                htmlFor={`status-${item.value}`}
                                className={`font-medium ${isExpired ? "cursor-not-allowed text-muted-foreground" : "cursor-pointer"}`}
                              >
                                {item.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>

                        {formStatus === 2 && (
                          <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                            <label className="text-xs text-muted-foreground font-medium">
                              詳細を入力してください
                            </label>
                            <input
                              type="text"
                              value={formDetail}
                              onChange={(e) => setFormDetail(e.target.value)}
                              placeholder="通院のため、10時ごろ登園します"
                              disabled={isExpired}
                              className="w-full px-3 py-2 text-sm bg-parent-soft border border-muted rounded-lg focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>
                        )}

                        <div className="pt-2 space-y-3">
                          <Button
                            type="button"
                            disabled={isExpired}
                            onClick={() =>
                              alert(
                                `ステータス: ${formStatus}, 詳細: ${formDetail} で保存します`,
                              )
                            }
                            className="w-full md:w-48 font-medium"
                          >
                            変更を保存する
                          </Button>

                          <p className="text-red-500 text-xs sm:text-sm font-medium leading-relaxed">
                            ※アプリでの出欠予定変更は当日{deadlineTime}
                            まで可能です
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </section>

                {/* 💡 【復活】セクション3: 園の予定（イベント一覧） */}
                <section className="space-y-4">
                  <h3 className="underline text-primary font-bold text-lg">
                    {formattedDate}の予定
                  </h3>
                  <div className="pt-1">
                    {dayData && dayData.events && dayData.events.length > 0 ? (
                      <div className="space-y-4">
                        {dayData.events.map((event) => (
                          /* 💡 ここを shadcn の Card に置き換え */
                          <Card
                            key={event.id}
                            className="relative overflow-hidden shadow-sm"
                          >
                            {/* 左端のアクセントカラー線はそのままキープ */}
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />

                            {/* CardContent でパディング（p-5相当）を確保 */}
                            <CardContent className="p-5 pl-7 space-y-3">
                              {/* イベントタイトル */}
                              <h4 className="font-bold text-foreground text-base tracking-tight">
                                {event.title}
                              </h4>

                              {/* 詳細（detail）の表示 */}
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
                      /* 予定がないときの表示（変更なし） */
                      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-muted rounded-xl bg-muted/20 text-center">
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
        })()}
    </>
  );
}