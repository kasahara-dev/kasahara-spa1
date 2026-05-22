"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { ja } from "date-fns/locale";
import { parseISO, isWithinInterval, format } from "date-fns";
import { useSession } from "next-auth/react";

interface SharedCalendarDay {
  date: string;
  working: number;
  events?: Array<{ id: number; title: string }> | null;
}

interface SharedCalendarResponse {
  config: {
    start_date: string;
    end_date: string;
  };
  calendar_data: SharedCalendarDay[];
}

interface CalendarSectionProps {
  apiUrl: string;
  staffData?: SharedCalendarResponse | null;
  selectedDate?: Date;
  onDateSelect?: (date: Date | undefined) => void;
}

export default function CalendarSection({
  apiUrl,
  staffData,
  selectedDate,
  onDateSelect,
}: CalendarSectionProps) {
  const [internalData, setInternalData] =
    React.useState<SharedCalendarResponse | null>(null);
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    undefined,
  );
  const [month, setMonth] = React.useState<Date>(new Date());
  const data = staffData || internalData;
  const date = selectedDate !== undefined ? selectedDate : internalDate;
  const setDate = onDateSelect || setInternalDate;

  const fetchCalendarData = React.useCallback(() => {
    if (staffData || !token) return;

    fetch(apiUrl, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`エラー: ${res.status}`);
        return res.json();
      })
      .then((json: SharedCalendarResponse) => {
        setInternalData(json);
        setInternalDate((prev) => {
          if (prev) return prev;
          const start = parseISO(json.config.start_date);
          const end = parseISO(json.config.end_date);
          const today = new Date();
          if (isWithinInterval(today, { start, end })) return today;
          return today > end ? end : start;
        });
      })
      .catch((err) => console.error("データ取得に失敗:", err));
  }, [apiUrl, token, staffData]);

  React.useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  if (!data)
    return (
      <div className="text-slate-400 p-4 text-center text-sm">
        読み込み中...
      </div>
    );

  const minDate = parseISO(data.config.start_date);
  const maxDate = parseISO(data.config.end_date);

  const closedDays = data.calendar_data
    .filter((item) => item.working === 0)
    .map((item) => parseISO(item.date));

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const targetDateStr = format(date, "yyyy-MM-dd");

    const dayData = data.calendar_data.find(
      (item) => item.date === targetDateStr,
    );
    if (dayData?.working === 0) return;

    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  return (
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
      }}
      modifiersClassNames={{
        closed: "text-red-500 font-bold rounded-md",
        hasEvent:
          "relative after:content-[''] after:absolute after:bottom-1 md:after:bottom-3 after:left-1/2 after:-translate-x-1/2 after:w-2 after:h-2 after:bg-primary after:rounded-full aria-selected:after:bg-primary-foreground",
      }}
    />
  );
}
