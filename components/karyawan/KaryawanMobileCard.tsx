"use client";

import { Card, CardContent } from "@/components/ui/card";
import { KaryawanFaceBadge } from "@/components/karyawan/KaryawanFaceBadge";
import { KaryawanProfilePhoto } from "@/components/karyawan/KaryawanProfilePhoto";
import { KaryawanRoleBadge } from "@/components/karyawan/KaryawanRoleBadge";
import type { AdminUserItem } from "@/lib/types";

type KaryawanMobileCardProps = {
  item: AdminUserItem;
  active: boolean;
  onSelect: (item: AdminUserItem) => void;
};

export function KaryawanMobileCard({ item, active, onSelect }: KaryawanMobileCardProps) {
  return (
    <button
      type="button"
      className="w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      onClick={() => onSelect(item)}
      aria-label={`Lihat detail karyawan ${item.nama}`}
    >
      <Card
        className="border-transparent transition-colors hover:bg-accent/40 data-[active=true]:border-primary/40"
        data-active={active}
      >
        <CardContent className="space-y-2 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <KaryawanProfilePhoto
                path={item.foto_profil}
                name={item.nama}
                size="sm"
              />
              <div className="truncate font-medium">{item.nama}</div>
            </div>
            <KaryawanRoleBadge role={item.role} />
          </div>
          <div className="text-xs text-muted-foreground">
            {item.nik} • {item.email ?? "-"}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span>
              {item.job_title ?? "-"} • {item.is_active ? "Active" : "Inactive"}
            </span>
            <KaryawanFaceBadge registered={item.face_registered} />
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
