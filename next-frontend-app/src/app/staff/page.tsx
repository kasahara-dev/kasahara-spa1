"use client";

import * as React from "react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import CalendarSection from "@/components/staff/CalendarSection";
import EventListCard from "@/components/staff/EventListCard";
import EventEditModal from "@/components/staff/EventEditModal";
import AttendanceListCard from "@/components/staff/AttendanceListCard";
import AttendanceEditModal from "@/components/staff/AttendanceEditModal";
import AttendanceCreateModal from "@/components/staff/AttendanceCreateModal";
import { useCalendarData } from "@/hooks/staff/useCalendarData";
import { AttendanceRecord, EventItem } from "@/../../types/calendar";

export default function Home() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const { data: session } = useSession();

  // 💡 フック側の関数がしっかり成功・失敗を処理してくれる前提へリファクタ
  const {
    staffData,
    loading,
    refreshData,
    handleSaveEvent,
    handleSaveAttendance,
    handleCreateAttendance,
  } = useCalendarData(session?.accessToken);

  // 状態管理（モーダルの開閉と選択データのみに集中）
  const [editingEvent, setEditingEvent] = React.useState<EventItem | null>(
    null,
  );
  const [selectedAttendance, setSelectedAttendance] =
    React.useState<AttendanceRecord | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // 💡 選択された日のデータ抽出（シンプルに一本化）
  const selectedDayData = React.useMemo(() => {
    if (!date || !staffData?.calendar_data) return null;
    const formattedTarget = format(date, "yyyy-MM-dd");
    return (
      staffData.calendar_data.find((day) => day.date === formattedTarget) ||
      null
    );
  }, [date, staffData]);

  // 💡 出欠データのリスト化ヘルパー（重複コードを共通化）
  const currentAttendances = React.useMemo(() => {
    if (!selectedDayData?.attendances) return [];
    return (
      Array.isArray(selectedDayData.attendances)
        ? selectedDayData.attendances
        : Object.values(selectedDayData.attendances)
    ) as AttendanceRecord[];
  }, [selectedDayData]);

  // 各ステータスの生徒一覧を綺麗にフィルタリング
  const absentStudents = React.useMemo(
    () => currentAttendances.filter((a) => a?.status === 1),
    [currentAttendances],
  );
  const lateStudents = React.useMemo(
    () => currentAttendances.filter((a) => a?.status === 2),
    [currentAttendances],
  );
  const registeredUserIds = React.useMemo(
    () => currentAttendances.map((a) => a.user_id),
    [currentAttendances],
  );

  // イベントクリック時のセットアップ
  const handleEventClick = (evt: EventItem) => {
    setEditingEvent(evt);
  };

  return (
    <main className="w-full p-6 space-y-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="flex flex-col space-y-6">
          {/* 日付選択セクション */}
          <div className="bg-white p-5 rounded-xl shadow-sm border">
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

          {/* イベントカード */}
          <EventListCard
            date={date}
            selectedDayData={selectedDayData}
            onSelectNewEvent={(initialData) => setEditingEvent(initialData)}
            onEventClick={(evt) => handleEventClick(evt as EventItem)}
          />
        </div>

        {/* 出欠カード */}
        <AttendanceListCard
          date={date}
          absentStudents={absentStudents}
          lateStudents={lateStudents}
          onAttendanceClick={(attendance) => setSelectedAttendance(attendance)}
          onNewAttendanceClick={() => setIsCreateModalOpen(true)}
        />
      </div>

      {/* 💡 各モーダルの記述が1行レベルに！重たい処理は全てコンポーネントへ移譲 */}
      {editingEvent && (
        <EventEditModal
          editingEvent={editingEvent}
          date={date}
          onClose={() => setEditingEvent(null)}
          onSave={handleSaveEvent} // フックの関数を直渡し
          onSuccess={refreshData}
        />
      )}

      {selectedAttendance && (
        <AttendanceEditModal
          attendance={selectedAttendance}
          date={date}
          onClose={() => setSelectedAttendance(null)}
          onSave={handleSaveAttendance} // フックの関数を直渡し
          onSuccess={refreshData}
        />
      )}

      {isCreateModalOpen && selectedDayData && (
        <AttendanceCreateModal
          date={date}
          groups={staffData?.groups || []} // 型定義が治ったので .map() は完全に不要に！
          groupCategories={staffData?.group_categories || {}}
          registeredUserIds={registeredUserIds}
          calendarId={selectedDayData.id} // モーダル側で payload を作れるように ID を渡す
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateAttendance} // フックの関数を直渡し
        />
      )}
    </main>
  );
}
