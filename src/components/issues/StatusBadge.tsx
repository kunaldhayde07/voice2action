import Badge from "@/components/ui/Badge";
import { IssueStatus } from "@/types";

const statusMap = {
  pending:     { variant: "warning" as const, label: "Pending",     dot: true },
  in_progress: { variant: "info"    as const, label: "In Progress", dot: true },
  resolved:    { variant: "success" as const, label: "Resolved",    dot: true },
};

export default function StatusBadge({ status, className }: { status: IssueStatus; className?: string }) {
  const c = statusMap[status];
  return <Badge variant={c.variant} dot={c.dot} className={className}>{c.label}</Badge>;
}
