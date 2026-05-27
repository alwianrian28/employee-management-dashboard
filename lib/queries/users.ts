import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import type {
  AdminUserListResponse,
  AdminUserSupervisorUpdateResponse,
} from "@/lib/types";

export type UserListParams = {
  q?: string;
  role?: "admin" | "karyawan" | "unknown";
  is_active?: boolean;
  business_unit?: string;
  departemen?: string;
  job_title?: string;
  limit?: number;
  offset?: number;
};

export type CreateUserPayload = {
  nik: string;
  nama: string;
  email?: string | null;
  password: string;
  role: "admin" | "karyawan";
  job_title?: string | null;
  jabatan?: string | null;
  business_unit?: string | null;
  departemen?: string | null;
  no_hp?: string | null;
  no_ktp?: string | null;
  no_kk?: string | null;
  bpjs_kesehatan?: string | null;
  bpjs_ketenagakerjaan?: string | null;
  npwp?: string | null;
  sim_numbers?: string[];
  sim_foto_paths?: string[];
  foto_profil?: string | null;
  sisa_cuti?: number;
  is_active?: boolean;
};

export function useUserList(params: UserListParams) {
  return useQuery<AdminUserListResponse>({
    queryKey: ["users", "list", params],
    queryFn: () => adminApi.get<AdminUserListResponse>("/users", params),
    staleTime: 20_000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

export function useToggleUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) =>
      adminApi.patch<{ message: string; user_id: number; is_active: boolean }>(
        `/users/${userId}/status`,
        { is_active: isActive },
      ),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateUserPayload) =>
      adminApi.post<{ message: string; id: number }>("/users", payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
}

export type UpdateUserSupervisorsPayload = {
  userId: number;
  atasan_langsung_id?: number | null;
  atasan_tidak_langsung_id?: number | null;
  atasan_lainnya_id?: number | null;
};

export function useUpdateUserSupervisors() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, ...body }: UpdateUserSupervisorsPayload) =>
      adminApi.patch<AdminUserSupervisorUpdateResponse>(
        `/users/${userId}/supervisors`,
        body,
      ),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["users", "list"] });
    },
  });
}
