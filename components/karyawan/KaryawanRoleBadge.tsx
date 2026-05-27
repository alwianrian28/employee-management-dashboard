import type { KaryawanRole } from "@/lib/types";

export type KaryawanFilterRole = "all" | KaryawanRole;

export const KARYAWAN_ROLE_OPTIONS: Array<{ label: string; value: KaryawanFilterRole }> = [
  { label: "Semua", value: "all" },
  { label: "Admin", value: "admin" },
  { label: "Karyawan", value: "karyawan" },
  { label: "Unknown", value: "unknown" },
];

const ROLE_META: Record<KaryawanRole, { label: string; tone: string; ring: string }> = {
  admin: {
    label: "Admin",
    tone: "bg-rose-100 text-rose-700",
    ring: "ring-rose-300/60",
  },
  karyawan: {
    label: "Karyawan",
    tone: "bg-sky-100 text-sky-700",
    ring: "ring-sky-300/60",
  },
  unknown: {
    label: "Unknown",
    tone: "bg-violet-100 text-violet-700",
    ring: "ring-violet-300/60",
  },
};

export function normalizeKaryawanRole(raw: string): KaryawanRole {
  if (raw === "admin" || raw === "karyawan") return raw;
  return "unknown";
}

export function KaryawanRoleBadge({ role }: { role: string }) {
  const meta = ROLE_META[normalizeKaryawanRole(role)];
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${meta.tone} ${meta.ring}`}
    >
      {meta.label}
    </span>
  );
}
