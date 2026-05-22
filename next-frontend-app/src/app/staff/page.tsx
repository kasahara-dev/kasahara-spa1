"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { useSession } from "next-auth/react";
import CalendarSection from "@/components/staff/CalendarSection";

// --- 型定義 ---
interface CalendarEvent {
  id: number;
  title: string;
  detail?: string | null;
}

interface UserInfo {
  id: number;
  name: string;
}

interface AttendanceRecord {
  id: number;
  status: number; // 2: 欠席, 3: 遅刻
  detail: string | null;
  user_id: number;
  user?: UserInfo;
}

interface CalendarDayData {
  id: number;
  date: string;
  working: number;
  events: CalendarEvent[];
  attendance: AttendanceRecord[];
}

// Laravelの StaffCalendarController::class から返ってくる全体の型
interface StaffCalendarResponse {
  config: {
    start_date: string;
    end_date: string;
  };
  calendar_data: CalendarDayData[];
}

export default function Home() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [staffData, setStaffData] =
    React.useState<StaffCalendarResponse | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const { data: session } = useSession();
  const token = session?.accessToken;

  // 💡 1. データの取得はここ「1回だけ」実行
  React.useEffect(() => {
    if (!token) return;
    async function fetchAllData() {
      try {
        // Laravelの Route::prefix('staff')->group(...) の `Route::get('/', ...)` に対応
        const res = await fetch("/api/proxy/staff", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`, // 💡 認証トークンを添える
          },
        });
        console.log("【デバッグ】APIステータスコード:", res.status);
        console.log("Token:", token);
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

  // カレンダー配列を安全に抽出
  const calendarData = staffData?.calendar_data ?? [];

  // 2. 選択された「特定の日」のデータを抽出
  const selectedDayData = React.useMemo(() => {
    if (!date || calendarData.length === 0) return null;
    const formattedTarget = format(date, "yyyy-MM-dd");
    return calendarData.find((day) => day.date === formattedTarget) || null;
  }, [date, calendarData]);

  // 3. その日の「欠席者」と「遅刻者」を絞り込み
  const absentStudents = React.useMemo(() => {
    if (!selectedDayData || !selectedDayData.attendance) return [];

    // 💡 「as any[]」を「as AttendanceRecord[]」に変更して型を厳格に指定します
    const attendanceList = (
      Array.isArray(selectedDayData.attendance)
        ? selectedDayData.attendance
        : Object.values(selectedDayData.attendance)
    ) as AttendanceRecord[];

    return attendanceList.filter((a) => a && a.status === 2);
  }, [selectedDayData]);

  const lateStudents = React.useMemo(() => {
    if (!selectedDayData || !selectedDayData.attendance) return [];

    // 💡 こちらも同様に「as AttendanceRecord[]」に変更
    const attendanceList = (
      Array.isArray(selectedDayData.attendance)
        ? selectedDayData.attendance
        : Object.values(selectedDayData.attendance)
    ) as AttendanceRecord[];

    return attendanceList.filter((a) => a && a.status === 3);
  }, [selectedDayData]);
  // 4. 今月のイベント一覧を抽出
  const currentMonthEvents = React.useMemo(() => {
    if (!date || calendarData.length === 0) return [];
    const currentYearMonth = format(date, "yyyy-MM");
    return calendarData.filter(
      (day) => day.date.startsWith(currentYearMonth) && day.events.length > 0,
    );
  }, [date, calendarData]);

  return (
    <main className="w-full p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* ================= 左半分：スケジュールエリア ================= */}
        <div className="flex flex-col space-y-6">
          {/* 左上：カレンダー */}
          <div className="bg-white p-5 rounded-xl shadow-sm border">
            <h2 className="text-sm font-bold text-slate-700 mb-3 px-1">
              日付選択
            </h2>
            {/* 💡 データが取得完了するまでは「読み込み中」でガードして裏での即時fetchを防ぐ */}
            {loading || !staffData ? (
              <div className="h-64 flex items-center justify-center text-sm text-slate-400">
                読み込み中...
              </div>
            ) : (
              /* 💡 ご希望通り apiUrl のみを指定する感覚で呼び出し */
              <CalendarSection
                apiUrl="/api/proxy/staff"
                staffData={staffData}
                selectedDate={date}
                onDateSelect={setDate}
              />
            )}
          </div>

          {/* 左下：イベント一覧カード */}
          <div className="bg-white p-5 rounded-xl shadow-sm border min-h-[200px]">
            <h3 className="font-bold text-slate-900 text-base mb-3">
              今月の行事・予定
            </h3>
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {currentMonthEvents.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-4 text-center">
                  今月の予定はありません
                </p>
              ) : (
                currentMonthEvents.map((day) => (
                  <div
                    key={day.id}
                    className="flex items-start gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <span className="inline-block px-2 py-0.5 text-xs font-bold rounded bg-blue-50 text-blue-700 whitespace-nowrap mt-0.5">
                      {format(parseISO(day.date), "d日(E)", { locale: ja })}
                    </span>
                    <div>
                      {day.events.map((evt) => (
                        <p
                          key={evt.id}
                          className="text-sm font-medium text-slate-800"
                        >
                          {evt.title}
                        </p>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
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
    </main>
  );
}
