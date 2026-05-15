export type MessageType = "0" | "1"; // 0:個人, 1:グループ
export type SentDistinction = "0" | "1"; // 0:受信, 1:送信

export interface Message {
    sent: SentDistinction;
    title?: string;
    detail: string;
    created_at: string;
    to_type?: MessageType;
    to: string;
    file_path?: string;
}
