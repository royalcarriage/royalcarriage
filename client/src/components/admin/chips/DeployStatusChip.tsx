import { Badge } from "@/components/ui/badge";

interface DeployStatusChipProps {
  status: "deployed" | "deploying" | "failed" | "pending";
}

export function DeployStatusChip({ status }: DeployStatusChipProps) {
  const variants = {
    deployed: { variant: "default" as const, label: "Deployed", color: "bg-green-500" },
    deploying: { variant: "secondary" as const, label: "Deploying", color: "bg-blue-500" },
    failed: { variant: "destructive" as const, label: "Failed", color: "bg-red-500" },
    pending: { variant: "outline" as const, label: "Pending", color: "bg-gray-400" },
  };

  const config = variants[status];

  return (
    <Badge variant={config.variant} className="gap-1">
      <span className={`h-2 w-2 rounded-full ${config.color}`} />
      {config.label}
    </Badge>
  );
}
