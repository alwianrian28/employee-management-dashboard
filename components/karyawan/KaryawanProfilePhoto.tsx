"use client";

import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadPublicUrl } from "@/lib/uploads";

const SIZE_CLASS = {
  sm: "h-9 w-9 rounded-full",
  md: "h-28 w-28 rounded-lg",
  lg: "max-h-52 w-full rounded-lg",
} as const;

export function KaryawanProfilePhoto({
  path,
  name,
  size = "md",
  className,
}: {
  path: string | null | undefined;
  name: string;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}) {
  const url = uploadPublicUrl(path);
  const sizeClass = SIZE_CLASS[size];

  if (!url) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center border bg-muted/50 text-muted-foreground",
          sizeClass,
          className,
        )}
        aria-label={`Belum ada foto untuk ${name}`}
      >
        <User className={size === "sm" ? "h-4 w-4" : "h-8 w-8"} aria-hidden />
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={url}
      alt={`Foto wajah ${name}`}
      className={cn("shrink-0 border object-cover bg-muted/40", sizeClass, className)}
    />
  );
}
