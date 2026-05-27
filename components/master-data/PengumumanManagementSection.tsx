"use client";

import { useState } from "react";
import { Database, Eye, Pencil, Plus } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useCreatePengumuman,
  useUpdatePengumuman,
} from "@/lib/queries/master-data";
import { toastError, toastSuccess } from "@/lib/toast";
import type { MasterDataPengumumanItem } from "@/lib/types";
import { cn } from "@/lib/utils";

function formatTs(value: string | null | undefined) {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("id-ID");
  } catch {
    return value;
  }
}

export function PengumumanManagementSection({
  items,
}: {
  items: MasterDataPengumumanItem[];
}) {
  const createMutation = useCreatePengumuman();
  const updateMutation = useUpdatePengumuman();

  const mutating = createMutation.isPending || updateMutation.isPending;

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [isActiveDraft, setIsActiveDraft] = useState(true);

  const [preview, setPreview] = useState<MasterDataPengumumanItem | null>(null);
  const [toggleId, setToggleId] = useState<number | null>(null);

  function openCreate() {
    setFormMode("create");
    setEditingId(null);
    setJudul("");
    setIsi("");
    setIsActiveDraft(true);
    setFormOpen(true);
  }

  function openEdit(row: MasterDataPengumumanItem) {
    setFormMode("edit");
    setEditingId(row.id);
    setJudul(row.judul);
    setIsi(row.isi);
    setIsActiveDraft(row.is_active);
    setFormOpen(true);
  }

  async function submitForm() {
    const j = judul.trim();
    const i = isi.trim();
    if (j.length < 3 || i.length < 3) {
      toastError("Judul dan isi minimal 3 karakter.");
      return;
    }
    try {
      if (formMode === "create") {
        await createMutation.mutateAsync({
          judul: j,
          isi: i,
          is_active: isActiveDraft,
        });
        toastSuccess("Pengumuman berhasil dibuat.");
      } else if (editingId != null) {
        await updateMutation.mutateAsync({
          id: editingId,
          payload: { judul: j, isi: i, is_active: isActiveDraft },
        });
        toastSuccess("Pengumuman berhasil diperbarui.");
      }
      setFormOpen(false);
    } catch (e) {
      toastError(e instanceof Error ? e.message : "Gagal menyimpan pengumuman.");
    }
  }

  async function handleToggle(row: MasterDataPengumumanItem) {
    setToggleId(row.id);
    try {
      await updateMutation.mutateAsync({
        id: row.id,
        payload: { is_active: !row.is_active },
      });
      toastSuccess(
        row.is_active ? "Pengumuman dinonaktifkan." : "Pengumuman diaktifkan.",
      );
    } catch (e) {
      toastError(e instanceof Error ? e.message : "Gagal mengubah status.");
    } finally {
      setToggleId(null);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Pengumuman
          </h2>
          <p className="text-sm text-muted-foreground">
            Kelola pengumuman untuk Overview dan karyawan (Active/Archived).
          </p>
        </div>
        <Button
          onClick={openCreate}
          disabled={mutating}
          className="shrink-0"
          aria-label="Tambah pengumuman baru"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah pengumuman
        </Button>
      </div>

      <div className="space-y-2">
        {items.map((row) => (
          <div
            key={row.id}
            className={cn(
              "flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between",
            )}
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium truncate">{row.judul}</span>
                <span
                  className={cn(
                    "inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1",
                    row.is_active
                      ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground ring-border",
                  )}
                >
                  {row.is_active ? "Active" : "Archived"}
                </span>
              </div>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {row.isi}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Dibuat: {formatTs(row.created_at)}
                {row.updated_at ? ` · Diubah: ${formatTs(row.updated_at)}` : null}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={mutating}
                onClick={() => setPreview(row)}
                aria-label={`Pratinjau ${row.judul}`}
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                Pratinjau
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={mutating}
                onClick={() => openEdit(row)}
                aria-label={`Edit ${row.judul}`}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                size="sm"
                variant={row.is_active ? "destructive" : "default"}
                disabled={mutating || toggleId === row.id}
                onClick={() => handleToggle(row)}
                aria-label={
                  row.is_active ? "Nonaktifkan pengumuman" : "Aktifkan pengumuman"
                }
              >
                {toggleId === row.id
                  ? "Menyimpan..."
                  : row.is_active
                    ? "Nonaktifkan"
                    : "Aktifkan"}
              </Button>
            </div>
          </div>
        ))}
        {items.length === 0 ? (
          <EmptyState
            icon={Database}
            title="Belum ada pengumuman"
            description="Gunakan tombol Tambah pengumuman untuk membuat entri pertama."
            compact
          />
        ) : null}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Pengumuman baru" : "Edit pengumuman"}
            </DialogTitle>
            <DialogDescription>
              Judul dan isi wajib (minimal 3 karakter). Status aktif menentukan
              visibilitas di aplikasi karyawan dan Overview.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            <div className="space-y-1.5">
              <label htmlFor="pengumuman-judul" className="text-xs font-medium">
                Judul
              </label>
              <Input
                id="pengumuman-judul"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Judul pengumuman"
                disabled={mutating}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="pengumuman-isi" className="text-xs font-medium">
                Isi
              </label>
              <textarea
                id="pengumuman-isi"
                className="min-h-32 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                value={isi}
                onChange={(e) => setIsi(e.target.value)}
                placeholder="Isi lengkap pengumuman"
                disabled={mutating}
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 rounded border-input accent-primary"
                checked={isActiveDraft}
                onChange={(e) => setIsActiveDraft(e.target.checked)}
                disabled={mutating}
              />
              Aktif (tampil untuk karyawan)
            </label>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={mutating}
            >
              Batal
            </Button>
            <Button onClick={submitForm} disabled={mutating}>
              {mutating
                ? "Menyimpan..."
                : formMode === "create"
                  ? "Simpan"
                  : "Perbarui"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={Boolean(preview)} onOpenChange={(o) => !o && setPreview(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Pratinjau pengumuman</SheetTitle>
            <SheetDescription>
              {preview ? preview.judul : ""}
            </SheetDescription>
          </SheetHeader>
          {preview ? (
            <div className="space-y-4 px-4 pb-4 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1",
                    preview.is_active
                      ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground ring-border",
                  )}
                >
                  {preview.is_active ? "Active" : "Archived"}
                </span>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3 whitespace-pre-wrap">
                {preview.isi}
              </div>
              <dl className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between gap-4">
                  <dt>Dibuat</dt>
                  <dd className="text-right">{formatTs(preview.created_at)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Terakhir diubah</dt>
                  <dd className="text-right">{formatTs(preview.updated_at)}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={mutating}
                  onClick={() => {
                    openEdit(preview);
                    setPreview(null);
                  }}
                >
                  Edit dari pratinjau
                </Button>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
