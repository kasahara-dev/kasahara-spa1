"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { ja } from "date-fns/locale";
import { parseISO, isWithinInterval, format } from "date-fns";
import { useSession } from "next-auth/react";
import { AttendanceModal } from "./AttendanceModal";

interface CalendarEvent {
  id: number;
  title: string;
  detail?: string | null;
}

// 💡 ユーザーは1日1つしか持たないので、データ構造を「単数形」として扱えるように
// APIの生データ（attendances配列）を内包した型定義にします
interface CalendarApiResponse {
  config: { start_date: string; end_date: string; deadline_time: string };
  calendar_data: Array<{
    id: number;
    date: string;
    working: number;
    events: CalendarEvent[];
    // APIから届く生の配列（※中身は最大1件）
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
  const [data, setData] = React.useState<CalendarApiResponse | null>(null);
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [month, setMonth] = React.useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const [isSaving, setIsSaving] = React.useState(false);
  const [submitMessage, setSubmitMessage] = React.useState<string>("");
  const [submitMessageType, setSubmitMessageType] = React.useState<
    "success" | "error" | ""
  >("");

  const fetchCalendarData = React.useCallback(() => {
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

  React.useEffect(() => {
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

    // 💡 配列の0番目（あったら1つだけ）を「その日の出欠」として安全に特定
    const existingAttendance = dayData?.attendances?.[0];
    const calendarId = dayData?.id || existingAttendance?.calendar_id;
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
    } | null = null;

    if (formStatus === 0) {
      if (!calendarId)
        return setFormError("カレンダーIDが特定できないため、削除できません");
      requestUrl = `${baseUrl}/${calendarId}`;
      requestMethod = "DELETE";
    } else {
      if (hasExistingAttendance && !calendarId)
        return setFormError("カレンダーIDが特定できないため、更新できません");
      if (hasExistingAttendance) {
        requestUrl = `${baseUrl}/${calendarId}`;
        requestMethod = "PUT";
      }
      requestBody = {
        calendar_id: calendarId,
        status: formStatus,
        detail: formStatus === 2 ? formDetail : "",
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
    if (!data || !selectedDate) return;

    const targetDateStr = format(selectedDate, "yyyy-MM-dd");
    const dayData = data.calendar_data.find(
      (item) => item.date === targetDateStr,
    );
    const isClosed = dayData?.working === 0;
    const start = parseISO(data.config.start_date);
    const end = parseISO(data.config.end_date);

    if (isClosed || !isWithinInterval(selectedDate, { start, end })) return;

    setSubmitMessage("");
    setSubmitMessageType("");
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

  // 💡 ユーザーが言う通り、本質は「持っていない場合（null）もある単数形（attendance?）」！
  // 配列の歪みをここで吸収し、モーダルには綺麗なオブジェクト型にして渡します。
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
          // 💡 オプショナルチェイニング `?.` を駆使して、データを持たない日（配列がない・空）でも絶対にクラッシュしない安全なフィルター！
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
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveAttendance}
        />
      )}
    </>
  );
}
