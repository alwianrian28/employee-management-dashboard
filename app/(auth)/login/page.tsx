"use client";

import Script from "next/script";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  LogIn,
  QrCode,
  RefreshCw,
} from "lucide-react";
import { useLogin } from "@/lib/queries/auth";
import { toastError } from "@/lib/toast";

declare global {
  interface Window {
    QRCode?: new (
      element: HTMLElement,
      options: {
        text: string;
        width: number;
        height: number;
        colorDark?: string;
        colorLight?: string;
      },
    ) => unknown;
  }
}

type QrGenerate = { token: string; expires_in: number };
type QrStatus = { status: "pending" | "authenticated" | "expired" };

const FINGERPRINT_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cellipse cx='100' cy='100' rx='90' ry='90' fill='none' stroke='%23ffffff08' stroke-width='2'/%3E%3Cellipse cx='100' cy='100' rx='75' ry='75' fill='none' stroke='%23ffffff08' stroke-width='2'/%3E%3Cellipse cx='100' cy='100' rx='60' ry='60' fill='none' stroke='%23ffffff08' stroke-width='2'/%3E%3Cellipse cx='100' cy='100' rx='45' ry='45' fill='none' stroke='%23ffffff08' stroke-width='2'/%3E%3Cellipse cx='100' cy='100' rx='30' ry='30' fill='none' stroke='%23ffffff08' stroke-width='2'/%3E%3Cellipse cx='100' cy='100' rx='15' ry='15' fill='none' stroke='%23ffffff08' stroke-width='2'/%3E%3C/svg%3E\")";

function LoginPageInner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrStatus, setQrStatus] = useState("Menunggu scan...");
  const [qrExpired, setQrExpired] = useState(false);
  const [qrTotalSeconds, setQrTotalSeconds] = useState(1);
  const [qrSecondsLeft, setQrSecondsLeft] = useState(0);

  const qrBoxRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const login = useLogin();

  const clearTimers = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const expireQr = useCallback(() => {
    clearTimers();
    setQrToken(null);
    setQrExpired(true);
    setQrStatus("Klik Perbarui untuk QR baru");
  }, [clearTimers]);

  const renderQr = (token: string) => {
    const box = qrBoxRef.current;
    if (!box || !window.QRCode) return;
    box.replaceChildren();
    const QRCtor = window.QRCode;
    new QRCtor(box, {
      text: `WEBLOGIN:${token}`,
      width: 200,
      height: 200,
      colorDark: "#3d4db7",
      colorLight: "#ffffff",
    });
  };

  const startQr = useCallback(async () => {
    clearTimers();
    setQrExpired(false);
    setQrStatus("Membuat QR...");

    try {
      const res = await fetch("/api/auth/qr/generate", { cache: "no-store" });
      if (!res.ok) throw new Error("generate_failed");
      const data: QrGenerate = await res.json();
      const total = Math.max(1, data.expires_in ?? 120);
      setQrToken(data.token);
      setQrTotalSeconds(total);
      setQrSecondsLeft(total);
      setQrStatus("Menunggu scan...");
      setTimeout(() => renderQr(data.token), 0);
    } catch {
      setQrToken(null);
      setQrStatus("Gagal memuat QR");
    }
  }, [clearTimers]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void startQr();
    }, 0);
    return () => {
      window.clearTimeout(t);
      clearTimers();
    };
  }, [startQr, clearTimers]);

  useEffect(() => {
    if (!qrToken || qrExpired) return;

    countdownRef.current = setInterval(() => {
      setQrSecondsLeft((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          expireQr();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [qrToken, qrExpired, expireQr]);

  useEffect(() => {
    if (!qrToken || qrExpired) return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/qr/status/${qrToken}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data: QrStatus = await res.json();
        if (data.status === "authenticated") {
          clearTimers();
          setQrStatus("Terautentikasi! Mengalihkan...");
          window.location.href = `/api/auth/qr/complete/${qrToken}`;
        } else if (data.status === "expired") {
          expireQr();
        }
      } catch {
        // transient
      }
    }, 2000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [qrToken, qrExpired, clearTimers, expireQr]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, password },
      {
        onError: (err) => toastError(err.message || "Login gagal. Coba lagi."),
      },
    );
  };

  const barPct =
    qrToken && qrTotalSeconds > 0
      ? Math.max(0, (qrSecondsLeft / qrTotalSeconds) * 100)
      : 0;

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"
        strategy="afterInteractive"
      />
      <div
        className="relative z-0 flex min-h-screen items-center justify-center px-5 py-8"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, #1a2a5e 0%, #0d1b3e 60%, #060e24 100%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none fixed top-1/2 -left-20 z-0 h-[500px] w-[500px] -translate-y-1/2 bg-center bg-no-repeat opacity-100"
          style={{ backgroundImage: FINGERPRINT_BG, backgroundSize: "contain" }}
        />

        <div
          className="relative z-1 flex w-full max-w-[860px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.4)] lg:flex-row"
        >
          <div className="flex flex-1 flex-col justify-center px-9 py-10 sm:px-11 sm:py-12">
            <div className="mb-1 text-[28px] font-extrabold tracking-[2px] text-[#1e2d6b]">
              SISTEM ABSENSI
              <span className="mt-0.5 block text-[11px] font-light tracking-[4px] text-slate-500">
                HRIS DASHBOARD
              </span>
            </div>

            <p className="mb-6 mt-4 text-[13px] leading-relaxed text-slate-500">
              Demi keamanan, pastikan password Anda diganti secara periodik.
            </p>

            {error === "1" && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
                <AlertCircle className="size-4 shrink-0" aria-hidden />
                Email atau password salah
              </div>
            )}
            {error === "2" && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-[13px] text-amber-900">
                <AlertTriangle className="size-4 shrink-0" aria-hidden />
                Hanya admin yang dapat login ke dashboard
              </div>
            )}
            {error === "qr" && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
                <AlertTriangle className="size-4 shrink-0" aria-hidden />
                QR tidak valid atau sudah kedaluwarsa
              </div>
            )}
            {error === "session" && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-[13px] text-amber-900">
                <AlertTriangle className="size-4 shrink-0" aria-hidden />
                Sesi Anda berakhir atau tidak valid. Silakan masuk kembali.
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Username
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="text"
                    inputMode="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    placeholder="Enter NIK / Email"
                    className="w-full rounded-[10px] border-[1.5px] border-slate-200 bg-slate-50 py-[13px] pl-4 pr-14 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-[#3d4db7] focus:bg-white"
                  />
                  <span
                    className="pointer-events-none absolute right-3 top-1/2 flex size-[34px] -translate-y-1/2 items-center justify-center rounded-[7px] bg-[#3d4db7] text-white"
                    title="Scan QR"
                    aria-hidden
                  >
                    <QrCode className="size-4" />
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                    className="w-full rounded-[10px] border-[1.5px] border-slate-200 bg-slate-50 py-[13px] pl-4 pr-14 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-[#3d4db7] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    className="absolute right-3 top-1/2 flex size-[34px] -translate-y-1/2 items-center justify-center rounded-[7px] text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label={
                      showPassword ? "Sembunyikan password" : "Tampilkan password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden />
                    ) : (
                      <Eye className="size-4" aria-hidden />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={login.isPending}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#3d4db7] py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#2f3d99] disabled:opacity-60"
              >
                <LogIn className="size-[18px]" aria-hidden />
                {login.isPending ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="mt-[18px] text-center text-[13px]">
              <a
                href="#"
                className="font-semibold text-[#3d4db7] no-underline hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                Reset Password
              </a>
            </p>
          </div>

          <div className="mx-8 hidden h-auto w-px shrink-0 self-stretch bg-slate-200 lg:block lg:my-8" />
          <div className="h-px w-full shrink-0 bg-slate-200 lg:hidden" />

          <div className="flex w-full flex-col items-center justify-center bg-[#fafbff] px-8 py-10 sm:px-9 sm:py-12 lg:w-[320px]">
            <div className="relative mb-5 rounded-2xl bg-white p-3.5 shadow-[0_4px_20px_rgba(61,77,183,0.12)]">
              <div
                ref={qrBoxRef}
                className="flex min-h-[200px] min-w-[200px] items-center justify-center [&_canvas]:block [&_canvas]:rounded"
              />
              {!qrToken && !qrExpired && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/90 text-center text-[13px] text-slate-500">
                  Memuat QR...
                </div>
              )}
              {qrExpired && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-white/90">
                  <RefreshCw className="size-7 text-slate-500" aria-hidden />
                  <p className="m-0 text-[13px] text-slate-500">QR kedaluwarsa</p>
                  <button
                    type="button"
                    onClick={() => void startQr()}
                    className="rounded-[7px] bg-[#3d4db7] px-4 py-1.5 text-[13px] text-white hover:bg-[#2f3d99]"
                  >
                    Perbarui
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4 h-[3px] w-full overflow-hidden rounded-sm bg-slate-200">
              <div
                className="h-full bg-linear-to-r from-[#3d4db7] to-[#667eea] transition-[width] duration-1000 ease-linear"
                style={{ width: `${barPct}%` }}
              />
            </div>

            <p className="mb-1.5 text-center text-lg font-bold text-slate-800">
              Sign-In dengan QR
            </p>
            <p className="max-w-[260px] text-center text-[13px] leading-relaxed text-slate-500">
              Scan QR dengan Aplikasi
              <br />
              <strong className="font-semibold text-[#3d4db7]">
                Sistem Absensi Mobile
              </strong>
            </p>
            <p className="mt-2.5 text-center text-xs text-slate-400">{qrStatus}</p>

            {!qrExpired && qrToken && (
              <button
                type="button"
                onClick={() => void startQr()}
                className="mt-4 rounded-[7px] border border-slate-300 bg-white px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
              >
                Perbarui QR
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center text-slate-500"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, #1a2a5e 0%, #0d1b3e 60%, #060e24 100%)",
          }}
        >
          Memuat…
        </div>
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
