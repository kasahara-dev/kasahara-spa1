import { Badge } from "@/components/ui/badge";

interface AttendanceBadgeProps {
  type: number;
}

export default function AttendanceBadge({ type }: AttendanceBadgeProps) {
  if (type === 0) {
    return (
      <Badge className="px-2 py-0.5 rounded font-bold bg-green-100 text-green-700">
        出席
      </Badge>
    );
  } else if (type === 1) {
    return (
      <Badge className="px-2 py-0.5 rounded font-bold bg-red-100 text-red-700">
        お休み
      </Badge>
    );
  } else {
    return (
      <Badge className="px-2 py-0.5 rounded font-bold bg-orange-100 text-orange-700">
        遅刻その他
      </Badge>
    );
  }
}
