import { Badge } from "@/components/ui/badge";

interface DataFreshnessChipProps {
  hoursOld: number;
}

export function DataFreshnessChip({ hoursOld }: DataFreshnessChipProps) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let label = "Fresh";

  if (hoursOld < 24) {
    variant = "default";
    label = "Fresh";
  } else if (hoursOld < 72) {
    variant = "secondary";
    label = "Aging";
  } else {
    variant = "destructive";
    label = "Stale";
  }

  return (
    <Badge variant={variant} className="gap-1">
      <span className="h-2 w-2 rounded-full bg-current" />
      {label} ({hoursOld}h)
    </Badge>
  );
}
