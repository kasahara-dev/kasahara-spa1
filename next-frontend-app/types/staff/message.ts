export interface Group {
  id: number;
  name: string;
  category: number;
  created_at: string;
  updated_at: string;
}

export interface StaffMessage {
  id: number;
  to_type: 0 | 1;
  to: number;
  title: string;
  detail: string;
  file_path: string | null;
  created_at: string;
  updated_at: string;
  receiver_name: string | null;
  group_names: string;
}

export interface ParentMessage {
  id: number;
  from: number;
  detail: string;
  created_at: string;
  updated_at: string;
  sender_name: string;
  group_names: string;
}

export interface MessageApiResponse {
  send_messages: StaffMessage[];
  received_messages: ParentMessage[];
}
