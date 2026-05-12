"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { ja } from "date-fns/locale";
import { parseISO, isWithinInterval, isSameDay } from "date-fns";

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
  }>;
}

export default function CalendarSection({ apiUrl }: { apiUrl: string }) {
  const [data, setData] = React.useState<CalendarApiResponse | null>(null);

  // 初期値は undefined にしておき、データ取得後に判定する
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  // カレンダーが「今何月を表示しているか」を管理するステート
  const [month, setMonth] = React.useState<Date>(new Date());

  React.useEffect(() => {
    fetch(apiUrl)
      .then((res) => res.json())
      .then((json: CalendarApiResponse) => {
        setData(json);

        const start = parseISO(json.config.start_date);
        const end = parseISO(json.config.end_date);
        const today = new Date();

        // 判定：今日が「開始日〜終了日」の間に入っているか？
        const isTodayInInterval = isWithinInterval(today, { start, end });

        if (isTodayInInterval) {
          // 期間内なら「今日」を表示・選択
          setMonth(today);
          setDate(today);
        } else {
          if (today > end) {
            setMonth(end);
            setDate(end);
          } else {
            // 期間外なら「開始日」を表示・選択
            setMonth(start);
            setDate(start);
          }
        }
      })
      .catch((err) => console.error("データ取得に失敗:", err));
  }, [apiUrl]);

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
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      month={month}
      onMonthChange={setMonth}
      locale={ja}
      startMonth={minDate}
      endMonth={maxDate}
      disabled={[{ before: minDate, after: maxDate }, ...closedDays]}
      className="w-full [&_th:nth-child(1)]:text-red-400/80 [&_th:nth-child(7)]:text-blue-400/80"
      // 1. 「イベントがある日」というグループ（modifier）を作る
      modifiers={{
        closed: closedDays,
        hasEvent: data.calendar_data
          .filter((d) => d.events && d.events.length > 0)
          .map((d) => parseISO(d.date)),
      }}
      // 2. そのグループに対して CSS クラスを割り当てる
      modifiersClassNames={{
        closed: "text-red-500 font-bold",
        // hasEvent クラスが付いたボタンに、擬似要素（after）でドットを表示させる
        hasEvent:
          "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-2 after:h-2 after:bg-primary after:rounded-full aria-selected:after:bg-primary-foreground",
      }}
    />
  );
}