#!/bin/bash
#
# MAKE RELEASE
# ------------
# Builds dist/task-list-os.zip: a clean copy of the kit for customers to download.
#
# Run it from the task-list-os folder with:   bash maintainers/make-release.sh
# After changing the kit's own colours or fonts on purpose: bash maintainers/make-release.sh --record-look
#
# What it does:
#   1. Checks the files that ship are still blank templates, so nobody's real tasks,
#      business notes, setup progress, documents, own skills, logo, fonts or colours
#      can go out by mistake. Stops if not.
#      That includes anything in setup/as-installed/ except its README (a customer's saved download).
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

# ---------- 0. --record-look: after changing the kit's own look on purpose ----------
if [ "${1:-}" = "--record-look" ]; then
  if grep -q '/\* Brand:' "$ROOT/apps/shared/theme.css"; then fail "theme.css has someone's brand in it (a /* Brand: */ line), so it isn't the kit's own look"; fi
  {
    echo "# The kit's own look: theme.css and every font that ships. make-release.sh refuses anything different."
    echo "# Re-record only after changing the kit's look on purpose: bash maintainers/make-release.sh --record-look"
    (cd "$ROOT" && for f in apps/shared/theme.css apps/shared/fonts/*; do [ "$(basename "$f")" = ".DS_Store" ] || shasum -a 256 "$f"; done)
  } > "$ROOT/maintainers/shipped-look.txt"
  echo "Recorded the kit's look in maintainers/shipped-look.txt"
  exit 0
fi

# ---------- 1. Is everything that ships still a blank template? ----------
python3 - "$ROOT" <<'PYEOF' || fail "the files above contain real data or someone's own documents, skills or look. Restore the kit's files with: git checkout -- apps/task-list/data apps/shared/theme.css apps/shared/fonts context setup/progress.md CLAUDE.md, and move anything else listed out of this folder"
import json, sys, pathlib, re
root = pathlib.Path(sys.argv[1])
problems = []
data = json.loads((root / "apps/task-list/data/tasks.json").read_text())
if data.get("tasks"):
    problems.append("apps/task-list/data/tasks.json has tasks in it (a fresh install starts empty)")
# No demo mode and no sample business ships (the demo lives in ~/Claude/08_Artifacts/Task-List-OS-Demo)
if (root / "apps/task-list/app/demo-data.js").exists():
    problems.append("apps/task-list/app/demo-data.js is back: the demo lives outside the kit")
for f in list((root / "apps").rglob("*.js")) + list((root / "apps").rglob("*.html")):
    txt = f.read_text(errors="ignore")
    if re.search(r"makeDemoData|setDemo|demo-mode|data-action=\"demo|Demo mode", txt):
        problems.append(f"{f.relative_to(root)} still has demo mode in it")
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
if [f.name for f in (root / "skills-to-upload").iterdir() if f.name not in ("README.md", ".DS_Store")]:
    problems.append("skills-to-upload/ has someone's own skills in it")
if "(Claude fills this in during setup)" not in (root / "skills-to-upload/README.md").read_text():
    problems.append("skills-to-upload/README.md lists someone's own skills")
# A person's documents never ship: files/ holds only the README in each numbered folder
for f in sorted((root / "files").rglob("*")):
    if f.is_file() and f.name not in ("README.md", ".gitkeep", ".DS_Store"):
        problems.append(f"{f.relative_to(root)} is someone's own document and must not ship")
# Every skill that ships is one of the kit's own: listed in .claude/skills/README.md (setup step 6 writes a business's own skills here too)
skills_readme = (root / ".claude/skills/README.md").read_text()
for d in sorted((root / ".claude/skills").iterdir()):
    if d.is_dir() and not d.name.startswith(".") and f"`{d.name}`" not in skills_readme:
        problems.append(f".claude/skills/{d.name} is not one of the kit's skills (not in .claude/skills/README.md): is it someone's own?")
# A customer's saved downloads never ship: setup/as-installed/ holds only its README
for f in sorted((root / "setup/as-installed").rglob("*")):
    if f.is_file() and f.name not in ("README.md", ".DS_Store"):
        problems.append(f"{f.relative_to(root)} is a customer's saved download and must not ship")
# A business's own look never ships: match-my-brand marks theme.css, saves brand-logo.* and adds fonts
if "/* Brand:" in (root / "apps/shared/theme.css").read_text():
    problems.append("apps/shared/theme.css has someone's brand in it (a /* Brand: */ line)")
for f in sorted((root / "apps/shared/images").glob("brand-logo*")):
    problems.append(f"{f.relative_to(root)} is someone's logo")
for f in list((root / "apps").rglob("index.html")):
    txt = f.read_text(errors="ignore")
    if "brand-logo" in txt or "sidebar__brand--" in txt:
        problems.append(f"{f.relative_to(root)} shows someone's logo in the sidebar")
# theme.css and every font must match the kit's own look, recorded in maintainers/shipped-look.txt
import hashlib
look = root / "maintainers/shipped-look.txt"
if not look.exists():
    problems.append("maintainers/shipped-look.txt is missing: run bash maintainers/make-release.sh --record-look on a clean copy of the kit")
else:
    shipped = dict(line.split("  ", 1)[::-1] for line in look.read_text().splitlines() if line and not line.startswith("#"))
    current = {str(f.relative_to(root)): hashlib.sha256(f.read_bytes()).hexdigest()
               for f in [root / "apps/shared/theme.css", *sorted((root / "apps/shared/fonts").iterdir())]
               if f.is_file() and f.name != ".DS_Store"}
    for path in sorted(set(shipped) | set(current)):
        if path not in current:
            problems.append(f"{path} is missing (the kit ships it)")
        elif path not in shipped:
            problems.append(f"{path} is not one of the kit's fonts: is it someone's own?")
        elif shipped[path] != current[path]:
            problems.append(f"{path} is different from the kit's own: has it been changed to someone's brand?")
if "Setup status: not started" not in (root / "setup/progress.md").read_text():
    problems.append("setup/progress.md is not blank")
if "Setup: not done yet" not in (root / "CLAUDE.md").read_text():
    problems.append("CLAUDE.md says setup is done")
# A person's own photos and videos never ship: apps/<tool>/data/media may hold nothing but a .gitkeep
for f in sorted((root / "apps").glob("*/data/media/**/*")):
    if f.is_file() and f.name != ".gitkeep":
        problems.append(f"{f.relative_to(root)} is a person's own photo or video and must not ship")
# The shared version in toolkit.json must be the one in apps/shared/VERSION
shared_version = (root / "apps/shared/VERSION").read_text().split()[0]
if str(json.loads((root / "toolkit.json").read_text()).get("sharedVersion")) != shared_version:
    problems.append(f"toolkit.json sharedVersion is {json.loads((root / 'toolkit.json').read_text()).get('sharedVersion')!r} but apps/shared/VERSION says {shared_version}: change them together")
# Shared parts are identical in every tool, so they must not name one. No file may use the old start-up names,
# and no message in the scripts, the helper or the shared page code may say "Task List OS" (they read the tool's name from toolkit.json)
skip_dirs = {".git", "dist", "maintainers", "node_modules"}
for f in sorted(root.rglob("*")):
    if not f.is_file() or skip_dirs & set(f.relative_to(root).parts) or f.suffix in (".png", ".jpg", ".woff2", ".zip", ".gz", ".ico"):
        continue
    txt = f.read_text(errors="ignore")
    rel = str(f.relative_to(root))
    if "archive/refs/heads" in txt or "raw.githubusercontent.com" in txt:
        problems.append(f"{rel} uses an old public download address: since shared version 12 every download uses the person's GitHub sign-in (gh)")
    for old in ("open-task-list", "start-task-list"):
        if old in txt:
            problems.append(f"{rel} uses the old name {old} (it is now open-the-app / start-app, the same in every tool)")
    if re.match(r"setup/scripts/|apps/server/|apps/shared/js/", rel) and re.search(r"Task List OS|(?<!window\.)TaskListOS", txt):
        problems.append(f"{rel} names a tool (Task List OS): shared parts read the name from toolkit.json")
for p in problems:
    print("  - " + p, file=sys.stderr)
sys.exit(1 if problems else 0)
PYEOF

# ---------- 2. Copy, leaving out what customers don't need ----------
mkdir -p "$OUT" "$DIST"
rsync -a \
  --include 'setup/as-installed/README.md' --exclude 'setup/as-installed/*' \
  --exclude '.git' --exclude '.gitignore' --exclude 'dist' --exclude 'maintainers' \
  --exclude '.claude/launch.json' --exclude '.claude/settings.local.json' --exclude '.claude/.cc-writes' \
  --exclude '*.backup.json' --exclude 'apps/home/data' --exclude '.DS_Store' --exclude '._*' --exclude 'Thumbs.db' --exclude 'desktop.ini' \
  "$ROOT/" "$OUT/"
# Claude Code can leave empty .claude folders around the kit while it works; only the top one ships
find "$OUT" -mindepth 2 -type d -name .claude -empty -prune -exec rm -rf {} +

# ---------- 3. Checks ----------
for f in "START-HERE.md" "CLAUDE.md" "Open Task List.html" "apps/task-list/index.html" "apps/task-list/data/tasks.json" "setup/progress.md" ".claude/skills/README.md" ".claude/settings.json" "setup/scripts/save-key.sh" "setup/scripts/start-app.sh" "apps/server/server.js" "apps/server/server.py" "setup/connections/README.md" "toolkit.json" "ATTACHING.md" "apps/installed.json" "apps/shared/catalogue.json" "apps/shared/VERSION" "apps/shared/sidebar.css" "apps/shared/js/sidebar.js" "apps/shared/js/theme.js" "apps/shared/js/braindump.js" ".claude/skills/sort-brain-dump/SKILL.md" "apps/shared/images/claude-icon.png" "apps/task-list/menu.json" "apps/task-list/app/view-tasks.js" "apps/task-list/app/view-preferences.js" ".claude/skills/spot-claude-tasks/SKILL.md" "apps/home/index.html" "apps/home/home.js" "apps/home/home.css" "apps/task-list/home-boxes.js" "apps/shared/fonts/Figtree-Variable.woff2" "apps/task-list/ATTACH-CLAUDE.md" "setup/06-build-your-skills.md" "setup/09-check-and-hand-over.md" "skills-to-upload/README.md" "setup/as-installed/README.md" ".claude/skills/get-updates/SKILL.md"; do
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
