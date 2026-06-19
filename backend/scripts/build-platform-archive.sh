#!/usr/bin/env bash
# Builds the full platform source archive (ZIP) and places it in the backend data volume.
# Run this script from the project root (/opt/projects/nutrisense-i) after any code change.
#
# Usage:
#   cd /opt/projects/nutrisense-i
#   bash backend/scripts/build-platform-archive.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKEND_DATA_VOL="/var/lib/docker/volumes/nutrisense-i_backend_data/_data"
OUTPUT="$BACKEND_DATA_VOL/platform-archive.zip"

echo "==> NutriAID Platform Archive Builder"
echo "    Source : $PROJECT_ROOT"
echo "    Output : $OUTPUT"
echo ""

if [ ! -d "$BACKEND_DATA_VOL" ]; then
  echo "ERROR: Backend data volume not found at $BACKEND_DATA_VOL"
  echo "       Make sure Docker containers are running: docker compose up -d"
  exit 1
fi

echo "==> Creating ZIP archive (excluding only secrets and runtime DB)..."
echo "    Atentie: include node_modules si .next — arhiva va fi mare (~1-2 GB)."

python3 - "$PROJECT_ROOT" "$OUTPUT" <<'PYEOF'
import zipfile, os, sys

PROJECT_ROOT = sys.argv[1]
OUTPUT = sys.argv[2]
TEMP = OUTPUT + ".tmp"

EXCLUDE_DIRS = {
    "backend/data",
    "__pycache__",
}
EXCLUDE_EXTS = {".zip"}
EXCLUDE_FILES = {".env", ".env.local", ".env.production", ".env.development.local", ".env.test.local"}

def should_skip(rel: str) -> bool:
    parts = rel.replace("\\", "/").split("/")
    for ex in EXCLUDE_DIRS:
        ex_parts = ex.split("/")
        n = len(ex_parts)
        for i in range(len(parts) - n + 1):
            if parts[i:i+n] == ex_parts:
                return True
    _, ext = os.path.splitext(parts[-1])
    if ext in EXCLUDE_EXTS:
        return True
    if parts[-1] in EXCLUDE_FILES:
        return True
    return False

count = 0
with zipfile.ZipFile(TEMP, "w", zipfile.ZIP_DEFLATED, allowZip64=True) as zf:
    for dirpath, dirnames, filenames in os.walk(PROJECT_ROOT):
        rel_dir = os.path.relpath(dirpath, PROJECT_ROOT)
        if rel_dir == ".":
            rel_dir = ""
        if rel_dir and should_skip(rel_dir):
            dirnames.clear()
            continue
        dirnames[:] = [
            d for d in dirnames
            if not should_skip(os.path.join(rel_dir, d) if rel_dir else d)
        ]
        for fname in filenames:
            rel_file = os.path.join(rel_dir, fname) if rel_dir else fname
            if should_skip(rel_file):
                continue
            abs_file = os.path.join(dirpath, fname)
            try:
                zf.write(abs_file, rel_file)
                count += 1
                if count % 1000 == 0:
                    print(f"  {count} files...", flush=True)
            except (PermissionError, OSError) as e:
                print(f"  SKIP {rel_file}: {e}", file=sys.stderr)

os.replace(TEMP, OUTPUT)
size_mb = os.path.getsize(OUTPUT) / (1024 * 1024)
print(f"  {count} files incluse -> {size_mb:.1f} MB")
PYEOF

SIZE=$(du -sh "$OUTPUT" | cut -f1)
echo ""
echo "==> Done! Archive: $OUTPUT ($SIZE)"
echo "    Endpoint: /api/superadmin/archive/download?token=..."
echo "    Re-run this script after any code update."
