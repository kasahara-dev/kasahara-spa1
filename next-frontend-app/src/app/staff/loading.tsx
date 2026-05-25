import { Loader2 } from "lucide-react";
export default function Loading() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-3">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm font-medium text-primary">
        データを読み込んでいます...
      </p>
    </main>
  );
}