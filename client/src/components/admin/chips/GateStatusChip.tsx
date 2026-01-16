import { Badge } from "@/components/ui/badge";

interface GateStatusChipProps {
  status: "pass" | "fail" | "pending" | "not_run";
}

export function GateStatusChip({ status }: GateStatusChipProps) {
  const variants = {
    pass: { variant: "default" as const, label: "Pass", color: "bg-green-500" },
    fail: { variant: "destructive" as const, label: "Fail", color: "bg-red-500" },
    pending: { variant: "secondary" as const, label: "Pending", color: "bg-yellow-500" },
    not_run: { variant: "outline" as const, label: "Not Run", color: "bg-gray-400" },
  };

  const config = variants[status];

  return (
    <Badge variant={config.variant} className="gap-1">
      <span className={`h-2 w-2 rounded-full ${config.color}`} />
      {config.label}
    </Badge>
  );
}
