"use client";

import * as React from "react";
// 💡 【修正】 BodyData をここから削除します
import { StaffCalendarResponse, EventItem } from "@/../../types/calendar";

// 💡 【追加】 元々 page.tsx にあった BodyData の定義をここに引っ越してきます
interface BodyData {
  title: string;
  detail: string;
  calendar_id?: number;
}

export function useCalendarData(token: string | undefined) {
  const [staffData, setStaffData] =
    React.useState<StaffCalendarResponse | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  // 1. 初回データ取得
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

  // 2. イベントの保存（新規・更新）処理
  const handleSaveEvent = React.useCallback(
    async (editingEvent: EventItem, editTitle: string, editDetail: string) => {
      if (!token) return;
      const isNew = editingEvent.id === 0;
      const url = isNew
        ? "/api/proxy/staff/event"
        : `/api/proxy/staff/event/${editingEvent.id}`;
      const method = isNew ? "POST" : "PATCH";

      const bodyData: BodyData = {
        title: editTitle,
        detail: editDetail,
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

      if (!res.ok) {
        if (res.status === 422) {
          const errorData = await res.json();
          alert(`保存できませんでした: ${JSON.stringify(errorData.errors)}`);
          return;
        }
        throw new Error("イベントの保存に失敗しました");
      }

      const resData = await res.json();

      // 💡 複雑なステート更新ロジックもフックの中に閉じ込める
      if (staffData && resData.event) {
        const updatedCalendar = staffData.calendar_data.map((day) => {
          if (day.id === editingEvent.calendar_id) {
            return {
              ...day,
              events: isNew
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
    },
    [token, staffData],
  );

  return {
    staffData,
    loading,
    handleSaveEvent,
  };
}
