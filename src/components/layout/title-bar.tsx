import { useState, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export const TitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const appWindow = getCurrentWindow();

  useEffect(() => {
    const checkMaximized = async () => {
      setIsMaximized(await appWindow.isMaximized());
    };
    checkMaximized();

    const unlisten = appWindow.onResized(async () => {
      setIsMaximized(await appWindow.isMaximized());
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [appWindow]);

  return (
    <div
      data-tauri-drag-region
      className="flex h-9 shrink-0 select-none items-center justify-between border-b border-sidebar-border bg-sidebar"
    >
      <div data-tauri-drag-region className="flex items-center gap-2 pl-3">
        <span className="text-[13px] font-semibold tracking-tight text-foreground/80">
          Toorker
        </span>
      </div>

      <div className="flex items-center">
        <WindowButton
          label="Minimize"
          onClick={() => appWindow.minimize()}
          icon={<Minus className="h-3 w-3" />}
        />
        <WindowButton
          label="Maximize"
          onClick={() => appWindow.toggleMaximize()}
          icon={
            isMaximized ? (
              <Copy className="h-2.5 w-2.5" />
            ) : (
              <Square className="h-2.5 w-2.5" />
            )
          }
        />
        <WindowButton
          label="Close"
          onClick={() => appWindow.close()}
          icon={<X className="h-3.5 w-3.5" />}
          variant="close"
        />
      </div>
    </div>
  );
};

const WindowButton = ({
  label,
  onClick,
  icon,
  variant = "default",
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  variant?: "default" | "close";
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className={cn(
      "flex h-9 w-11 items-center justify-center text-muted-foreground transition-colors",
      variant === "close"
        ? "hover:bg-destructive hover:text-white"
        : "hover:bg-secondary",
    )}
  >
    {icon}
  </button>
);
