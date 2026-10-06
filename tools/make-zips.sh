#!/bin/bash
#
# MAKE ZIPS
# ---------
# Builds one clean, standalone zip per module into the dist/ folder.
#
# Run it with:   bash build/make-zips.sh
#
# What it does for each folder in modules/:
#   1. Copies the module into a temporary folder.
#   2. Puts a copy of shared/ (theme, fonts, images, helpers) inside it, so the module works on its own.
#   3. Points index.html at that inner shared/ folder instead of ../../shared/.
#   4. Leaves out anything from this computer that should not ship (Mac and Windows hidden files,
#      backups the app makes while testing).
#   5. Checks the data files are valid and nothing still points outside the module.
#   6. Zips it as dist/<module-name>.zip, replacing any older zip of the same name.
#
# It stops with a clear message if any check fails.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
STAGE="$(mktemp -d "${TMPDIR:-/tmp}/toolkit-build.XXXXXX")"
trap 'rm -rf "$STAGE"' EXIT

# Files that must never end up in a customer's zip
EXCLUDES=(--exclude '.DS_Store' --exclude '._*' --exclude 'Thumbs.db' --exclude 'desktop.ini'
          --exclude '.git' --exclude '.claude' --exclude '*.backup.json' --exclude '*.tmp' --exclude '*.crswap')

fail() { echo "BUILD FAILED: $1" >&2; exit 1; }

mkdir -p "$DIST"
built=0

for MODULE_DIR in "$ROOT"/modules/*/; do
  NAME="$(basename "$MODULE_DIR")"
  OUT="$STAGE/$NAME"
  echo "Building $NAME"

  # 1 and 2: copy the module, then the shared folder inside it
  mkdir -p "$OUT"
  rsync -a "${EXCLUDES[@]}" "$MODULE_DIR" "$OUT/"
  rsync -a "${EXCLUDES[@]}" "$ROOT/shared/" "$OUT/shared/"

  # 3: point the page at its own shared folder
  for PAGE in "$OUT"/*.html; do
    perl -pi -e 's#\.\./\.\./shared/#shared/#g' "$PAGE"
  done

  # 5: checks
  [ -f "$OUT/index.html" ]  || fail "$NAME has no index.html"
  [ -f "$OUT/INSTALL.md" ]  || fail "$NAME has no INSTALL.md"
  [ -f "$OUT/CLAUDE.md" ]   || fail "$NAME has no CLAUDE.md"
  [ -f "$OUT/README.txt" ]  || fail "$NAME has no README.txt"
  if grep -rIl '\.\./\.\./' "$OUT" --include='*.html' --include='*.css' --include='*.js' >/dev/null; then
    fail "$NAME still has a link pointing outside the module"
  fi
  for JSON in "$OUT"/data/*.json; do
    [ -e "$JSON" ] || continue
    python3 -c 'import json,sys; json.load(open(sys.argv[1]))' "$JSON" || fail "$JSON is not valid JSON"
  done

  # 6: zip it (COPYFILE_DISABLE stops macOS adding hidden ._ files)
  rm -f "$DIST/$NAME.zip"
  (cd "$STAGE" && COPYFILE_DISABLE=1 zip -rqX "$DIST/$NAME.zip" "$NAME")
  echo "  -> dist/$NAME.zip ($(du -h "$DIST/$NAME.zip" | cut -f1 | tr -d ' '))"
  built=$((built + 1))
done

[ "$built" -gt 0 ] || fail "no modules found in modules/"
echo "Done. $built zip(s) in dist/"
