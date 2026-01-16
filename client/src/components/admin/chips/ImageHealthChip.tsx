import { Badge } from "@/components/ui/badge";

interface ImageHealthChipProps {
  missingCount: number;
  totalCount: number;
}

export function ImageHealthChip({ missingCount, totalCount }: ImageHealthChipProps) {
  const percentage = totalCount > 0 ? ((totalCount - missingCount) / totalCount) * 100 : 100;
  
  let variant: "default" | "secondary" | "destructive" = "default";
  let label = "Healthy";

  if (percentage >= 95) {
    variant = "default";
    label = "Healthy";
  } else if (percentage >= 80) {
    variant = "secondary";
    label = "Warning";
  } else {
    variant = "destructive";
    label = "Critical";
  }

  return (
    <Badge variant={variant} className="gap-1">
      <span className="h-2 w-2 rounded-full bg-current" />
      {label} ({missingCount} missing)
    </Badge>
  );
}
