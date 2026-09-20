# fix_all.py — восстановление frontend после порчи PowerShell
import io, re, subprocess, sys, os

def run(cmd, check=True):
    return subprocess.run(cmd, capture_output=True, text=True, check=check)

def get_blob(rev, path):
    try:
        r = subprocess.run(["git", "show", f"{rev}:{path}"], capture_output=True, check=True)
        return r.stdout.decode("utf-8", errors="replace")
    except subprocess.CalledProcessError:
        return None

print("=" * 50)
print("STEP 1: Recent commits")
print("=" * 50)
log = run(["git", "log", "--oneline", "-10"])
print(log.stdout)
commits = [line.split()[0] for line in log.stdout.strip().split("\n") if line.strip()]

print("=" * 50)
print("STEP 2: Find a clean index.html (has 'Главная')")
print("=" * 50)
good_rev = None
for rev in commits:
    content = get_blob(rev, "index.html")
    if content and "Главная" in content:
        good_rev = rev
        print(f"  OK {rev}: 'Главная' present")
        break
    else:
        print(f"  -- {rev}: no 'Главная' or unreadable")

if not good_rev:
    print("ERROR: no clean index.html found. Aborting.")
    sys.exit(1)

print("=" * 50)
print(f"STEP 3: Restore index.html from {good_rev}, no BOM")
print("=" * 50)
content = get_blob(good_rev, "index.html")
if content.startswith("\ufeff"):
    content = content[1:]
    print("  Stripped UTF-8 BOM")

new_content = re.sub(r'app-v\d+\.js\?v=', 'app.js?v=', content)
new_content = re.sub(r"(app\.js\?v=' \+ v \+ ')&x=\d+", r"\1", new_content)

if new_content == content:
    print("  WARN: script ref unchanged")
else:
    print("  Script ref updated to app.js")

with io.open("index.html", "w", encoding="utf-8") as f:
    f.write(new_content)
print("  Written without BOM")

with io.open("index.html", "r", encoding="utf-8") as f:
    verify = f.read()
print(f"  'Главная' present: {'Главная' in verify}")
print(f"  'app.js' ref present: {'app.js' in verify}")
m = re.search(r"document\.write\('[^']*app[^']*'\);", verify)
if m:
    print(f"  ref line: {m.group(0)[:100]}")

print("=" * 50)
print("STEP 4: Ensure app.js exists locally")
print("=" * 50)
if not os.path.exists("app.js"):
    print("  app.js missing, restoring from git")
    subprocess.run(["git", "checkout", "--", "app.js"], check=False)
    if not os.path.exists("app.js"):
        print("  trying app-v11.js")
        subprocess.run(["git", "checkout", "--", "app-v11.js"], check=False)
        if os.path.exists("app-v11.js"):
            os.rename("app-v11.js", "app.js")
            print("  renamed app-v11.js -> app.js")
else:
    print("  app.js exists, size:", os.path.getsize("app.js"))

if not os.path.exists("app.js"):
    print("ERROR: cannot restore app.js")
    sys.exit(1)

with io.open("app.js", "r", encoding="utf-8") as f:
    js = f.read()
print(f"  app.js has 'openTrainerProgramEditor': {'openTrainerProgramEditor' in js}")
print(f"  app.js has 'openTrainerProgramsSheet': {'openTrainerProgramsSheet' in js}")

print("=" * 50)
print("STEP 5: git add + status")
print("=" * 50)
subprocess.run(["git", "add", "-f", "app.js", "index.html"], check=True)

ls = run(["git", "ls-files"])
tracked = ls.stdout.split("\n")
if "app-v11.js" in tracked:
    print("  Removing app-v11.js from git")
    subprocess.run(["git", "rm", "-f", "--ignore-unmatch", "app-v11.js"], check=False)

status = run(["git", "status", "--short"])
print(status.stdout)
print("=" * 50)
print("DONE. Now run:")
print("  git commit -m 'fix: restore index.html, use app.js'")
print("  git push origin master")
print("=" * 50)