"use client";

import { Calendar } from "@/components/ui/calendar";
import { ja } from "date-fns/locale";

export default function Home() {
  return (
    <main className="mx-4 flex flex-col items-start justify-start">
      <h2 className="underline">予定</h2>
      <Calendar mode="single" className="w-full" locale={ja} />
    </main>
  );
}
