"use client";

import CalendarSection from "@/components/CalendarSection";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [detail, setDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail.trim()) return;

    setIsSubmitting(true);

    // TODO: ここにLaravel API（プロキシ経由）への送信処理を書く
    // await axios.post('/api/proxy/contacts', { detail })

    setTimeout(() => {
      setIsSubmitting(false);
      setDetail("");
      alert("お問い合わせを送信しました！");
    }, 1000);
  };
  return (
    <div className="px-4 pb-20 flex flex-col items-center">
      <div className="w-full md:w-1/2">
        <div className="my-2">
          <h2 className="underline text-primary font-bold">予定</h2>
          <CalendarSection apiUrl="/api/proxy" />
        </div>
        <div className="my-2">
          <Link href="/messages">
            <h2 className="underline text-primary font-bold">メッセージ履歴</h2>
          </Link>
        </div>
        <div className="my-2">
          <h2 className="underline text-primary font-bold">お問い合わせ</h2>
          <Card className="border border-muted shadow-sm bg-card">
            <CardHeader className="pb-0">
              <CardDescription className="text-xs text-muted-foreground">
                本文
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 -mt-4">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Textarea
                    id="detail"
                    placeholder="こちらにお問い合わせ内容を400字以内でご記入ください"
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    required
                    className="resize-none focus-visible:ring-primary text-sm bg-muted/20 h-48"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full text-sm font-medium flex items-center justify-center gap-2"
                  disabled={isSubmitting || !detail.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      送信中...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      この内容で送信する
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="my-2">
          <h2 className="underline text-primary font-bold">保護者情報編集</h2>
        </div>
      </div>
    </div>
  );
}
