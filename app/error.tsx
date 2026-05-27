"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard] segment error", error?.name, error?.message);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h2 className="text-lg font-semibold text-foreground">
        Halaman tidak dapat dimuat
      </h2>
      <p className="text-sm text-muted-foreground max-w-md">
        {error.message?.trim()
          ? error.message
          : "Silakan coba lagi. Jika masalah berlanjut, hubungi administrator."}
      </p>
      <Button type="button" variant="secondary" onClick={() => reset()}>
        Coba lagi
      </Button>
    </div>
  );
}
