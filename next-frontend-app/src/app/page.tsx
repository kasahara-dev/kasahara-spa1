"use client";

import { Calendar } from "@/components/ui/calendar";
import { ja } from "date-fns/locale";

export default function Home() {
  return (
    <div className="px-4 flex flex-col items-center">
      <div className="w-full md:w-1/2">
        <h2 className="underline text-chic-gray">予定</h2>
        <Calendar mode="single" className="w-full" locale={ja} />
      </div>
    </div>
  );
}
