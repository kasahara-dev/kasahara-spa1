"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";

interface ContactFormProps {
  token: string | undefined;
}

export default function ContactForm({ token }: ContactFormProps) {
  const [detail, setDetail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail.trim()) return;

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const response = await fetch("/api/proxy/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ detail: detail }),
      });

      if (response.status === 201) {
        setSuccessMessage("お問い合わせを送信しました。");
        setDetail("");
        return;
      }

      if (response.status === 422) {
        const errorData = await response.json();
        setErrors(errorData.errors || {});
        return;
      }

      throw new Error("送信リクエストに失敗しました");
    } catch (error) {
      console.error("送信エラー:", error);
      setErrors({
        global: ["送信に失敗しました。時間を置いて再度お試しください。"],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
              maxLength={400}
              className="resize-none focus-visible:ring-primary text-sm bg-muted/20 h-48"
            />
            {successMessage && (
              <p className="text-sm text-green-600 font-medium mt-1">
                {successMessage}
              </p>
            )}
            {errors.detail && (
              <p className="text-sm text-red-500 font-medium mt-1">
                {errors.detail[0]}
              </p>
            )}
            {errors.global && (
              <p className="text-sm text-red-500 font-medium mt-1">
                {errors.global[0]}
              </p>
            )}
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
  );
}
