"use client";

import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventItem, CalendarDayData } from "@/../../types/calendar";
import { ja } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface EventListCardProps {
  date: Date | undefined;
  selectedDayData: CalendarDayData | null;
  onSelectNewEvent: (initialData: EventItem) => void;
  onEventClick: (evt: EventItem) => void;
  isLoading: boolean;
}

export default function EventListCard({
  date,
  selectedDayData,
  onSelectNewEvent,
  onEventClick,
  isLoading,
}: EventListCardProps) {
  return (
    <Card className="min-h-[150px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-bold text-primary">
          {date
            ? `${format(date, "M月d日(E)", { locale: ja })} 予定`
            : "選択した日の予定"}
        </CardTitle>
        <Button
          onClick={() => {
            if (!date) return;
            onSelectNewEvent({
              id: 0,
              calendar_id: selectedDayData?.id || 0,
              title: "",
              detail: "",
            });
          }}
          size="sm"
          className="h-8 px-3 text-xs"
          disabled={selectedDayData?.working == 1 ? false : true}
        >
          新規予定の作成
        </Button>
      </CardHeader>

      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="flex justify-center text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            読み込み中...
          </div>
        ) : selectedDayData?.working == 0 ? (
          <p className="text-sm text-slate-400 italic py-4 text-center">
            園休日です
          </p>
        ) : !selectedDayData || selectedDayData.events.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-4 text-center">
            この日の予定はありません
          </p>
        ) : (
          selectedDayData.events.map((evt) => (
            <div
              key={evt.id}
              onClick={() => onEventClick(evt as EventItem)}
              className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 text-sm font-medium text-slate-800 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer flex justify-between items-center group"
            >
              <span>{(evt.title as string) || "（タイトルなし）"}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
