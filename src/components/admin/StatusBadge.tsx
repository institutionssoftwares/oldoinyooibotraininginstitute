import { cn } from "@/lib/utils";
import { STATUS_META, type ContentStatus } from "@/lib/admin/resources";

export function StatusBadge({ status, className }: { status: string | null | undefined; className?: string }) {
  const meta = STATUS_META[(status ?? "draft") as ContentStatus] ?? { label: status ?? "—", tone: "bg-muted text-muted-foreground" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize", meta.tone, className)}>
      {meta.label}
    </span>
  );
}
