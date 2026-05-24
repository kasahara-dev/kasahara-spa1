"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { useSession } from "next-auth/react";
import CalendarSection from "@/components/staff/CalendarSection";
import EventListCard from "@/components/staff/EventListCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  StaffCalendarResponse,
  AttendanceRecord,
} from "@/../../types/calendar";
import { Button } from "@/components/ui/button";

// 💡 イベント型をローカルで扱いやすいように定義（またはimport元に合わせてください）
interface EventItem {
  id: string | number;
  title: string;
  detail: string;
  calendar_id?: number;
  updated_at?: string;
  editor_id?: string | number;
  editor?: {
    id: string | number;
    name: string;
  };
}
interface BodyData {
  title: string;
  detail: string;
  calendar_id?: number;
}

export default function Home() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [staffData, setStaffData] =
    React.useState<StaffCalendarResponse | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const { data: session } = useSession();
  const token = session?.accessToken;

  // 💡 モーダル管理用のステート
  const [editingEvent, setEditingEvent] = React.useState<EventItem | null>(
    null,
  );
  const [editTitle, setEditTitle] = React.useState("");
  const [editDetail, setEditDetail] = React.useState("");

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

  // 💡 行事クリック時のハンドラー
  const handleEventClick = (evt: EventItem) => {
    setEditingEvent(evt);
    setEditTitle(evt.title || "");
    setEditDetail(evt.detail || "");
  };

  // 💡 保存処理（仮）
  const handleSaveEvent = async () => {
    
    if (!editingEvent) return;

    // 💡 新規作成か更新かを見分けるフラグ
    const isNew = editingEvent.id === 0;

    try {
      // 💡 IDによってURLとメソッドを自動で切り替える
      const url = isNew
        ? "/api/proxy/staff/event" // 新規登録のURL
        : `/api/proxy/staff/event/${editingEvent.id}`; // 更新のURL

      const method = isNew ? "POST" : "PATCH"; // 💡 ルートでPUTにしている場合はここを "PUT" にしてください

      // 💡 新規登録の時は、Laravel側で必須にしている `calendar_id` も一緒に送る必要があります
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
          console.error("❌ バリデーションエラー:", errorData);
          alert(`保存できませんでした: ${JSON.stringify(errorData.errors)}`);
          return;
        }
        throw new Error("イベントの保存に失敗しました");
      }

      const resData = await res.json(); // Laravelから最新のeventデータが返ってくる想定

      // 💡 ステート（画面）の更新処理
      if (staffData && resData.event) {
        const updatedCalendar = staffData.calendar_data.map((day) => {
          // 対象の日のカレンダーデータを探す
          if (day.id === editingEvent.calendar_id) {
            return {
              ...day,
              events: isNew
                ? [...day.events, resData.event] // 💡 新規なら、配列の末尾に新イベントを追加
                : day.events.map((e) =>
                    e.id === editingEvent.id ? resData.event : e,
                  ), // 更新
            };
          }
          return day;
        });
        setStaffData({ ...staffData, calendar_data: updatedCalendar });
      }

      setEditingEvent(null);
    } catch (error) {
      console.error("エラー:", error);
      alert("保存中にエラーが発生しました。");
    }
  };

  return (
    <main className="w-full p-6 space-y-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="flex flex-col space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <h2 className="text-sm font-bold text-slate-700 mb-3 px-1">
              日付選択
            </h2>
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

          {/* 左下：イベント一覧カード */}
          <EventListCard
            date={date}
            selectedDayData={selectedDayData}
            onSelectNewEvent={(initialData) => {
              setEditingEvent(initialData);
              // 💡 タイトルと詳細はモーダルが自分で初期化するので、ここではセットしなくてOK！
            }}
            onEventClick={(evt) => {
              setEditingEvent(evt);
            }}
          />
        </div>

        {/* ================= 右半分：出欠確認エリア ================= */}
        <div className="bg-white p-6 rounded-xl shadow-sm border min-h-[580px] flex flex-col">
          <div className="border-b pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                欠席・遅刻・その他一覧
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                理由の確認と承認を行います
              </p>
            </div>

            <div className="flex gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                欠席: {absentStudents.length} 名
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                遅刻: {lateStudents.length} 名
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[440px] pr-1">
            {absentStudents.length === 0 && lateStudents.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm italic border border-dashed rounded-xl p-8">
                {date
                  ? `${format(date, "M月d日")} の欠席・遅刻児童の詳細がここに並びます`
                  : "日付を選択してください"}
              </div>
            ) : (
              <div className="space-y-3">
                {absentStudents.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-red-100 bg-red-50/30 flex items-start flex-col gap-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
                        欠席
                      </span>
                      <h4 className="text-sm font-bold text-slate-800">
                        {item.user?.name || "未登録の園児"}
                      </h4>
                    </div>
                    <p className="text-sm text-slate-600 pl-1">
                      {item.detail || "（理由は入力されていません）"}
                    </p>
                  </div>
                ))}

                {lateStudents.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-amber-100 bg-amber-50/30 flex items-start flex-col gap-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">
                        遅刻
                      </span>
                      <h4 className="text-sm font-bold text-slate-800">
                        {item.user?.name || "未登録の園児"}
                      </h4>
                    </div>
                    <p className="text-sm text-slate-600 pl-1">
                      {item.detail || "（理由は入力されていません）"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= 行事詳細モーダル ================= */}
      {editingEvent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* 2. 内側の白い箱：外側がクリックしても反応しなくなったので、
         e.stopPropagation() も必要なくなります（消してOKです！） */}
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border flex flex-col max-h-[85vh] animate-scale-up overflow-hidden">
            <div className="px-6 py-4 border-b text-primary flex items-center justify-center bg-slate-50 rounded-t-2xl">
              <h1 className="text-base font-bold text-primary">
                {editingEvent.id === 0 ? "新規予定の追加" : "行事詳細"}
              </h1>
            </div>
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              <dt className="text-xs font-bold text-slate-600 mb-2">日付</dt>
              <dt>{date ? format(date, "M月d日(E)", { locale: ja }) : ""}</dt>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">
                  タイトル
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="例：お誕生日会"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">詳細</label>
                <textarea
                  rows={6}
                  value={editDetail}
                  onChange={(e) => setEditDetail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  placeholder="行事の詳細や持ち物、注意点などを入力してください"
                />
              </div>
              {/* 💡 IDが0じゃない（＝既存のイベント編集の）ときだけ、このフッター情報エリアを丸ごと表示する */}
              {editingEvent.id !== 0 && (
                <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                  {typeof editingEvent.updated_at === "string" && (
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <span>最終更新:</span>
                      <time>
                        {format(
                          new Date(editingEvent.updated_at),
                          "yyyy/MM/dd HH:mm",
                          { locale: ja },
                        )}
                      </time>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <span>編集者:</span>
                    <span className="font-medium text-slate-500">
                      {editingEvent.editor?.name ||
                        `スタッフ(ID: ${editingEvent.editor_id})`}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-3">
              <Button
                onClick={() => setEditingEvent(null)}
                className="px-4 py-2 border text-primary rounded-lg bg-white"
              >
                戻る
              </Button>
              <Button
                onClick={handleSaveEvent}
                className="px-4 py-2 rounded-lg"
              >
                {editingEvent.id === 0 ? "登録する" : "変更を保存する"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
