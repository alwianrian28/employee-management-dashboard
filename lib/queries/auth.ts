import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { UserOut } from "@/lib/types";

const ME_TIMEOUT_MS = 15_000;

export type MeQueryError = Error & { status?: number };

export function useMe() {
  return useQuery<UserOut, MeQueryError>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      let res: Response;
      try {
        res = await fetch("/api/auth/me", {
          signal: AbortSignal.timeout(ME_TIMEOUT_MS),
        });
      } catch {
        const e = new Error(
          "Permintaan habis waktu — pastikan backend jalan dan coba lagi.",
        ) as MeQueryError;
        e.status = 504;
        throw e;
      }

      const data = (await res.json().catch(() => ({}))) as Record<
        string,
        unknown
      >;

      if (res.status === 401) {
        const e = new Error(
          typeof data.detail === "string" ? data.detail : "Sesi tidak valid",
        ) as MeQueryError;
        e.status = 401;
        throw e;
      }

      if (!res.ok) {
        const e = new Error(
          typeof data.detail === "string"
            ? data.detail
            : `Gagal memuat profil (${res.status})`,
        ) as MeQueryError;
        e.status = res.status;
        throw e;
      }

      return data as unknown as UserOut;
    },
    retry: false,
  });
}

export function useLogin() {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation<
    { user: UserOut },
    Error,
    /** Field `email` di API = email atau NIK */
    { email: string; password: string }
  >({
    mutationFn: async (creds) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: creds.email.trim(),
          password: creds.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.message || "Login gagal");
      }
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(["auth", "me"], data.user);
      router.push("/overview");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      qc.clear();
      router.push("/login");
    },
  });
}
