// Mirror of backend Pydantic schemas. Keep in sync manually for now;
// future enhancement: auto-gen via openapi-typescript.

export type UserOut = {
  id: number;
  nik: string;
  nama: string;
  email: string | null;
  role: "super_admin" | "hr_admin" | "manager" | "approver" | "viewer" | "admin" | "karyawan";
  primary_role?: string | null;
  permissions?: string[];
  business_unit: string | null;
  departemen: string | null;
  job_title: string | null;
};

export type LoginResponse = {
  token: string;
  user: UserOut;
};

export type ApiError = {
  detail?: string;
  message?: string;
};

// Overview module
export type OverviewKpi = {
  total_active: number;
  hadir_today: number;
  cuti_pending: number;
  late_today: number;
  gender_pria: number;
  gender_wanita: number;
  /** Aktif tanpa gender terisi di tabel biodata (bukan form Karyawan dashboard). */
  active_without_gender_documented: number;
};

export type DistributionItem = {
  label: string;
  count: number;
};

export type TrendPoint = {
  date: string; // ISO date YYYY-MM-DD
  hadir: number;
  telat: number;
  absent: number;
};

export type AnalyticsCountItem = {
  label: string;
  count: number;
};

export type AttendanceTrendPoint = {
  period: string;
  hadir: number;
  telat: number;
  absent: number;
};

export type LeaveMonthlyTrendPoint = {
  month: string;
  total: number;
};

export type ApprovalTrendPoint = {
  date: string;
  approved: number;
  rejected: number;
};

export type AttendanceAnalyticsBlock = {
  status_summary: AnalyticsCountItem[];
  on_time_vs_late: AnalyticsCountItem[];
  absence_distribution: AnalyticsCountItem[];
  trend_daily: AttendanceTrendPoint[];
  trend_weekly: AttendanceTrendPoint[];
};

export type LeaveAnalyticsBlock = {
  status_distribution: AnalyticsCountItem[];
  type_distribution: AnalyticsCountItem[];
  monthly_trend: LeaveMonthlyTrendPoint[];
};

export type OrganizationAnalyticsBlock = {
  by_business_unit: AnalyticsCountItem[];
  by_department: AnalyticsCountItem[];
};

export type ApprovalAnalyticsSummary = {
  approved_7d: number;
  rejected_7d: number;
  total_7d: number;
};

export type ApprovalAnalyticsBlock = {
  trend_daily: ApprovalTrendPoint[];
  recent_counts: ApprovalAnalyticsSummary;
};

export type AdminOverviewAnalyticsResponse = {
  attendance: AttendanceAnalyticsBlock;
  leave: LeaveAnalyticsBlock;
  organization: OrganizationAnalyticsBlock;
  approval: ApprovalAnalyticsBlock;
};

export type AnnouncementOut = {
  id: number;
  judul: string;
  isi: string;
  created_at: string; // ISO timestamp
};

export type LatecomerOut = {
  user_id: number;
  nama: string;
  count: number;
};

// Attendance module
export type AttendanceStatus =
  | "hadir"
  | "telat"
  | "absent"
  | "izin"
  | "alfa"
  | "unknown";

export type AdminAttendanceItem = {
  id: number;
  user_id: number;
  user_nik: string;
  user_nama: string;
  business_unit: string | null;
  departemen: string | null;
  tanggal: string; // ISO date YYYY-MM-DD
  jam_masuk: string | null;
  jam_keluar: string | null;
  status: AttendanceStatus;
  metode: string | null;
  latitude_masuk: number | null;
  longitude_masuk: number | null;
  latitude_keluar: number | null;
  longitude_keluar: number | null;
  foto_masuk: string | null;
  foto_keluar: string | null;
  /** non_shift | driver — dari aplikasi mobile */
  attendance_mode: string | null;
  face_verified: boolean | null;
  face_match_distance: number | null;
};

export type AdminAttendanceSummary = {
  hadir: number;
  telat: number;
  absent: number;
  izin: number;
  alfa: number;
  unknown: number;
};

export type AdminAttendanceListResponse = {
  items: AdminAttendanceItem[];
  total: number;
  limit: number;
  offset: number;
  summary: AdminAttendanceSummary;
};

// Cuti module
export type CutiStatus = "pending" | "approved" | "rejected" | "unknown";

export type AdminCutiItem = {
  id: number;
  user_id: number;
  user_nik: string;
  user_nama: string;
  business_unit: string | null;
  departemen: string | null;
  tipe_cuti: string;
  tanggal_mulai?: string | null;
  tanggal_akhir?: string | null;
  jumlah_hari: number;
  alasan: string | null;
  status: CutiStatus;
  approved_by: number | null;
  approved_at: string | null;
  catatan_approval: string | null;
  created_at: string | null;
};

export type AdminCutiSummary = {
  pending: number;
  approved: number;
  rejected: number;
  unknown: number;
};

export type AdminCutiListResponse = {
  items: AdminCutiItem[];
  total: number;
  limit: number;
  offset: number;
  summary: AdminCutiSummary;
};

export type AdminCutiApprovalHistoryItem = {
  id: number;
  cuti_id: number;
  actor_user_id: number | null;
  actor_nama: string | null;
  previous_status: CutiStatus | string;
  new_status: CutiStatus | string;
  catatan: string | null;
  created_at: string;
};

export type AdminCutiApprovalHistoryResponse = {
  cuti_id: number;
  items: AdminCutiApprovalHistoryItem[];
  total: number;
};

// Karyawan module
export type KaryawanRole = "admin" | "karyawan" | "unknown";

export type AdminUserSupervisorRef = {
  id: number;
  nik: string;
  nama: string;
  jabatan?: string | null;
};

export type AdminUserItem = {
  id: number;
  nik: string;
  nama: string;
  email: string | null;
  role: string;
  job_title: string | null;
  business_unit: string | null;
  departemen: string | null;
  no_hp: string | null;
  no_ktp: string | null;
  no_kk: string | null;
  bpjs_kesehatan: string | null;
  bpjs_ketenagakerjaan: string | null;
  npwp: string | null;
  sim_numbers: string[];
  sim_foto_paths: string[];
  foto_profil: string | null;
  sisa_cuti: number;
  is_active: boolean;
  face_registered: boolean;
  created_at: string | null;
  atasan_langsung?: AdminUserSupervisorRef | null;
  atasan_tidak_langsung?: AdminUserSupervisorRef | null;
  atasan_lainnya?: AdminUserSupervisorRef | null;
};

export type AdminUserSupervisorUpdateResponse = {
  message: string;
  user_id: number;
  atasan_langsung?: AdminUserSupervisorRef | null;
  atasan_tidak_langsung?: AdminUserSupervisorRef | null;
  atasan_lainnya?: AdminUserSupervisorRef | null;
};

export type AdminUserSummary = {
  admin: number;
  karyawan: number;
  unknown_role: number;
  active: number;
  inactive: number;
};

export type AdminUserListResponse = {
  items: AdminUserItem[];
  total: number;
  limit: number;
  offset: number;
  summary: AdminUserSummary;
};

// Master data module
export type MasterDataSimpleItem = {
  id: number;
  nama: string;
};

export type MasterDataShiftItem = {
  id: number;
  nama: string;
  jam_masuk: string;
  jam_keluar: string;
  toleransi_menit: number;
  is_active: boolean;
};

export type MasterDataTipeCutiItem = {
  id: number;
  nama: string;
  is_active: boolean;
};

export type MasterDataPengumumanItem = {
  id: number;
  judul: string;
  isi: string;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export type MasterDataSummary = {
  business_units: number;
  departments: number;
  job_titles: number;
  shifts: number;
  tipe_cuti: number;
  pengumuman_active: number;
};

export type MasterDataResponse = {
  summary: MasterDataSummary;
  business_units: MasterDataSimpleItem[];
  departments: MasterDataSimpleItem[];
  job_titles: MasterDataSimpleItem[];
  shifts: MasterDataShiftItem[];
  tipe_cuti: MasterDataTipeCutiItem[];
  pengumuman: MasterDataPengumumanItem[];
};

export type MasterDataPengumumanCreate = {
  judul: string;
  isi: string;
  is_active?: boolean;
};

export type MasterDataPengumumanUpdate = {
  judul?: string;
  isi?: string;
  is_active?: boolean;
};

// Reports module
export type ReportsAttendanceSummary = {
  hadir: number;
  telat: number;
  absent: number;
  unknown: number;
  total: number;
};

export type ReportsCutiSummary = {
  pending: number;
  approved: number;
  rejected: number;
  unknown: number;
  total: number;
};

export type ReportsEmployeeSummary = {
  admin: number;
  karyawan: number;
  unknown_role: number;
  active: number;
  inactive: number;
  total: number;
};

export type ReportsSummaryResponse = {
  attendance: ReportsAttendanceSummary;
  cuti: ReportsCutiSummary;
  employee: ReportsEmployeeSummary;
};

// Audit module
export type AdminAuditLogItem = {
  id: number;
  actor_user_id: number | null;
  actor_nama: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  summary: string;
  metadata_json: string | null;
  created_at: string;
};

export type AdminAuditSummary = {
  total: number;
  today: number;
};

export type AdminAuditListResponse = {
  items: AdminAuditLogItem[];
  total: number;
  limit: number;
  offset: number;
  summary: AdminAuditSummary;
};
