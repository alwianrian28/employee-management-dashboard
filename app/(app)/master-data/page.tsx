"use client";

import { useMemo, useState } from "react";
import { Database } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ErrorCard } from "@/components/ErrorCard";
import { SectionHeader } from "@/components/SectionHeader";
import { MasterDataEntityCard } from "@/components/master-data/MasterDataEntityCard";
import { MasterDataDetailPanel } from "@/components/master-data/MasterDataDetailPanel";
import { PengumumanManagementSection } from "@/components/master-data/PengumumanManagementSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMasterData } from "@/lib/queries/master-data";

const ENTITY_CONFIG = [
  { key: "business_units", title: "Business Unit" },
  { key: "departments", title: "Department" },
  { key: "job_titles", title: "Job Title" },
  { key: "shifts", title: "Shift" },
  { key: "tipe_cuti", title: "Tipe Cuti" },
  { key: "pengumuman", title: "Pengumuman" },
] as const;

export default function MasterDataPage() {
  const master = useMasterData();

  const [detailKey, setDetailKey] = useState<(typeof ENTITY_CONFIG)[number]["key"] | null>(null);

  const data = master.data;

  const detailItems = useMemo(() => {
    if (!data || !detailKey) return [];
    if (detailKey === "pengumuman") {
      return data.pengumuman.map((x) => `${x.judul} (${x.is_active ? "active" : "inactive"})`);
    }
    if (detailKey === "shifts") {
      return data.shifts.map(
        (x) => `${x.nama} (${x.jam_masuk}-${x.jam_keluar}, tol ${x.toleransi_menit}m)`
      );
    }
    if (detailKey === "tipe_cuti") {
      return data.tipe_cuti.map((x) => `${x.nama} (${x.is_active ? "active" : "inactive"})`);
    }
    return data[detailKey].map((x) => x.nama);
  }, [data, detailKey]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Master Data"
        description="Pusat referensi data organisasi untuk modul dashboard."
      />

      {master.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : master.isError ? (
        <ErrorCard
          title="Gagal memuat master data"
          description={master.error?.message}
          onRetry={() => master.refetch()}
          retrying={master.isFetching}
        />
      ) : data ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ENTITY_CONFIG.map((entity) => {
              let preview: string[] = [];
              let count = 0;
              if (entity.key === "shifts") {
                preview = data.shifts.map((x) => x.nama);
                count = data.summary.shifts;
              } else if (entity.key === "tipe_cuti") {
                preview = data.tipe_cuti.map((x) => x.nama);
                count = data.summary.tipe_cuti;
              } else if (entity.key === "pengumuman") {
                preview = data.pengumuman.map((x) => x.judul);
                count = data.pengumuman.length;
              } else {
                preview = data[entity.key].map((x) => x.nama);
                count = data.summary[entity.key];
              }
              return (
                <MasterDataEntityCard
                  key={entity.key}
                  title={entity.title}
                  count={count}
                  preview={preview}
                  onViewDetail={() => setDetailKey(entity.key)}
                />
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Kelola pengumuman</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PengumumanManagementSection items={data.pengumuman} />
            </CardContent>
          </Card>

          <MasterDataDetailPanel
            open={Boolean(detailKey)}
            title={ENTITY_CONFIG.find((x) => x.key === detailKey)?.title ?? "Detail"}
            items={detailItems}
            onClose={() => setDetailKey(null)}
          />
        </>
      ) : (
        <EmptyState
          icon={Database}
          title="Master data kosong"
          description="Belum ada data master. Jalankan seed demo atau tambahkan data referensi terlebih dahulu."
        />
      )}
    </div>
  );
}
