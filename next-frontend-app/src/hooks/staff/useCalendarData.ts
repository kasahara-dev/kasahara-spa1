"use client";

import * as React from "react";
import {
  StaffCalendarResponse,
  EventItem,
  AttendanceRecord,
} from "@/../../types/calendar";

export function useCalendarData(token: string | undefined) {
  const [staffData, setStaffData] =
    React.useState<StaffCalendarResponse | null>(null);

  // 💡 状態は引き続きシンプルに派生させます
  const loading = !!token && !staffData;

  // 💡 データの取得関数
  const fetchAllData = React.useCallback(async () => {
    if (!token) return;

    try {
      const res = await fetch("/api/proxy/staff", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("データの取得に失敗しました");
      }

      const data: StaffCalendarResponse = await res.json();
      setStaffData(data);
    } catch (error) {
      console.error("スタッフデータ取得エラー:", error);
    }
  }, [token]);
  React.useEffect(() => {
    if (!token) return;
    Promise.resolve().then(() => {
      void fetchAllData();
    });

    const intervalId = setInterval(() => {
      void fetchAllData();
    }, 60000);

    return () => {
      clearInterval(intervalId);
    };
  }, [token, fetchAllData]);

  const handleSaveEvent = async ({
    editingEvent,
    title,
    detail,
  }: {
    editingEvent: EventItem;
    title: string;
    detail: string;
  }) => {
    const isNew = editingEvent.id === 0;
    const url = isNew
      ? "/api/proxy/staff/event"
      : `/api/proxy/staff/event/${editingEvent.id}`;
    const method = isNew ? "POST" : "PATCH";

    const bodyData: {
      title: string;
      detail: string;
      calendar_id?: number | string;
    } = {
      title: title,
      detail: detail,
    };
    if (isNew) {
      bodyData.calendar_id = editingEvent.calendar_id;
    }
    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyData),
    });
    return res;
  };

  const handleSaveAttendance = async (
    updatedData: AttendanceRecord & {
      status: number;
      detail: string | null;
      user_id?: number | string;
      calendar_id?: number | string;
    },
  ) => {
    if (!token) return;

    const isDelete = updatedData.status === 0;
    const url = `/api/proxy/staff/attendance/${updatedData.id}`;
    const method = isDelete ? "DELETE" : "PATCH";

    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: isDelete
        ? null
        : JSON.stringify({
            status: updatedData.status,
            detail: updatedData.detail,
            user_id: updatedData.user_id,
            calendar_id: updatedData.calendar_id,
          }),
    });

    if (res.ok) {
      void fetchAllData();
    }
    return res;
  };
  const handleCreateAttendance = async (bodyData: {
    status: number;
    detail: string | null;
    user_id: number;
    calendar_id: number;
  }) => {
    if (!token) return;
    const res = await fetch("/api/proxy/staff/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyData),
    });
    if (res.ok) {
      void fetchAllData();
    }
    return res;
  };

  return {
    staffData,
    setStaffData,
    loading,
    handleSaveEvent,
    handleSaveAttendance,
    handleCreateAttendance,
  };
}
