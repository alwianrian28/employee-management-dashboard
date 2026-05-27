# employee-management-dashboard

**Next.js** dashboard untuk **manajemen karyawan** dan **master data** HRIS — daftar karyawan, filter organisasi, pengumuman, shift, departemen, dan entitas master lainnya.

**Repository:** [github.com/alwianrian28/employee-management-dashboard](https://github.com/alwianrian28/employee-management-dashboard)

---

## Related projects

| Repo | Role |
|------|------|
| [absensi-backend](https://github.com/alwianrian28/absensi-backend) | REST API |
| [hris-dashboard](https://github.com/alwianrian28/hris-dashboard) | Operasional (attendance, cuti, reports, audit) |
| [attendance-mobile-app](https://github.com/alwianrian28/attendance-mobile-app) | App karyawan + QR login |

---

## Tech stack

- **Next.js 16** (App Router) + TypeScript
- **TanStack Query** + **TanStack Table**
- **shadcn/ui** + Tailwind CSS v4
- Shared auth pattern dengan [hris-dashboard](https://github.com/alwianrian28/hris-dashboard) (cookie + API proxy)

---

## Modules

| Route | Permission | Description |
|-------|------------|-------------|
| `/karyawan` | `users.manage` | Daftar karyawan, filter, detail panel, foto profil |
| `/master-data` | `master_data.read` | BU, departemen, job title, shift, tipe cuti, pengumuman |
| `/login` | — | Email/password + QR sign-in (sama seperti HRIS ops) |

Branding UI: **HRIS Employee Hub**

---

## Why a separate repo?

Memisahkan **people & master data** dari **operasional harian** (attendance/cuti/reports) agar:

- Portfolio lebih jelas per domain
- Deploy independen (port / subdomain terpisah)
- Tetap satu backend & satu database via [absensi-backend](https://github.com/alwianrian28/absensi-backend)

---

## Quick start

### Prerequisites

- Node.js 20+
- [absensi-backend](https://github.com/alwianrian28/absensi-backend) on `http://localhost:8000`

### 1. Environment

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Jangan commit** `.env.local`.

### 2. Install & run

```bash
npm install
npm run dev
```

Dev server: [http://localhost:3001](http://localhost:3001) (port **3001** agar tidak bentrok dengan [hris-dashboard](https://github.com/alwianrian28/hris-dashboard) di :3000).

### 3. Production build

```bash
npm run build
npm start -p 3001
```

---

## Architecture

```
Browser (port 3001)
  → /api/admin/* proxy
    → absensi-backend
```

Login & QR flow identik dengan [hris-dashboard](https://github.com/alwianrian28/hris-dashboard); setelah login, redirect default ke `/karyawan`.

---

## Security — environment files

| File | Git |
|------|-----|
| `.env.local.example` | ✅ Commit |
| `.env.local`, `.env*` | ❌ **Never commit** |

```bash
bash scripts/check-no-env.sh
```

---

## Project structure

```
employee-management-dashboard/
├── app/(app)/karyawan/
├── app/(app)/master-data/
├── components/karyawan/
├── components/master-data/
├── lib/queries/users.ts
├── lib/queries/master-data.ts
└── proxy.ts
```

---

## Production tip

Gunakan subdomain terpisah, misalnya:

- `hris.example.com` → [hris-dashboard](https://github.com/alwianrian28/hris-dashboard)
- `people.example.com` → **repo ini**

Cookie auth tidak shared antar subdomain — admin login per app (sesuai desain).

---

## License

Proyek Tugas Akhir / portfolio.
