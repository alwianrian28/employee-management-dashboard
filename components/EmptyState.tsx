import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  height,
  className,
  compact,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  height?: number | string;
  className?: string;
  compact?: boolean;
}) {
  const styleHeight =
    typeof height === "number" ? `${height}px` : height;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-4 gap-1.5" : "py-8 gap-2",
        "text-muted-foreground",
        className,
      )}
      style={styleHeight ? { minHeight: styleHeight } : undefined}
    >
      {Icon ? (
        <Icon
          className={cn(
            compact ? "h-5 w-5" : "h-8 w-8",
            "text-muted-foreground/60",
          )}
        />
      ) : null}
      <div className="font-medium text-foreground/80 text-sm">{title}</div>
      {description ? (
        <div className="text-xs max-w-xs">{description}</div>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
