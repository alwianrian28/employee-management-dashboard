"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function MasterDataDetailPanel({
  open,
  title,
  items,
  onClose,
}: {
  open: boolean;
  title: string;
  items: string[];
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>Daftar data {title.toLowerCase()}.</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">
          <ul className="space-y-2 text-sm">
            {items.map((item) => (
              <li key={item} className="rounded border p-2">
                {item}
              </li>
            ))}
            {items.length === 0 ? (
              <li className="text-muted-foreground">Belum ada data.</li>
            ) : null}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
