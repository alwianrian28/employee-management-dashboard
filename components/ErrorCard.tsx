"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorCard({
  title = "Tidak dapat memuat data",
  description,
  onRetry,
  retrying,
  compact,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      role="alert"
      className={
        compact
          ? "flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm"
          : "flex flex-col items-center justify-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-8 text-center"
      }
    >
      <AlertTriangle
        className={
          compact
            ? "h-4 w-4 text-destructive shrink-0"
            : "h-6 w-6 text-destructive"
        }
      />
      <div className={compact ? "flex-1" : ""}>
        <div className="font-medium text-foreground">{title}</div>
        {description ? (
          <div className="text-xs text-muted-foreground mt-0.5">
            {description}
          </div>
        ) : null}
      </div>
      {onRetry ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={retrying}
          className="gap-1.5"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${retrying ? "animate-spin" : ""}`}
          />
          {retrying ? "Memuat ulang…" : "Coba lagi"}
        </Button>
      ) : null}
    </div>
  );
}
