"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { ja } from "date-fns/locale";
import { parseISO, isWithinInterval } from "date-fns"; // isWithinIntervalを追加

interface CalendarApiResponse {
  config: {
    start_date: string;
    end_date: string;
  };
  calendar_data: Array<{
    date: string;
    working: number;
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
      month={month} // 現在表示する月を指定
      onMonthChange={setMonth} // 月を切り替えた時にステートを更新
      locale={ja}
      startMonth={minDate}
      endMonth={maxDate}
      disabled={[{ before: minDate, after: maxDate }, ...closedDays]}
      className="w-full"
      modifiers={{
        closed: closedDays,
      }}
      modifiersClassNames={{
        closed: "text-red-500 font-bold", // 赤字＆太字にする
      }}
    />
  );
}
