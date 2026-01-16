import { Button } from "@/components/ui/button";
import { ButtonHTMLAttributes } from "react";

interface SecondaryOutlineButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function SecondaryOutlineButton({ children, ...props }: SecondaryOutlineButtonProps) {
  return (
    <Button
      variant="outline"
      className="border-2"
      {...props}
    >
      {children}
    </Button>
  );
}
