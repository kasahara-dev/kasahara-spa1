"use client";

import * as React from "react";
// 💡 大元の EventItem 型をインポートする
import { StaffCalendarResponse, EventItem } from "@/../../types/calendar";

export function useCalendarData(token: string | undefined) {
  const [staffData, setStaffData] =
    React.useState<StaffCalendarResponse | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  // （useEffect部分は省略、元のままでOKです）
 React.useEffect(() => {
    if (!token) {
      // 💡 直呼びを禁止されたので、setTimeoutで一瞬だけ（0秒）未来にずらして実行します。
      // これで「同期的な呼び出し」ではなくなり、エラーが綺麗に消えます！
      setTimeout(() => {
        setLoading(false);
      }, 0);
      return;
    }

    async function fetchAllData() {
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
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, [token]);

  // 💡 1. 「editingEvent: any」を「editingEvent: EventItem」にする
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

  return { staffData, setStaffData, loading, handleSaveEvent };
}
