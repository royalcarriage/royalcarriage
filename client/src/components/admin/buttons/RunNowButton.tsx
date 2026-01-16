import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { ButtonHTMLAttributes } from "react";

interface RunNowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function RunNowButton({ children = "Run Now", ...props }: RunNowButtonProps) {
  return (
    <Button
      className="gap-2"
      {...props}
    >
      <Play className="h-4 w-4" />
      {children}
    </Button>
  );
}
