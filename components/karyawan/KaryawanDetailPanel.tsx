"use client";

import Link from "next/link";
import { CalendarClock } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { KaryawanFaceBadge } from "@/components/karyawan/KaryawanFaceBadge";
import { KaryawanProfilePhoto } from "@/components/karyawan/KaryawanProfilePhoto";
import { KaryawanRoleBadge } from "@/components/karyawan/KaryawanRoleBadge";
import { uploadPublicUrl } from "@/lib/uploads";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { KaryawanSupervisorSection } from "@/components/karyawan/KaryawanSupervisorSection";
import type { AdminUserItem, AdminUserSupervisorUpdateResponse } from "@/lib/types";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function KaryawanDetailPanel({
  selected,
  onClose,
  onToggleStatus,
  onSupervisorsUpdated,
  toggling,
}: {
  selected: AdminUserItem | null;
  onClose: () => void;
  onToggleStatus: (nextActive: boolean) => void;
  onSupervisorsUpdated?: (data: AdminUserSupervisorUpdateResponse) => void;
  toggling?: boolean;
}) {
  const fotoUrl = selected ? uploadPublicUrl(selected.foto_profil) : null;

  return (
    <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Detail Karyawan</SheetTitle>
          <SheetDescription>
            {selected ? `${selected.nama} (${selected.nik})` : "Detail data karyawan"}
          </SheetDescription>
        </SheetHeader>
        {selected ? (
          <div className="space-y-4 px-4 pb-4 text-sm">
            <div className="space-y-2 rounded-lg border p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Status
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role</span>
                <KaryawanRoleBadge role={selected.role} />
              </div>
              <DetailRow
                label="Aktivasi"
                value={selected.is_active ? "Active" : "Inactive"}
              />
              <Button
                type="button"
                variant={selected.is_active ? "outline" : "default"}
                className="mt-2 w-full"
                disabled={Boolean(toggling)}
                onClick={() => onToggleStatus(!selected.is_active)}
              >
                {toggling
                  ? "Menyimpan..."
                  : selected.is_active
                    ? "Non-aktifkan Karyawan"
                    : "Aktifkan Karyawan"}
              </Button>
            </div>

            <div className="space-y-3 rounded-lg border p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Profil &amp; wajah
              </div>
              <div className="flex flex-col items-center gap-3">
                <KaryawanProfilePhoto
                  path={selected.foto_profil}
                  name={selected.nama}
                  size={fotoUrl ? "lg" : "md"}
                />
                <KaryawanFaceBadge registered={selected.face_registered} />
                {selected.face_registered ? (
                  <p className="text-center text-xs text-muted-foreground">
                    Foto referensi verifikasi absensi. Kolom{" "}
                    <code className="rounded bg-muted px-1">face_encoding</code> di database
                    berisi data numerik (bukan gambar) dan tidak ditampilkan di sini.
                  </p>
                ) : selected.foto_profil ? (
                  <p className="text-center text-xs text-muted-foreground">
                    Foto profil ada, tetapi registrasi wajah di aplikasi mobile belum selesai.
                  </p>
                ) : (
                  <p className="text-center text-xs text-muted-foreground">
                    Belum ada foto. Karyawan dapat mendaftarkan wajah lewat aplikasi mobile.
                  </p>
                )}
              </div>
              <DetailRow label="Nama" value={selected.nama} />
              <DetailRow label="NIK" value={selected.nik} />
              <DetailRow label="Email" value={selected.email ?? "-"} />
              <DetailRow label="No HP" value={selected.no_hp ?? "-"} />
            </div>

            <KaryawanSupervisorSection
              user={selected}
              onUpdated={(data) => onSupervisorsUpdated?.(data)}
            />

            <div className="space-y-2 rounded-lg border p-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                Organisasi
              </div>
              <DetailRow label="Business Unit" value={selected.business_unit ?? "-"} />
              <DetailRow label="Department" value={selected.departemen ?? "-"} />
              <DetailRow label="Job Title" value={selected.job_title ?? "-"} />
              <DetailRow label="Sisa Cuti" value={`${selected.sisa_cuti} hari`} />
              <Link
                href={`/attendance?user_id=${selected.id}`}
                className={cn(
                  buttonVariants({ variant: "secondary", size: "default" }),
                  "mt-2 inline-flex w-full items-center justify-center gap-2",
                )}
              >
                <CalendarClock className="h-4 w-4" aria-hidden />
                Riwayat absensi
              </Link>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
