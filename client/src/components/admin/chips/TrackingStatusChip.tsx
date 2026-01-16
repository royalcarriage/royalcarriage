import { Badge } from "@/components/ui/badge";

interface TrackingStatusChipProps {
  status: "active" | "inactive" | "error";
}

export function TrackingStatusChip({ status }: TrackingStatusChipProps) {
  const variants = {
    active: { variant: "default" as const, label: "Active", color: "bg-green-500" },
    inactive: { variant: "secondary" as const, label: "Inactive", color: "bg-gray-400" },
    error: { variant: "destructive" as const, label: "Error", color: "bg-red-500" },
  };

  const config = variants[status];

  return (
    <Badge variant={config.variant} className="gap-1">
      <span className={`h-2 w-2 rounded-full ${config.color}`} />
      {config.label}
    </Badge>
  );
}
