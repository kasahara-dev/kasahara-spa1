"use client";

import * as React from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useSession } from "next-auth/react";
import CalendarSection from "@/components/staff/CalendarSection";
import EventListCard from "@/components/staff/EventListCard";
// 💡 カスタムフックをインポート
import { useCalendarData } from "@/hooks/staff/useCalendarData";
import { AttendanceRecord } from "@/../../types/calendar";
import { Button } from "@/components/ui/button";
// 💡 ページ内で使う型
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

export default function Home() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const { data: session } = useSession();
  const token = session?.accessToken;

  // ========================================================
  // 💡 【大改造ポイント】
  // 元々あった staffData, loading の useState や useEffect はすべて削除！
  // 代わりにフックを1行だけ呼び出して、裏からデータを引っ張ってきます。
  // ========================================================
  const { staffData, setStaffData, loading, handleSaveEvent } =
    useCalendarData(token);

  // 💡 モーダル管理用のステート（文字入力の状態はここに残します）
  const [editingEvent, setEditingEvent] = React.useState<EventItem | null>(
    null,
  );
  const [editTitle, setEditTitle] = React.useState("");
  const [editDetail, setEditDetail] = React.useState("");
  const [formErrors, setFormErrors] = React.useState<Record<string, string[]>>(
    {},
  );
  // 💡 行事クリック時のハンドラー
  const handleEventClick = (evt: EventItem) => {
    setEditingEvent(evt);
    setEditTitle(evt.title || "");
    setEditDetail(evt.detail || "");
    setFormErrors({});
  };

  // 💡 ページ側の保存ボタンが押された時の処理
  const onSaveClick = async () => {
    if (!editingEvent) return;

    try {
      setFormErrors({}); // 前のエラーをクリア

      // フックから生の response を受け取る
      const response = await handleSaveEvent({
        editingEvent: editingEvent,
        title: editTitle,
        detail: editDetail, // 👈 いま画面に入力されている文字
      });

      // 💡 1. 成功時（Laravel側の設計に合わせて 200 または 201）
      if (response.status === 200 || response.status === 201) {
        const resData = await response.json();

        // 画面のイベント一覧を更新する処理（元々あったもの）
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
          setStaffData({ ...staffData, calendar_data: updatedCalendar }); // 👈 フックからsetStaffDataを貰っておく
        }

        setEditingEvent(null); // モーダルを閉じる
        return;
      }

      // 💡 2. バリデーションエラー時（保護者側と全く同じ！）
      if (response.status === 422) {
        const errorData = await response.json();
        setFormErrors(errorData.errors || {});
        return;
      }

      // それ以外のステータス（500など）はエラーへ飛ばす
      throw new Error();
    } catch (error) {
      console.error("送信エラー:", error);
      setFormErrors({
        global: ["保存に失敗しました。時間を置いて再度お試しください。"],
      });
    }
  };

  // ========================================================
  // 💡 データ集計用のロジック（ここはフックから届いた staffData を使って自動計算されます）
  // ========================================================
  const selectedDayData = React.useMemo(() => {
    // 💡 中に引っ越しさせ、外側の変数ではなく staffData を直接見に行くようにする
    const calendarData = staffData?.calendar_data ?? [];

    if (!date || calendarData.length === 0) return null;
    const formattedTarget = format(date, "yyyy-MM-dd");
    return calendarData.find((day) => day.date === formattedTarget) || null;
  }, [date, staffData]);

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

  return (
    <main className="w-full p-6 space-y-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="flex flex-col space-y-6">
          {/* 日付選択 */}
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

          {/* 💡 イベント一覧カード（Propsを渡す） */}
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
                    <p className="text-sm text-slate-600 pl-1 whitespace-pre-wrap">
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
                  className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="例：お誕生日会"
                />
                {formErrors.title?.map((msg, i) => (
                  <p
                    key={i}
                    className="text-xs font-semibold text-red-500 mt-1 pl-1"
                  >
                    {msg}
                  </p>
                ))}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">詳細</label>
                <textarea
                  rows={6}
                  value={editDetail}
                  onChange={(e) => setEditDetail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                  placeholder="行事の詳細や持ち物、注意点などを入力してください"
                />
                {formErrors.detail?.map((msg, i) => (
                  <p
                    key={i}
                    className="text-xs font-semibold text-red-500 mt-1 pl-1"
                  >
                    {msg}
                  </p>
                ))}
                {formErrors.calendar_id && (
                  <p className="text-xs font-semibold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
                    日付データが正しく選択されていません。再度お試しください。
                  </p>
                )}
              </div>
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
              {/* 💡 修正した関数の呼び出し */}
              <Button onClick={onSaveClick} className="px-4 py-2 rounded-lg">
                {editingEvent.id === 0 ? "登録する" : "変更を保存する"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
