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
  status: number;
  detail: string | null;
  user_id: number;
  user?: UserInfo;
  updated_at?: string;
  editor_id?: number;
  editor?: { id: string | number; name: string };
}

export interface CalendarDayData {
  id: number;
  date: string;
  working: number;
  events: CalendarEvent[];
  attendances: AttendanceRecord[];
}

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
  editor?: { id: string | number; name: string };
}

export interface AttendanceItem {
  id: string | number;
  status: number;
  detail: string;
  calendar_id?: number;
  updated_at?: string;
  editor_id?: string | number;
  editor?: { id: string | number; name: string };
}
