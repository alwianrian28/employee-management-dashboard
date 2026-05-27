export function KaryawanFaceBadge({ registered }: { registered: boolean }) {
  const meta = registered
    ? {
        label: "Wajah terdaftar",
        tone: "bg-emerald-100 text-emerald-800",
        ring: "ring-emerald-300/60",
      }
    : {
        label: "Belum daftar wajah",
        tone: "bg-amber-100 text-amber-900",
        ring: "ring-amber-300/60",
      };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${meta.tone} ${meta.ring}`}
    >
      {meta.label}
    </span>
  );
}
