"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { ja } from "date-fns/locale";
import { parseISO, isWithinInterval, format } from "date-fns";
import { useSession } from "next-auth/react";
import Loading from "@/components/Loading";
import { AttendanceModal } from "./AttendanceModal";

interface CalendarEvent {
  id: number;
  title: string;
  detail?: string | null;
}

interface CalendarApiResponse {
  config: { start_date: string; end_date: string; deadline_time: string };
  calendar_data: Array<{
    id: number;
    date: string;
    working: number;
    events: CalendarEvent[];
    attendances?: Array<{
      id: number;
      status: number;
      user_id: number;
      calendar_id: number;
      detail?: string | null;
    }> | null;
  }>;
}

export default function CalendarSection({ apiUrl }: { apiUrl: string }) {
  const [data, setData] = useState<CalendarApiResponse | null>(null);
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [month, setMonth] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isSaving, setIsSaving] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [submitMessageType, setSubmitMessageType] = useState<
    "success" | "error" | ""
  >("");

  const fetchCalendarData = useCallback(() => {
    if (!token) return;
    fetch(apiUrl, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`エラー: ${res.status}`);
        return res.json();
      })
      .then((json: CalendarApiResponse) => {
        setData(json);
        setDate((prev) => {
          if (prev) return prev;
          const start = parseISO(json.config.start_date);
          const end = parseISO(json.config.end_date);
          const today = new Date();
          if (isWithinInterval(today, { start, end })) return today;
          return today > end ? end : start;
        });
      })
      .catch((err) => console.error("データ取得に失敗:", err));
  }, [apiUrl, token]);

  useEffect(() => {
    const handleLogoClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a[href="/"]') || target.closest('a[href="/staff"]')) {
        // 💡 ブラウザのクリックイベント発信なので、Reactに絶対に怒られません
        setIsModalOpen(false);
        setDate(undefined);
        setSubmitMessage("");
        setSubmitMessageType("");
      }
    };

    window.addEventListener("click", handleLogoClick);
    return () => window.removeEventListener("click", handleLogoClick);
  }, []);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const handleSaveAttendance = async (
    formStatus: number,
    formDetail: string,
  ) => {
    if (!token || !date || !data) return;

    setSubmitMessage("");
    setSubmitMessageType("");

    if (formStatus === 2 && !formDetail.trim()) {
      setSubmitMessage("詳細を入力してください");
      setSubmitMessageType("error");
      return;
    }

    const targetDateStr = format(date, "yyyy-MM-dd");
    const dayData = data.calendar_data.find(
      (item) => item.date === targetDateStr,
    );

    const existingAttendance = dayData?.attendances?.[0];
    const calendarId = dayData?.id || existingAttendance?.calendar_id;
    const attendanceId = existingAttendance?.id;
    const hasExistingAttendance = !!existingAttendance;

    const baseUrl = apiUrl.endsWith("/")
      ? `${apiUrl}attendance`
      : `${apiUrl}/attendance`;
    let requestUrl = baseUrl;
    let requestMethod = "POST";
    let requestBody: {
      calendar_id: number | undefined;
      status: number;
      detail: string;
      working: number | 0;
    } | null = null;

    if (formStatus === 0) {
      if (!attendanceId) {
        setFormError("カレンダーIDが特定できないため、削除できません");
        return;
      }
      requestUrl = `${baseUrl}/${attendanceId}`;
      requestMethod = "DELETE";
    } else {
      if (hasExistingAttendance && !calendarId) {
        setFormError("カレンダーIDが特定できないため、更新できません");
        return;
      }
      if (hasExistingAttendance) {
        requestUrl = `${baseUrl}/${attendanceId}`;
        requestMethod = "PUT";
      }
      requestBody = {
        calendar_id: calendarId,
        status: formStatus,
        detail: formStatus === 2 ? formDetail : "",
        working: dayData ? dayData.working : 0,
      };
    }

    setIsSaving(true);
    try {
      const response = await fetch(requestUrl, {
        method: requestMethod,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: requestBody ? JSON.stringify(requestBody) : null,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || "保存に失敗しました");
      }

      const result = await response.json();
      setSubmitMessage(result.message || "出欠予定を保存しました");
      setSubmitMessageType("success");
      fetchCalendarData();
    } catch (error) {
      setSubmitMessage(
        `エラー: ${error instanceof Error ? error.message : "未知のエラー"}`,
      );
      setSubmitMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };



  const setFormError = (msg: string) => {
    setSubmitMessage(msg);
    setSubmitMessageType("error");
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!data) return;
    const targetDate = selectedDate || date;
    if (!targetDate) return;

    const targetDateStr = format(targetDate, "yyyy-MM-dd");
    const dayData = data.calendar_data.find(
      (item) => item.date === targetDateStr,
    );
    const isClosed = dayData?.working === 0;
    const start = parseISO(data.config.start_date);
    const end = parseISO(data.config.end_date);

    if (isClosed || !isWithinInterval(targetDate, { start, end })) return;

    setSubmitMessage("");
    setSubmitMessageType("");
    setDate(targetDate);
    setIsModalOpen(true);
  };

  if (!data) return <Loading />;

  const closedDays = data.calendar_data
    .filter((item) => item.working === 0)
    .map((item) => parseISO(item.date));
  const minDate = parseISO(data.config.start_date);
  const maxDate = parseISO(data.config.end_date);
  const rawDayData = data.calendar_data.find(
    (item) => item.date === (date ? format(date, "yyyy-MM-dd") : ""),
  );
  const selectedDayData = rawDayData
    ? {
        ...rawDayData,
        attendance: rawDayData.attendances?.[0] || null,
      }
    : undefined;

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
            .filter((d) => d.attendances && d.attendances?.[0]?.status === 1)
            .map((d) => parseISO(d.date)),
          late: data.calendar_data
            .filter((d) => d.attendances && d.attendances?.[0]?.status === 2)
            .map((d) => parseISO(d.date)),
        }}
        modifiersClassNames={{
          closed: "text-red-500 font-bold",
          absent:
            "relative isolate z-10 before:content-['×'] before:absolute before:inset-0 before:flex before:items-center before:justify-center before:text-[28px] before:text-red-500 before:pointer-events-none before:font-bold",
          late: "relative isolate z-10 before:content-['△'] before:absolute before:inset-0 before:flex before:items-center before:justify-center before:text-[28px] before:text-red-500 before:pointer-events-none before:font-bold",
          hasEvent:
            "relative after:content-[''] after:absolute after:bottom-1 md:after:bottom-3 after:left-1/2 after:-translate-x-1/2 after:w-2 after:h-2 after:bg-primary after:rounded-full aria-selected:after:bg-primary-foreground",
        }}
      />

      {isModalOpen && date && (
        <AttendanceModal
          date={date}
          dayData={selectedDayData}
          deadlineTime={data.config.deadline_time ?? "08:00"}
          isSaving={isSaving}
          submitMessage={submitMessage}
          submitMessageType={submitMessageType}
          onClose={() => {
            setDate(undefined);
            setIsModalOpen(false);
            setSubmitMessage("");
            setSubmitMessageType("");
          }}
          onSave={handleSaveAttendance}
          onStatusChange={() => {
            setSubmitMessage("");
            setSubmitMessageType("");
          }}
        />
      )}
    </>
  );
}
