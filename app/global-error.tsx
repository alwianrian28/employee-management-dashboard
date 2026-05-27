"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 bg-background text-foreground antialiased">
        <h2 className="text-lg font-semibold">Dashboard tidak tersedia</h2>
        <p className="text-sm text-muted-foreground max-w-md text-center">
          {error.message?.trim()
            ? error.message
            : "Muat ulang atau coba lagi nanti."}
        </p>
        <button
          type="button"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          onClick={() => reset()}
        >
          Muat ulang
        </button>
      </body>
    </html>
  );
}
