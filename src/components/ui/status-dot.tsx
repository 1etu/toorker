import { cn } from "@/lib/utils";

interface StatusDotProps {
  variant?: "active" | "inactive" | "error" | "warning";
  pulse?: boolean;
  className?: string;
}

export const StatusDot = ({
  variant = "inactive",
  pulse = false,
  className,
}: StatusDotProps) => {
  const colors = {
    active: "bg-success",
    inactive: "bg-muted-foreground/40",
    error: "bg-destructive",
    warning: "bg-warning",
  };

  return (
    <div className={cn("relative flex h-2 w-2", className)}>
      {pulse && (
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            colors[variant],
          )}
        />
      )}
      <span
        className={cn(
          "relative inline-flex h-2 w-2 rounded-full",
          colors[variant],
        )}
      />
    </div>
  );
};
