// hooks/useStaffCalendar.ts
import * as React from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import {
  StaffCalendarResponse,
  AttendanceRecord,
  EventItem,
} from "@/../types/calendar"; // 💡型も1箇所にまとめると◎

export function useStaffCalendar() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [staffData, setStaffData] =
    React.useState<StaffCalendarResponse | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [editingEvent, setEditingEvent] = React.useState<EventItem | null>(
    null,
  );
  const [editTitle, setEditTitle] = React.useState("");
  const [editDetail, setEditDetail] = React.useState("");

  // データ取得ロジック (useEffect)
  React.useEffect(() => {
    if (!token) return;
    async function fetchAllData() {
      try {
        const res = await fetch("/api/proxy/staff", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const data: StaffCalendarResponse = await res.json();
        setStaffData(data);
      } catch (error) {
        console.error("スタッフデータ取得エラー:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  }, [token]);

  const calendarData = staffData?.calendar_data ?? [];

  // データ加工ロジック (useMemo)
  const selectedDayData = React.useMemo(() => {
    if (!date || calendarData.length === 0) return null;
    const formattedTarget = format(date, "yyyy-MM-dd");
    return calendarData.find((day) => day.date === formattedTarget) || null;
  }, [date, calendarData]);

  const absentStudents = React.useMemo(() => {
    if (!selectedDayData || !selectedDayData.attendance) return [];
    const attendanceList = (
      Array.isArray(selectedDayData.attendance)
        ? selectedDayData.attendance
        : Object.values(selectedDayData.attendance)
    ) as AttendanceRecord[];
    return attendanceList.filter((a) => a && a.status === 2);
  }, [selectedDayData]);

  const lateStudents = React.useMemo(() => {
    if (!selectedDayData || !selectedDayData.attendance) return [];
    const attendanceList = (
      Array.isArray(selectedDayData.attendance)
        ? selectedDayData.attendance
        : Object.values(selectedDayData.attendance)
    ) as AttendanceRecord[];
    return attendanceList.filter((a) => a && a.status === 3);
  }, [selectedDayData]);

  const handleEventClick = (evt: EventItem) => {
    setEditingEvent(evt);
    setEditTitle(evt.title || "");
    setEditDetail(evt.detail || "");
  };

  const handleSaveEvent = async () => {
    // ...既存の保存処理...
  };

  return {
    date,
    setDate,
    staffData,
    loading,
    editingEvent,
    setEditingEvent,
    editTitle,
    setEditTitle,
    editDetail,
    setEditDetail,
    selectedDayData,
    absentStudents,
    lateStudents,
    handleEventClick,
    handleSaveEvent,
  };
}
