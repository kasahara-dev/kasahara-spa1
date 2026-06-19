import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[50vh] w-full justify-center items-center gap-2">
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
      <div className="text-muted-foreground text-sm font-medium">
        読み込み中...
      </div>
    </div>
  );
}
