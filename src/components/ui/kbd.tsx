import { cn } from "@/lib/utils";

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export const Kbd = ({ children, className }: KbdProps) => (
  <kbd
    className={cn(
      "inline-flex items-center gap-0.5 rounded border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground",
      className,
    )}
  >
    {children}
  </kbd>
);
