"use client";

import { useMemo, useRef, useState } from "react";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { ErrorCard } from "@/components/ErrorCard";
import { SectionHeader } from "@/components/SectionHeader";
import { KaryawanFaceBadge } from "@/components/karyawan/KaryawanFaceBadge";
import { KaryawanProfilePhoto } from "@/components/karyawan/KaryawanProfilePhoto";
import { KaryawanFilterBar } from "@/components/karyawan/KaryawanFilterBar";
import { KaryawanRoleBadge, type KaryawanFilterRole } from "@/components/karyawan/KaryawanRoleBadge";
import { KaryawanMobileCard } from "@/components/karyawan/KaryawanMobileCard";
import { KaryawanDetailPanel } from "@/components/karyawan/KaryawanDetailPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminUploadDocument } from "@/lib/api";
import { useMasterData } from "@/lib/queries/master-data";
import { useCreateUser, useToggleUserStatus, useUserList } from "@/lib/queries/users";
import { toastError, toastInfo, toastSuccess } from "@/lib/toast";
import type { AdminUserItem } from "@/lib/types";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function pathBasename(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}

type SearchableInputProps = {
  id: string;
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  onChange: (nextValue: string) => void;
};

function SearchableInput({
  id,
  label,
  value,
  options,
  placeholder,
  onChange,
}: SearchableInputProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const filteredOptions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return options.slice(0, 8);
    return options.filter((opt) => opt.toLowerCase().includes(q)).slice(0, 8);
  }, [options, value]);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          onFocus={() => {
            setOpen(true);
            setActiveIndex(-1);
          }}
          onBlur={() => {
            setTimeout(() => setOpen(false), 120);
          }}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              if (!open) {
                setOpen(true);
                setActiveIndex(0);
                return;
              }
              e.preventDefault();
              setActiveIndex((prev) => {
                if (filteredOptions.length === 0) return -1;
                if (prev < 0) return 0;
                return Math.min(prev + 1, filteredOptions.length - 1);
              });
              return;
            }
            if (e.key === "ArrowUp") {
              if (!open) return;
              e.preventDefault();
              setActiveIndex((prev) => {
                if (filteredOptions.length === 0) return -1;
                if (prev < 0) return filteredOptions.length - 1;
                return Math.max(prev - 1, 0);
              });
              return;
            }
            if (e.key === "Escape") {
              setOpen(false);
              setActiveIndex(-1);
              return;
            }
            if ((e.key === "Tab" || e.key === "Enter") && filteredOptions.length > 0) {
              const picked =
                activeIndex >= 0 && activeIndex < filteredOptions.length
                  ? filteredOptions[activeIndex]
                  : filteredOptions[0];
              onChange(picked);
              setOpen(false);
              setActiveIndex(-1);
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }
          }}
        />
        {open && filteredOptions.length > 0 ? (
          <div className="absolute z-50 mt-1 max-h-44 w-full overflow-auto rounded-md border bg-background shadow-md">
            {filteredOptions.map((opt, idx) => (
              <div
                key={opt}
                className={`block w-full px-3 py-2 text-left text-sm cursor-pointer ${
                  idx === activeIndex ? "bg-accent" : "hover:bg-accent"
                }`}
                role="option"
                aria-selected={idx === activeIndex}
                tabIndex={-1}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt);
                  setOpen(false);
                  setActiveIndex(-1);
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function KaryawanPage() {
  const SUMMARY_CARD_CLASS = "min-h-28";
  const PAGE_SIZE = 20;
  const [qInput, setQInput] = useState("");
  const [businessUnitInput, setBusinessUnitInput] = useState("");
  const [departemenInput, setDepartemenInput] = useState("");
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [roleInput, setRoleInput] = useState<KaryawanFilterRole>("all");
  const [activeOnlyInput, setActiveOnlyInput] = useState(false);

  const [q, setQ] = useState("");
  const [businessUnit, setBusinessUnit] = useState("");
  const [departemen, setDepartemen] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [role, setRole] = useState<KaryawanFilterRole>("all");
  const [activeOnly, setActiveOnly] = useState(false);
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<AdminUserItem | null>(null);
  const toggleStatus = useToggleUserStatus();
  const createUser = useCreateUser();
  const masterData = useMasterData();
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const simPhotosInputRef = useRef<HTMLInputElement>(null);
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const [uploadingSimPhotos, setUploadingSimPhotos] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [newUser, setNewUser] = useState({
    nik: "",
    nama: "",
    email: "",
    password: "",
    role: "karyawan" as "admin" | "karyawan",
    business_unit: "",
    departemen: "",
    job_title: "",
    no_ktp: "",
    no_kk: "",
    bpjs_kesehatan: "",
    bpjs_ketenagakerjaan: "",
    npwp: "",
    sim_numbers_raw: "",
    sim_foto_paths: [] as string[],
    foto_profil: "",
  });

  const params = useMemo(
    () => ({
      q: q || undefined,
      business_unit: businessUnit || undefined,
      departemen: departemen || undefined,
      job_title: jobTitle || undefined,
      role: role === "all" ? undefined : role,
      is_active: activeOnly ? true : undefined,
      limit: PAGE_SIZE,
      offset,
    }),
    [q, businessUnit, departemen, jobTitle, role, activeOnly, offset],
  );

  const users = useUserList(params);
  const data = users.data;
  const businessUnitOptions = useMemo(
    () => (masterData.data?.business_units ?? []).map((item) => item.nama),
    [masterData.data?.business_units],
  );
  const departmentOptions = useMemo(
    () => (masterData.data?.departments ?? []).map((item) => item.nama),
    [masterData.data?.departments],
  );
  const jobTitleOptions = useMemo(
    () => (masterData.data?.job_titles ?? []).map((item) => item.nama),
    [masterData.data?.job_titles],
  );
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  function applyFilters() {
    setQ(qInput.trim());
    setBusinessUnit(businessUnitInput.trim());
    setDepartemen(departemenInput.trim());
    setJobTitle(jobTitleInput.trim());
    setRole(roleInput);
    setActiveOnly(activeOnlyInput);
    setOffset(0);
    toastInfo("Filter karyawan diterapkan.");
  }

  function resetFilters() {
    setQInput("");
    setBusinessUnitInput("");
    setDepartemenInput("");
    setJobTitleInput("");
    setRoleInput("all");
    setActiveOnlyInput(false);
    setQ("");
    setBusinessUnit("");
    setDepartemen("");
    setJobTitle("");
    setRole("all");
    setActiveOnly(false);
    setOffset(0);
  }

  function handleToggleStatus(nextActive: boolean) {
    if (!selected) return;
    toggleStatus.mutate(
      { userId: selected.id, isActive: nextActive },
      {
        onSuccess: () => {
          setSelected((prev) => (prev ? { ...prev, is_active: nextActive } : prev));
          toastSuccess(
            nextActive
              ? "Karyawan berhasil diaktifkan."
              : "Karyawan berhasil dinonaktifkan.",
          );
          users.refetch();
        },
        onError: (err: Error) => {
          toastError(err.message || "Gagal memperbarui status karyawan.");
        },
      },
    );
  }

  async function handleProfilePhotoSelected(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploadingProfilePhoto(true);
    try {
      const { path } = await adminUploadDocument("profile", file);
      setNewUser((s) => ({ ...s, foto_profil: path }));
      toastSuccess("Foto profil berhasil diunggah.");
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Gagal mengunggah foto profil.");
    } finally {
      setUploadingProfilePhoto(false);
      if (profilePhotoInputRef.current) profilePhotoInputRef.current.value = "";
    }
  }

  async function handleSimPhotosSelected(files: FileList | null) {
    if (!files?.length) return;
    setUploadingSimPhotos(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const { path } = await adminUploadDocument("sim", file);
        uploaded.push(path);
      }
      setNewUser((s) => ({
        ...s,
        sim_foto_paths: [...s.sim_foto_paths, ...uploaded],
      }));
      toastSuccess(`${uploaded.length} foto SIM berhasil diunggah.`);
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : "Gagal mengunggah foto SIM.");
    } finally {
      setUploadingSimPhotos(false);
      if (simPhotosInputRef.current) simPhotosInputRef.current.value = "";
    }
  }

  function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    const ktp = digitsOnly(newUser.no_ktp);
    const kk = digitsOnly(newUser.no_kk);
    const bpjsKes = digitsOnly(newUser.bpjs_kesehatan);
    const bpjsTk = digitsOnly(newUser.bpjs_ketenagakerjaan);
    const npwpVal = newUser.npwp.trim();
    if (ktp.length !== 16 || kk.length !== 16) {
      toastError("No KTP dan No KK wajib masing-masing tepat 16 digit angka.");
      return;
    }
    if (bpjsKes.length !== 13 || bpjsTk.length !== 11) {
      toastError(
        "BPJS Kesehatan wajib 13 digit angka; BPJS Ketenagakerjaan wajib 11 digit angka.",
      );
      return;
    }
    if (npwpVal.length < 15 || npwpVal.length > 16) {
      toastError("NPWP wajib 15–16 karakter (huruf, angka, titik, atau strip).");
      return;
    }
    if (!/^[\dA-Za-z.\-]{15,16}$/.test(npwpVal)) {
      toastError("NPWP hanya boleh huruf, angka, titik (.), atau strip (-).");
      return;
    }
    createUser.mutate(
      {
        nik: newUser.nik.trim(),
        nama: newUser.nama.trim(),
        email: newUser.email.trim() || undefined,
        password: newUser.password,
        role: newUser.role,
        business_unit: newUser.business_unit.trim() || undefined,
        departemen: newUser.departemen.trim() || undefined,
        job_title: newUser.job_title.trim() || undefined,
        no_ktp: ktp,
        no_kk: kk,
        bpjs_kesehatan: bpjsKes,
        bpjs_ketenagakerjaan: bpjsTk,
        npwp: npwpVal,
        sim_numbers: newUser.sim_numbers_raw
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
        sim_foto_paths: newUser.sim_foto_paths,
        foto_profil: newUser.foto_profil.trim() || undefined,
        is_active: true,
      },
      {
        onSuccess: () => {
          toastSuccess("Karyawan berhasil ditambahkan.");
          setOpenCreate(false);
          setNewUser({
            nik: "",
            nama: "",
            email: "",
            password: "",
            role: "karyawan",
            business_unit: "",
            departemen: "",
            job_title: "",
            no_ktp: "",
            no_kk: "",
            bpjs_kesehatan: "",
            bpjs_ketenagakerjaan: "",
            npwp: "",
            sim_numbers_raw: "",
            sim_foto_paths: [],
            foto_profil: "",
          });
          users.refetch();
        },
        onError: (err: Error) => {
          toastError(err.message || "Gagal menambahkan karyawan.");
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Karyawan"
        description="Monitor daftar karyawan dengan filter dan detail terstruktur."
      />
      <div className="flex justify-end">
        <Button onClick={() => setOpenCreate(true)}>Tambah Karyawan</Button>
      </div>

      <KaryawanFilterBar
        qInput={qInput}
        businessUnitInput={businessUnitInput}
        departemenInput={departemenInput}
        jobTitleInput={jobTitleInput}
        roleInput={roleInput}
        activeOnlyInput={activeOnlyInput}
        onQChange={setQInput}
        onBusinessUnitChange={setBusinessUnitInput}
        onDepartemenChange={setDepartemenInput}
        onJobTitleChange={setJobTitleInput}
        onRoleChange={setRoleInput}
        onActiveOnlyChange={setActiveOnlyInput}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      {users.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-2">
                <Skeleton className="h-3 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-14" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className={SUMMARY_CARD_CLASS}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold tracking-tight">{data.total}</CardContent>
          </Card>
          <Card className={SUMMARY_CARD_CLASS}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase text-muted-foreground">Admin</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold tracking-tight">{data.summary.admin}</CardContent>
          </Card>
          <Card className={SUMMARY_CARD_CLASS}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase text-muted-foreground">Karyawan</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold tracking-tight">{data.summary.karyawan}</CardContent>
          </Card>
          <Card className={SUMMARY_CARD_CLASS}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold tracking-tight">{data.summary.active}</CardContent>
          </Card>
          <Card className={SUMMARY_CARD_CLASS}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase text-muted-foreground">Inactive</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold tracking-tight">{data.summary.inactive}</CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar Karyawan</CardTitle>
        </CardHeader>
        <CardContent>
          {users.isError ? (
            <ErrorCard
              title="Gagal memuat daftar karyawan"
              description={users.error?.message}
              onRetry={() => users.refetch()}
              retrying={users.isFetching}
            />
          ) : users.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="h-10 w-full" />
              ))}
            </div>
          ) : data && data.items.length > 0 ? (
            <div className="space-y-3">
              <div className="hidden md:block overflow-hidden rounded-md border">
                <Table className="min-w-[900px]">
                  <TableHeader className="[&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:bg-background">
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Business Unit</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Atasan Langsung</TableHead>
                      <TableHead>Registrasi wajah</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((item) => (
                      <TableRow
                        key={item.id}
                        className="cursor-pointer transition-colors data-[state=active]:bg-muted"
                        data-state={selected?.id === item.id ? "active" : undefined}
                        onClick={() => setSelected(item)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Lihat detail karyawan ${item.nama}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelected(item);
                          }
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <KaryawanProfilePhoto
                              path={item.foto_profil}
                              name={item.nama}
                              size="sm"
                            />
                            <span>{item.nama}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <KaryawanRoleBadge role={item.role} />
                        </TableCell>
                        <TableCell>{item.email ?? "-"}</TableCell>
                        <TableCell>{item.business_unit ?? "-"}</TableCell>
                        <TableCell>{item.departemen ?? "-"}</TableCell>
                        <TableCell>{item.job_title ?? "-"}</TableCell>
                        <TableCell className="max-w-[180px] truncate text-sm">
                          {item.atasan_langsung
                            ? `${item.atasan_langsung.nama}`
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <KaryawanFaceBadge registered={item.face_registered} />
                        </TableCell>
                        <TableCell>{item.is_active ? "Active" : "Inactive"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-3 md:hidden">
                {data.items.map((item) => (
                  <KaryawanMobileCard
                    key={item.id}
                    item={item}
                    active={selected?.id === item.id}
                    onSelect={setSelected}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <div>
                  Menampilkan {data.items.length} data (halaman {currentPage}/{totalPages}, total{" "}
                  {data.total}).
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={offset <= 0}
                    onClick={() => setOffset((prev) => Math.max(0, prev - PAGE_SIZE))}
                  >
                    Prev
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={offset + PAGE_SIZE >= data.total}
                    onClick={() => setOffset((prev) => prev + PAGE_SIZE)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="Belum ada data karyawan"
              description="Belum ada data yang cocok. Ubah filter atau jalankan seed demo untuk data karyawan."
            />
          )}
        </CardContent>
      </Card>

      <KaryawanDetailPanel
        selected={selected}
        onClose={() => setSelected(null)}
        onToggleStatus={handleToggleStatus}
        onSupervisorsUpdated={(data) => {
          setSelected((prev) =>
            prev?.id === data.user_id
              ? {
                  ...prev,
                  atasan_langsung: data.atasan_langsung ?? null,
                  atasan_tidak_langsung: data.atasan_tidak_langsung ?? null,
                  atasan_lainnya: data.atasan_lainnya ?? null,
                }
              : prev,
          );
        }}
        toggling={toggleStatus.isPending}
      />

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Tambah Karyawan</DialogTitle>
            <DialogDescription>
              Tambah data karyawan baru tanpa menghapus NIK lama.
            </DialogDescription>
          </DialogHeader>
          <form id="create-user-form" onSubmit={handleCreateUser} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="new-nik">NIK</Label>
                <Input
                  id="new-nik"
                  value={newUser.nik}
                  onChange={(e) => setNewUser((s) => ({ ...s, nik: e.target.value }))}
                  placeholder="Contoh: KRY001"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-role">Role</Label>
                <select
                  id="new-role"
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser((s) => ({ ...s, role: e.target.value as "admin" | "karyawan" }))
                  }
                >
                  <option value="karyawan">Karyawan</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-nama">Nama</Label>
              <Input
                id="new-nama"
                value={newUser.nama}
                onChange={(e) => setNewUser((s) => ({ ...s, nama: e.target.value }))}
                placeholder="Nama lengkap karyawan"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser((s) => ({ ...s, email: e.target.value }))}
                placeholder="nama.karyawan@perusahaan.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser((s) => ({ ...s, password: e.target.value }))}
                placeholder="Minimal 6 karakter"
                minLength={6}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <SearchableInput
                id="new-bu"
                label="Business Unit"
                value={newUser.business_unit}
                options={businessUnitOptions}
                placeholder="Pilih atau ketik business unit"
                onChange={(nextValue) =>
                  setNewUser((s) => ({ ...s, business_unit: nextValue }))
                }
              />
              <SearchableInput
                id="new-dept"
                label="Department"
                value={newUser.departemen}
                options={departmentOptions}
                placeholder="Pilih atau ketik department"
                onChange={(nextValue) =>
                  setNewUser((s) => ({ ...s, departemen: nextValue }))
                }
              />
              <SearchableInput
                id="new-job"
                label="Job Title"
                value={newUser.job_title}
                options={jobTitleOptions}
                placeholder="Pilih atau ketik job title"
                onChange={(nextValue) =>
                  setNewUser((s) => ({ ...s, job_title: nextValue }))
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="new-ktp">No KTP</Label>
                <Input
                  id="new-ktp"
                  inputMode="numeric"
                  autoComplete="off"
                  required
                  maxLength={16}
                  value={newUser.no_ktp}
                  onChange={(e) =>
                    setNewUser((s) => ({
                      ...s,
                      no_ktp: digitsOnly(e.target.value).slice(0, 16),
                    }))
                  }
                  placeholder="16 digit angka"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-kk">No KK</Label>
                <Input
                  id="new-kk"
                  inputMode="numeric"
                  autoComplete="off"
                  required
                  maxLength={16}
                  value={newUser.no_kk}
                  onChange={(e) =>
                    setNewUser((s) => ({
                      ...s,
                      no_kk: digitsOnly(e.target.value).slice(0, 16),
                    }))
                  }
                  placeholder="16 digit angka"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="new-bpjs-kes">BPJS Kesehatan</Label>
                <Input
                  id="new-bpjs-kes"
                  inputMode="numeric"
                  autoComplete="off"
                  required
                  maxLength={13}
                  value={newUser.bpjs_kesehatan}
                  onChange={(e) =>
                    setNewUser((s) => ({
                      ...s,
                      bpjs_kesehatan: digitsOnly(e.target.value).slice(0, 13),
                    }))
                  }
                  placeholder="13 digit angka"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-bpjs-tk">BPJS Ketenagakerjaan</Label>
                <Input
                  id="new-bpjs-tk"
                  inputMode="numeric"
                  autoComplete="off"
                  required
                  maxLength={11}
                  value={newUser.bpjs_ketenagakerjaan}
                  onChange={(e) =>
                    setNewUser((s) => ({
                      ...s,
                      bpjs_ketenagakerjaan: digitsOnly(e.target.value).slice(0, 11),
                    }))
                  }
                  placeholder="11 digit angka"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-npwp">NPWP</Label>
              <Input
                id="new-npwp"
                autoComplete="off"
                required
                maxLength={16}
                value={newUser.npwp}
                onChange={(e) =>
                  setNewUser((s) => ({
                    ...s,
                    npwp: e.target.value.replace(/[^0-9A-Za-z.\-]/g, "").slice(0, 16),
                  }))
                }
                placeholder="15–16 karakter (huruf/angka/titik/strip)"
              />
            </div>
            <div className="space-y-2 rounded-lg border p-3">
              <div className="space-y-1.5">
                <Label htmlFor="new-sim-types">Jenis SIM (opsional)</Label>
                <Input
                  id="new-sim-types"
                  value={newUser.sim_numbers_raw}
                  onChange={(e) => setNewUser((s) => ({ ...s, sim_numbers_raw: e.target.value }))}
                  placeholder="Contoh: A, C, B1"
                />
              </div>
              <input
                ref={simPhotosInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                aria-hidden
                onChange={(e) => void handleSimPhotosSelected(e.target.files)}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={
                  createUser.isPending || uploadingSimPhotos || uploadingProfilePhoto
                }
                onClick={() => simPhotosInputRef.current?.click()}
              >
                {uploadingSimPhotos ? "Mengunggah foto SIM…" : "Pilih foto SIM dari komputer"}
              </Button>
              <p className="text-[11px] text-muted-foreground">
                Membuka jendela pemilih file di perangkat Anda. Bisa beberapa file sekaligus.
              </p>
              {newUser.sim_foto_paths.length > 0 ? (
                <ul className="space-y-1 text-xs">
                  {newUser.sim_foto_paths.map((p) => (
                    <li
                      key={p}
                      className="flex items-center justify-between gap-2 rounded border bg-muted/40 px-2 py-1"
                    >
                      <span className="truncate">{pathBasename(p)}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="shrink-0 h-7 px-2"
                        onClick={() =>
                          setNewUser((s) => ({
                            ...s,
                            sim_foto_paths: s.sim_foto_paths.filter((x) => x !== p),
                          }))
                        }
                      >
                        Hapus
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="space-y-2 rounded-lg border p-3">
              <Label>Foto profil (opsional, untuk dataset wajah)</Label>
              <input
                ref={profilePhotoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                aria-hidden
                onChange={(e) => void handleProfilePhotoSelected(e.target.files)}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={
                  createUser.isPending || uploadingProfilePhoto || uploadingSimPhotos
                }
                onClick={() => profilePhotoInputRef.current?.click()}
              >
                {uploadingProfilePhoto
                  ? "Mengunggah foto profil…"
                  : "Pilih foto profil dari komputer"}
              </Button>
              <p className="text-[11px] text-muted-foreground">
                JPEG / PNG / WebP, maks. 5 MB per file (dibatasi server).
              </p>
              {newUser.foto_profil ? (
                <div className="flex items-center justify-between gap-2 rounded border bg-muted/40 px-2 py-1 text-xs">
                  <span className="truncate">{pathBasename(newUser.foto_profil)}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="shrink-0 h-7 px-2"
                    onClick={() => setNewUser((s) => ({ ...s, foto_profil: "" }))}
                  >
                    Hapus
                  </Button>
                </div>
              ) : null}
            </div>
          </form>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenCreate(false)}
              disabled={
                createUser.isPending || uploadingProfilePhoto || uploadingSimPhotos
              }
            >
              Batal
            </Button>
            <Button
              form="create-user-form"
              type="submit"
              disabled={
                createUser.isPending || uploadingProfilePhoto || uploadingSimPhotos
              }
            >
              {createUser.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
