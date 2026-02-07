import { useEffect, useRef } from "react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import type { TsfSection } from "./types";

interface TsfResultListProps {
  sections: TsfSection[];
  selectedIndex: number;
  onSelect: (flatIndex: number) => void;
  onHover: (flatIndex: number) => void;
  feedback: { actionId: string; type: "copied" | "done" } | null;
}

export const TsfResultList = ({
  sections,
  selectedIndex,
  onSelect,
  onHover,
  feedback,
}: TsfResultListProps) => {
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [selectedIndex]);

  let flatIndex = 0;

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
        <p className="text-[13px] text-muted-foreground/60">
          No results found
        </p>
        <p className="text-[11px] text-muted-foreground/40">
          Try a different search term
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[420px] overflow-y-auto">
      {sections.map((section, sectionIdx) => (
        <div key={section.title}>
          {sectionIdx > 0 && <div className="h-px bg-border/50" />}
          <div className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
            {section.title}
          </div>

          <div>
            {section.actions.map((action) => {
              const currentIndex = flatIndex++;
              const isSelected = currentIndex === selectedIndex;
              const isSmart = action.type === "smart";
              const hasFeedback = feedback?.actionId === action.id;
              const Icon =
                (Icons as any)[action.icon] ?? Icons.Terminal;

              return (
                <button
                  key={action.id}
                  ref={isSelected ? selectedRef : null}
                  onClick={() => onSelect(currentIndex)}
                  onMouseEnter={() => onHover(currentIndex)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-[7px] text-left",
                    "transition-colors duration-150 ease-out",
                    hasFeedback
                      ? "bg-emerald-500/10"
                      : isSelected
                        ? "bg-muted/80 text-foreground"
                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center",
                      "transition-all duration-150 ease-out",
                      hasFeedback && "scale-110",
                    )}
                  >
                    {hasFeedback ? (
                      <Icons.Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5 transition-colors duration-150",
                          isSelected
                            ? "text-foreground"
                            : "text-muted-foreground/60",
                        )}
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    {hasFeedback ? (
                      <div className="text-[13px] font-medium leading-tight text-emerald-400">
                        {feedback.type === "copied"
                          ? "Copied to clipboard"
                          : "Done"}
                      </div>
                    ) : (
                      <>
                        <div
                          className={cn(
                            "truncate text-[13px] font-medium leading-tight",
                            "transition-colors duration-150",
                          )}
                        >
                          {action.label}
                        </div>
                        {action.description && (
                          <div
                            className={cn(
                              "truncate leading-tight",
                              "transition-colors duration-150",
                              isSmart && action.result
                                ? "font-mono text-[11px] text-primary/60"
                                : "text-[11px]",
                              !isSmart &&
                                (isSelected
                                  ? "text-muted-foreground"
                                  : "text-muted-foreground/60"),
                            )}
                          >
                            {action.description}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {!hasFeedback && (
                    <span
                      className={cn(
                        "shrink-0 transition-opacity duration-150",
                      )}
                    >
                      {isSmart ? (
                        <span
                          className={cn(
                            "rounded border px-1.5 py-0.5 font-mono text-[9px]",
                            isSelected
                              ? "border-border/50 text-muted-foreground"
                              : "border-border/30 text-muted-foreground/40",
                          )}
                        >
                          {action.result ? "↵ copy" : "↵ run"}
                        </span>
                      ) : action.shortcut ? (
                        <kbd
                          className={cn(
                            "rounded border px-1.5 py-0.5 font-mono text-[9px] tabular-nums",
                            isSelected
                              ? "border-border/50 text-muted-foreground"
                              : "border-border/30 text-muted-foreground/50",
                          )}
                        >
                          {action.shortcut}
                        </kbd>
                      ) : null}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
