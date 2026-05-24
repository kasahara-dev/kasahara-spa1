export interface CalendarEvent {
  id: number;
  title: string;
  detail?: string | null;
}

export interface UserInfo {
  id: number;
  name: string;
}

export interface AttendanceRecord {
  id: number;
  status: number; // 2: 欠席, 3: 遅刻
  detail: string | null;
  user_id: number;
  user?: UserInfo;
}

export interface CalendarDayData {
  id: number;
  date: string;
  working: number;
  events: CalendarEvent[];
  attendance: AttendanceRecord[];
}

// Laravelの StaffCalendarController から返ってくる全体の型
export interface StaffCalendarResponse {
  config: {
    start_date: string;
    end_date: string;
  };
  calendar_data: CalendarDayData[];
}

export interface EventItem {
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
