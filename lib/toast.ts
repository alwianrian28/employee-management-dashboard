"use client";

import { toast as sonner, type ExternalToast } from "sonner";

/**
 * Thin wrapper around sonner's toast API. Use these helpers for consistent
 * messaging across the dashboard. The `<Toaster />` provider is mounted in
 * `components/providers.tsx`.
 *
 * Style: shorter duration for success/info, longer for errors so the user has
 * time to read. Errors default to non-dismissible-on-click to feel less jumpy.
 */

const DEFAULT_SUCCESS_MS = 3000;
const DEFAULT_INFO_MS = 4000;
const DEFAULT_WARNING_MS = 5000;
const DEFAULT_ERROR_MS = 6000;

export function toastSuccess(message: string, opts?: ExternalToast) {
  return sonner.success(message, { duration: DEFAULT_SUCCESS_MS, ...opts });
}

export function toastError(message: string, opts?: ExternalToast) {
  return sonner.error(message, { duration: DEFAULT_ERROR_MS, ...opts });
}

export function toastInfo(message: string, opts?: ExternalToast) {
  return sonner.info(message, { duration: DEFAULT_INFO_MS, ...opts });
}

export function toastWarning(message: string, opts?: ExternalToast) {
  return sonner.warning(message, { duration: DEFAULT_WARNING_MS, ...opts });
}

/** Direct passthrough to underlying sonner instance for advanced cases (promise, custom). */
export const toast = sonner;
