"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MasterDataEntityCard({
  title,
  count,
  preview,
  onViewDetail,
}: {
  title: string;
  count: number;
  preview: string[];
  onViewDetail: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold tracking-tight">{count}</div>
        <ul className="space-y-1 text-xs text-muted-foreground">
          {preview.slice(0, 3).map((item) => (
            <li key={item} className="truncate">
              {item}
            </li>
          ))}
          {preview.length === 0 ? <li>-</li> : null}
        </ul>
        <Button size="sm" variant="outline" onClick={onViewDetail}>
          Lihat detail
        </Button>
      </CardContent>
    </Card>
  );
}
