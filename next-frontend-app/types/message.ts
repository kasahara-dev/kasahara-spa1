export type MessageType = "0" | "1";
export type SentDistinction = "0" | "1";

export interface Message {
    sent: SentDistinction;
    id: string | number;
    title?: string;
    detail: string;
    created_at: string;
    to_type?: MessageType;
    to: string;
    file_path?: string;
}
