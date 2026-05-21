"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { ja } from "date-fns/locale";
import { parseISO, isWithinInterval,format } from "date-fns";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
}
interface CalendarApiResponse {
  config: {
    start_date: string;
    end_date: string;
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
    const isClosed = data.calendar_data.some(
      (item) =>
        item.date === format(selectedDate, "yyyy-MM-dd") && item.working === 0,
    );

    const start = parseISO(data.config.start_date);
    const end = parseISO(data.config.end_date);
    const isOutOfInterval = !isWithinInterval(selectedDate, { start, end });
    if (isClosed || isOutOfInterval) return;

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
                <section className="space-y-2">
                  <h3 className="underline text-primary font-bold text-lg">
                    {formattedDate}の出欠予定
                  </h3>
                  <p className="text-sm text-foreground pt-1">
                    出席or欠席or遅刻その他が表示される
                  </p>
                </section>
                <section className="space-y-2">
                  <h3 className="underline text-primary font-bold text-lg">
                    {formattedDate}の出欠予定変更
                  </h3>
                  <div className="text-sm text-muted-foreground pt-1">
                    フォームを配置予定
                  </div>
                </section>
                <section className="space-y-2">
                  <h3 className="underline text-primary font-bold text-lg">
                    {formattedDate}の予定
                  </h3>
                  <div className="text-sm text-muted-foreground pt-1">
                    イベントの一覧を配置予定
                  </div>
                </section>
              </div>
            </div>
          );
        })()}
    </>
  );
}