#!/usr/bin/env bash
# Jalankan sebelum git add / push — pastikan tidak ada .env ter-track
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

FAIL=0
while IFS= read -r -d '' f; do
  case "$f" in
    *.example|*env.*.example|*/env.*.example) continue ;;
  esac
  echo "BLOCKED: $f"
  FAIL=1
done < <(find . -name '.env*' -not -path './.git/*' -print0 2>/dev/null)

if git rev-parse --git-dir >/dev/null 2>&1; then
  if git ls-files --error-unmatch .env .env.local backend/.env 2>/dev/null; then
    echo "BLOCKED: .env sudah ter-track git — jalankan: git rm --cached <file>"
    FAIL=1
  fi
  TRACKED=$(git ls-files | grep -E '(^|/)\.env(\.|$)' | grep -v example || true)
  if [ -n "$TRACKED" ]; then
    echo "BLOCKED: file env ter-track:"
    echo "$TRACKED"
    FAIL=1
  fi
fi

if [ "$FAIL" -eq 1 ]; then
  echo "Gagal — hapus .env dari staging/commit."
  exit 1
fi
echo "OK — tidak ada .env yang akan ter-upload."
