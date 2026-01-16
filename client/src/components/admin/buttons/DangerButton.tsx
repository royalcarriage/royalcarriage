import { Button } from "@/components/ui/button";
import { ButtonHTMLAttributes } from "react";

interface DangerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function DangerButton({ children, ...props }: DangerButtonProps) {
  return (
    <Button
      variant="destructive"
      {...props}
    >
      {children}
    </Button>
  );
}
