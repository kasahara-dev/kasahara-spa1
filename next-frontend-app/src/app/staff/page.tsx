"use client";

import * as React from "react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import CalendarSection from "@/components/staff/CalendarSection";
import EventListCard from "@/components/staff/EventListCard";
import EventEditModal from "@/components/staff/EventEditModal";
import AttendanceListCard from "@/components/staff/AttendanceListCard";
import { useCalendarData } from "@/hooks/staff/useCalendarData";
import { AttendanceRecord } from "@/../../types/calendar";
import { EventItem } from "@/../../types/calendar";
import AttendanceEditModal from "@/components/staff/AttendanceEditModal"

export default function Home() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const { data: session } = useSession();
  const token = session?.accessToken;

  const { staffData, setStaffData, loading, handleSaveEvent,handleSaveAttendance } =
    useCalendarData(token);

  const [editingEvent, setEditingEvent] = React.useState<EventItem | null>(
    null,
  );
  const [editTitle, setEditTitle] = React.useState("");
  const [editDetail, setEditDetail] = React.useState("");
  const [formErrors, setFormErrors] = React.useState<Record<string, string[]>>(
    {},
  );
  const [selectedAttendance, setSelectedAttendance] = React.useState<AttendanceRecord | null>(null);
  const [attendanceErrors, setAttendanceErrors] = React.useState<Record<string, string[]>>({});

  const handleEventClick = (evt: EventItem) => {
    setEditingEvent(evt);
    setEditTitle(evt.title || "");
    setEditDetail(evt.detail || "");
    setFormErrors({});
  };

  const onEventSaveClick = async () => {
    if (!editingEvent) return;
    try {
      setFormErrors({});
      const response = await handleSaveEvent({
        editingEvent: editingEvent,
        title: editTitle,
        detail: editDetail,
      });

      if (response.status === 200 || response.status === 201) {
        const resData = await response.json();
        if (staffData && resData.event) {
          const updatedCalendar = staffData.calendar_data.map((day) => {
            if (day.id === editingEvent.calendar_id) {
              return {
                ...day,
                events:
                  editingEvent.id === 0
                    ? [...day.events, resData.event]
                    : day.events.map((e) =>
                        e.id === editingEvent.id ? resData.event : e,
                      ),
              };
            }
            return day;
          });
          setStaffData({ ...staffData, calendar_data: updatedCalendar });
        }
        setEditingEvent(null);
        return;
      }

      if (response.status === 422) {
        const errorData = await response.json();
        setFormErrors(errorData.errors || {});
        return;
      }
      throw new Error();
    } catch (error) {
      console.error("送信エラー:", error);
      setFormErrors({
        global: ["保存に失敗しました。時間を置いて再度お試しください。"],
      });
    }
  };

  const selectedDayData = React.useMemo(() => {
    const calendarData = staffData?.calendar_data ?? [];
    if (!date || calendarData.length === 0) return null;
    const formattedTarget = format(date, "yyyy-MM-dd");
    const foundDay = calendarData.find((day) => day.date === formattedTarget) || null;
    return foundDay;
  }, [date, staffData]);

  const absentStudents = React.useMemo(() => {
    if (!selectedDayData || !selectedDayData.attendances) return [];
    const attendanceList = (
      Array.isArray(selectedDayData.attendances)
        ? selectedDayData.attendances
        : Object.values(selectedDayData.attendances)
    ) as AttendanceRecord[];
    return attendanceList.filter((a) => a && a.status === 1);
  }, [selectedDayData]);

  const lateStudents = React.useMemo(() => {
    if (!selectedDayData || !selectedDayData.attendances) return [];
    const attendanceList = (
      Array.isArray(selectedDayData.attendances)
        ? selectedDayData.attendances
        : Object.values(selectedDayData.attendances)
    ) as AttendanceRecord[];
    return attendanceList.filter((a) => a && a.status === 2);
  }, [selectedDayData]);

  return (
    <main className="w-full p-6 space-y-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="flex flex-col space-y-6">
          <div className="bg-white p-5  rounded-xl shadow-sm border">
            <h2 className="text-primary font-bold px-2">日付選択</h2>
            {loading || !staffData ? (
              <div className="h-64 flex items-center justify-center text-sm text-slate-400">
                読み込み中...
              </div>
            ) : (
              <CalendarSection
                apiUrl="/api/proxy/staff"
                staffData={staffData}
                selectedDate={date}
                onDateSelect={setDate}
              />
            )}
          </div>
          <EventListCard
            date={date}
            selectedDayData={selectedDayData}
            onSelectNewEvent={(initialData) => {
              setFormErrors({});
              setEditingEvent(initialData);
              setEditTitle("");
              setEditDetail("");
            }}
            onEventClick={(evt) => handleEventClick(evt as EventItem)}
          />
        </div>
        <AttendanceListCard
          date={date}
          absentStudents={absentStudents}
          lateStudents={lateStudents}
          onAttendanceClick={(attendance) => setSelectedAttendance(attendance)}
        />
      </div>

      {editingEvent && (
        <EventEditModal
          editingEvent={editingEvent}
          date={date}
          editTitle={editTitle}
          editDetail={editDetail}
          formErrors={formErrors}
          setEditTitle={setEditTitle}
          setEditDetail={setEditDetail}
          onClose={() => setEditingEvent(null)}
          onSave={onEventSaveClick}
        />
      )}
      {selectedAttendance && (
        <AttendanceEditModal
          attendance={selectedAttendance}
          date={date}
          formErrors={attendanceErrors}
          onClose={() => {
            setSelectedAttendance(null);
            setAttendanceErrors({}); // 💡 閉じるときはエラーをきれいに掃除する
          }}
          onSave={async (updatedData) => {
            try {
              setAttendanceErrors({});
              const payload = { ...selectedAttendance, ...updatedData };

              const response = await handleSaveAttendance(payload);

              // 💡 成功したらモーダルを閉じるだけでOK！
              // useCalendarDataの内部で勝手に fetchAllData() が走って画面が最新になります
              if (response && response.ok) {
                setSelectedAttendance(null);
                return;
              }

              if (response?.status === 422) {
                const errorJson = await response.json();
                const errorMsg =
                  errorJson.message ||
                  "入力内容に不備があります。確認してください。";
                setAttendanceErrors({ global: [errorMsg] });
                return;
              }

              setAttendanceErrors({ global: ["保存に失敗しました。"] });
            } catch (error) {
              console.error("出欠保存エラー:", error);
              setAttendanceErrors({ global: ["通信に失敗しました。"] });
            }
          }}
        />
      )}
    </main>
  );
}
