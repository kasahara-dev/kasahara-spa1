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
import Loading from "@/components/Loading"

export default function Home() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const { data: session } = useSession();

  const {
    staffData,
    loading,
    refreshData,
    handleSaveEvent,
    handleSaveAttendance,
    handleCreateAttendance,
    formErrors,
    setFormErrors,
  } = useCalendarData(session?.accessToken);

  const [editingEvent, setEditingEvent] = React.useState<EventItem | null>(
    null,
  );
  const [selectedAttendance, setSelectedAttendance] =
    React.useState<AttendanceRecord | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  const selectedDayData = React.useMemo(() => {
    if (!date || !staffData?.calendar_data) return null;
    const formattedTarget = format(date, "yyyy-MM-dd");
    return (
      staffData.calendar_data.find((day) => day.date === formattedTarget) ||
      null
    );
  }, [date, staffData]);

  const working = selectedDayData?.working == 1 ? 1 : 0;

  const currentAttendances = React.useMemo(() => {
    if (!selectedDayData?.attendances) return [];
    return (
      Array.isArray(selectedDayData.attendances)
        ? selectedDayData.attendances
        : Object.values(selectedDayData.attendances)
    ) as AttendanceRecord[];
  }, [selectedDayData]);

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

  const handleEventClick = (evt: EventItem) => {
    setEditingEvent(evt);
  };

  const isAnyModalOpen = !!(
    editingEvent ||
    selectedAttendance ||
    isCreateModalOpen
  );

  return (
    <main className="w-full p-6 pb-20 space-y-6 relative">
      <div
        inert={isAnyModalOpen ? true : undefined}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
      >
        <div className="flex flex-col space-y-6">
          {/* 日付選択セクション */}
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <h2 className="text-primary font-bold px-2">日付選択</h2>
            {loading || !staffData ? (
              <Loading />
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
            isLoading={loading}
          />
        </div>

        {/* 出欠カード */}
        <AttendanceListCard
          date={date}
          working={working}
          absentStudents={absentStudents}
          lateStudents={lateStudents}
          onAttendanceClick={(attendance) => setSelectedAttendance(attendance)}
          onNewAttendanceClick={() => setIsCreateModalOpen(true)}
          isLoading={loading}
        />
      </div>

      {editingEvent && (
        <EventEditModal
          editingEvent={editingEvent}
          date={date}
          onClose={() => setEditingEvent(null)}
          onSave={handleSaveEvent}
          onSuccess={refreshData}
        />
      )}

      {selectedAttendance && (
        <AttendanceEditModal
          attendance={selectedAttendance}
          date={date}
          working={working}
          onClose={() => {
            setSelectedAttendance(null);
            setFormErrors({});
          }}
          formErrors={formErrors}
          onSave={handleSaveAttendance}
          onSuccess={refreshData}
        />
      )}

      {isCreateModalOpen && selectedDayData && (
        <AttendanceCreateModal
          date={date}
          groups={staffData?.groups || []}
          groupCategories={staffData?.group_categories || {}}
          registeredUserIds={registeredUserIds}
          calendarId={selectedDayData.id}
          formErrors={formErrors}
          working={selectedDayData.working}
          onClose={() => {
            setIsCreateModalOpen(false);
            setFormErrors({});
          }}
          onSave={handleCreateAttendance}
        />
      )}
    </main>
  );
}
