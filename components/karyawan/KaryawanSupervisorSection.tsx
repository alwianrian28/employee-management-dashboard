"use client";

import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
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
import { useUpdateUserSupervisors, useUserList } from "@/lib/queries/users";
import type {
  AdminUserItem,
  AdminUserSupervisorRef,
  AdminUserSupervisorUpdateResponse,
} from "@/lib/types";
import { toastError, toastSuccess } from "@/lib/toast";

function formatSupervisor(ref?: AdminUserSupervisorRef | null) {
  if (!ref) return "— Belum diatur —";
  const jabatan = ref.jabatan ? ` (${ref.jabatan})` : "";
  return `${ref.nik} — ${ref.nama}${jabatan}`;
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="text-sm font-medium leading-snug">{value}</div>
    </div>
  );
}

type PickerField = "langsung" | "tidak_langsung" | "lainnya";

export function KaryawanSupervisorSection({
  user,
  onUpdated,
}: {
  user: AdminUserItem;
  onUpdated: (data: AdminUserSupervisorUpdateResponse) => void;
}) {
  const updateSupervisors = useUpdateUserSupervisors();
  const employees = useUserList({ limit: 200, offset: 0, is_active: true });

  const [editOpen, setEditOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerField, setPickerField] = useState<PickerField>("langsung");
  const [search, setSearch] = useState("");

  const [draft, setDraft] = useState({
    langsung: user.atasan_langsung ?? null,
    tidak_langsung: user.atasan_tidak_langsung ?? null,
    lainnya: user.atasan_lainnya ?? null,
  });

  const candidates = useMemo(() => {
    const rows = employees.data?.items ?? [];
    const q = search.trim().toLowerCase();
    return rows
      .filter((e) => e.id !== user.id)
      .filter((e) => {
        if (!q) return true;
        return (
          e.nik.toLowerCase().includes(q) ||
          e.nama.toLowerCase().includes(q) ||
          (e.job_title ?? "").toLowerCase().includes(q)
        );
      });
  }, [employees.data?.items, search, user.id]);

  function openEdit() {
    setDraft({
      langsung: user.atasan_langsung ?? null,
      tidak_langsung: user.atasan_tidak_langsung ?? null,
      lainnya: user.atasan_lainnya ?? null,
    });
    setEditOpen(true);
  }

  function openPicker(field: PickerField) {
    setPickerField(field);
    setSearch("");
    setPickerOpen(true);
  }

  function applyPick(ref: AdminUserSupervisorRef) {
    if (pickerField === "langsung") {
      setDraft((d) => ({ ...d, langsung: ref }));
    } else if (pickerField === "tidak_langsung") {
      setDraft((d) => ({ ...d, tidak_langsung: ref }));
    } else {
      setDraft((d) => ({ ...d, lainnya: ref }));
    }
    setPickerOpen(false);
  }

  function clearField(field: PickerField) {
    if (field === "langsung") setDraft((d) => ({ ...d, langsung: null }));
    if (field === "tidak_langsung") setDraft((d) => ({ ...d, tidak_langsung: null }));
    if (field === "lainnya") setDraft((d) => ({ ...d, lainnya: null }));
  }

  async function save() {
    try {
      const body: {
        atasan_langsung_id?: number | null;
        atasan_tidak_langsung_id?: number | null;
        atasan_lainnya_id?: number | null;
      } = {};

      const langsungId = draft.langsung?.id ?? null;
      const tidakId = draft.tidak_langsung?.id ?? null;
      const lainId = draft.lainnya?.id ?? null;

      if (langsungId !== (user.atasan_langsung?.id ?? null)) {
        body.atasan_langsung_id = langsungId;
      }
      if (tidakId !== (user.atasan_tidak_langsung?.id ?? null)) {
        body.atasan_tidak_langsung_id = tidakId;
      }
      if (lainId !== (user.atasan_lainnya?.id ?? null)) {
        body.atasan_lainnya_id = lainId;
      }

      if (Object.keys(body).length === 0) {
        setEditOpen(false);
        return;
      }

      const res = await updateSupervisors.mutateAsync({ userId: user.id, ...body });
      onUpdated(res);
      setEditOpen(false);
      toastSuccess("Atasan karyawan berhasil disimpan.");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Gagal menyimpan atasan.");
    }
  }

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Atasan</div>
        <Button type="button" variant="outline" size="sm" onClick={openEdit}>
          <Pencil className="mr-1 h-3.5 w-3.5" aria-hidden />
          Atur
        </Button>
      </div>
      <Line label="Atasan Langsung" value={formatSupervisor(user.atasan_langsung)} />
      <Line label="Atasan Tidak Langsung" value={formatSupervisor(user.atasan_tidak_langsung)} />
      <Line label="Atasan Lainnya" value={formatSupervisor(user.atasan_lainnya)} />
      <p className="text-xs text-muted-foreground">
        Karyawan juga dapat mengatur atasan di aplikasi mobile (menu Profile). Admin dapat
        mengganti dari sini.
      </p>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atur Atasan — {user.nama}</DialogTitle>
            <DialogDescription>
              Pilih atasan dari daftar karyawan. Tidak boleh memilih diri sendiri.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {(
              [
                ["langsung", "Atasan Langsung", draft.langsung] as const,
                ["tidak_langsung", "Atasan Tidak Langsung", draft.tidak_langsung] as const,
                ["lainnya", "Atasan Lainnya", draft.lainnya] as const,
              ] as const
            ).map(([field, label, ref]) => (
              <div key={field} className="space-y-2 rounded-md border p-3">
                <div className="text-xs font-semibold text-muted-foreground">{label}</div>
                <p className="text-sm font-medium">{formatSupervisor(ref)}</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => openPicker(field)}
                  >
                    Pilih
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => clearField(field)}
                  >
                    Kosongkan
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Batal
            </Button>
            <Button
              type="button"
              onClick={save}
              disabled={updateSupervisors.isPending}
            >
              {updateSupervisors.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="max-h-[85vh] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pilih Karyawan</DialogTitle>
            <DialogDescription>Cari NIK atau nama, lalu pilih dari daftar.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Cari NIK atau nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-64 overflow-y-auto rounded-md border">
            {employees.isLoading ? (
              <p className="p-4 text-sm text-muted-foreground">Memuat daftar...</p>
            ) : candidates.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Tidak ada karyawan ditemukan.</p>
            ) : (
              candidates.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  className="flex w-full flex-col items-start border-b px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() =>
                    applyPick({
                      id: e.id,
                      nik: e.nik,
                      nama: e.nama,
                      jabatan: e.job_title,
                    })
                  }
                >
                  <span className="font-medium">
                    {e.nik} — {e.nama}
                  </span>
                  <span className="text-xs text-muted-foreground">{e.job_title ?? "-"}</span>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
