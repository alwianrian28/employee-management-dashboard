import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import type {
  MasterDataPengumumanCreate,
  MasterDataPengumumanItem,
  MasterDataPengumumanUpdate,
  MasterDataResponse,
} from "@/lib/types";

export function useMasterData() {
  return useQuery<MasterDataResponse>({
    queryKey: ["master-data", "all"],
    queryFn: () => adminApi.get<MasterDataResponse>("/master-data"),
    staleTime: 15_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCreatePengumuman() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MasterDataPengumumanCreate) =>
      adminApi.post<MasterDataPengumumanItem>("/master-data/pengumuman", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["master-data", "all"] });
    },
  });
}

export function useUpdatePengumuman() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: MasterDataPengumumanUpdate }) =>
      adminApi.patch<MasterDataPengumumanItem>(`/master-data/pengumuman/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["master-data", "all"] });
    },
  });
}
