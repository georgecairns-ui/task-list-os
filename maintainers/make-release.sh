#!/bin/bash
#
# MAKE RELEASE
# ------------
# Builds dist/task-list-os.zip: a clean copy of the kit for customers to download.
#
# Run it from the task-list-os folder with:   bash maintainers/make-release.sh
#
# What it does:
#   1. Checks the files that ship are still blank templates, so nobody's real tasks,
#      business notes or setup progress can go out by mistake. Stops if not.
#   2. Copies the kit into a temporary folder called "Task List OS", leaving out this
#      maintainers folder, git history, old builds, backups and computer clutter.
#   3. Checks the copy is complete and the data file is valid.
#   4. Zips it as dist/task-list-os.zip, replacing any older one.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
STAGE="$(mktemp -d "${TMPDIR:-/tmp}/task-list-os-build.XXXXXX")"
trap 'rm -rf "$STAGE"' EXIT
NAME="Task List OS"
OUT="$STAGE/$NAME"

fail() { echo "RELEASE STOPPED: $1" >&2; exit 1; }

# ---------- 1. Is everything that ships still a blank template? ----------
python3 - "$ROOT" <<'PYEOF' || fail "the files above contain real data. Restore them with: git checkout -- apps/task-list/data context setup/progress.md CLAUDE.md"
import json, sys, pathlib, re
root = pathlib.Path(sys.argv[1])
problems = []
data = json.loads((root / "apps/task-list/data/tasks.json").read_text())
if any(not t.get("example") for t in data.get("tasks", [])):
    problems.append("apps/task-list/data/tasks.json has tasks that are not the examples")
if data.get("plan", {}).get("date") or data.get("activity"):
    problems.append("apps/task-list/data/tasks.json has a plan or activity in it")
for key in ("events", "people", "dump", "replies", "meetings"):
    if data.get(key):
        problems.append("apps/task-list/data/tasks.json has " + key + " in it")
if (data.get("triage") or {}).get("lastRunAt"):
    problems.append("apps/task-list/data/tasks.json has a triage run in it")
if (data.get("week") or {}).get("goals"):
    problems.append("apps/task-list/data/tasks.json has weekly goals in it")
if any(data.get("settings", {}).get(k) for k in ("yourName", "businessName")):
    problems.append("apps/task-list/data/tasks.json has a name in its settings")
for f in sorted((root / "context").glob("*.md")):
    if f.name != "README.md" and "Status: not filled in yet" not in f.read_text():
        problems.append(f"{f.relative_to(root)} has been filled in")
if "Setup status: not started" not in (root / "setup/progress.md").read_text():
    problems.append("setup/progress.md is not blank")
if "Setup: not done yet" not in (root / "CLAUDE.md").read_text():
    problems.append("CLAUDE.md says setup is done")
for p in problems:
    print("  - " + p, file=sys.stderr)
sys.exit(1 if problems else 0)
PYEOF

# ---------- 2. Copy, leaving out what customers don't need ----------
mkdir -p "$OUT" "$DIST"
rsync -a \
  --exclude '.git' --exclude '.gitignore' --exclude 'dist' --exclude 'maintainers' \
  --exclude '.claude/launch.json' --exclude '.claude/settings.local.json' --exclude '.claude/.cc-writes' \
  --exclude '*.backup.json' --exclude 'apps/home/data' --exclude '.DS_Store' --exclude '._*' --exclude 'Thumbs.db' --exclude 'desktop.ini' \
  "$ROOT/" "$OUT/"
# Claude Code can leave empty .claude folders around the kit while it works; only the top one ships
find "$OUT" -mindepth 2 -type d -name .claude -empty -prune -exec rm -rf {} +

# ---------- 3. Checks ----------
for f in "START-HERE.md" "CLAUDE.md" "Open Task List.html" "apps/task-list/index.html" "apps/task-list/data/tasks.json" "setup/progress.md" ".claude/skills/README.md" ".claude/settings.json" "setup/scripts/save-key.sh" "setup/scripts/start-task-list.sh" "apps/server/server.js" "apps/server/server.py" "setup/connections/README.md" "toolkit.json" "ATTACHING.md" "apps/installed.json" "apps/shared/catalogue.json" "apps/shared/VERSION" "apps/shared/sidebar.css" "apps/shared/js/sidebar.js" "apps/shared/js/theme.js" "apps/task-list/menu.json" "apps/home/index.html" "apps/home/home.js" "apps/home/home.css" "apps/task-list/home-boxes.js" "apps/shared/fonts/Figtree-Variable.woff2" "apps/task-list/ATTACH-CLAUDE.md"; do
  [ -e "$OUT/$f" ] || fail "missing $f"
done
python3 -c 'import json,sys; json.load(open(sys.argv[1]))' "$OUT/apps/task-list/data/tasks.json" || fail "tasks.json is not valid"
for f in toolkit.json apps/installed.json apps/shared/catalogue.json; do
  python3 -c 'import json,sys; json.load(open(sys.argv[1]))' "$OUT/$f" || fail "$f is not valid"
done
# A fresh download lists only Task List OS, and no test tool ever ships
python3 -c 'import json,sys; t=json.load(open(sys.argv[1]))["tools"]; sys.exit(0 if [x["id"] for x in t]==["task-list"] else 1)' "$OUT/apps/installed.json" || fail "apps/installed.json must list only Task List OS"
[ ! -e "$OUT/apps/test-tool" ] || fail "the test tool is in the release"
if grep -rIl $'—' "$OUT" >/dev/null 2>&1; then fail "an em dash slipped in: $(grep -rIl $'—' "$OUT" | head -3)"; fi
SKILLS=$(find "$OUT/.claude/skills" -name SKILL.md | wc -l | tr -d ' ')

# ---------- 4. Zip (COPYFILE_DISABLE stops macOS adding hidden ._ files) ----------
rm -f "$DIST/task-list-os.zip"
(cd "$STAGE" && COPYFILE_DISABLE=1 zip -rqX "$DIST/task-list-os.zip" "$NAME")
echo "Built dist/task-list-os.zip ($(du -h "$DIST/task-list-os.zip" | cut -f1 | tr -d ' '), $SKILLS skills)"
