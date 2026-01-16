import { Button } from "@/components/ui/button";
import { ButtonHTMLAttributes } from "react";

interface PrimaryPillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function PrimaryPillButton({ children, ...props }: PrimaryPillButtonProps) {
  return (
    <Button
      className="rounded-full px-6 py-2 font-semibold"
      {...props}
    >
      {children}
    </Button>
  );
}
