# patch_sheet_height.py (v2 — устойчивый к обоим состояниям HTML)
import io, os

HTML = "index.html"
with io.open(HTML, "r", encoding="utf-8") as f:
    h = f.read()

# 1) Высота панели
if "h-[75vh]" not in h:
    old = '''<div id="trainer-programs-sheet-panel" class="absolute left-0 right-0 bottom-0 max-w-md mx-auto
 bg-surface rounded-t-3xl translate-y-full transition-transform duration-300
 max-h-[85vh] flex flex-col border-t border-white/8"'''
    new = '''<div id="trainer-programs-sheet-panel" class="absolute left-0 right-0 bottom-0 max-w-md mx-auto
 bg-surface rounded-t-3xl translate-y-full transition-transform duration-300
 h-[75vh] max-h-[85vh] flex flex-col border-t border-white/8"'''
    assert old in h, "panel class not found"
    h = h.replace(old, new, 1)
    print("HTML: h-[75vh] added")
else:
    print("HTML: h-[75vh] already present")

# 2) Cache-bust: v10 или v11 -> v11
if "app-v10.js" in h:
    h = h.replace("app-v10.js?v=' + v + '&x=6", "app-v11.js?v=' + v + '&x=7", 1)
    print("HTML: v10 -> v11")
elif "app-v11.js" in h:
    print("HTML: already points to v11")
else:
    raise SystemExit("HTML: neither v10 nor v11 marker found")

with io.open(HTML, "w", encoding="utf-8") as f:
    f.write(h)
print("HTML OK, lines:", len(h.splitlines()))


# 3) JS: empty state для sheet'а (только если ещё нет)
JS = "app-v11.js"
if not os.path.exists(JS) and os.path.exists("app-v10.js"):
    os.replace("app-v10.js", JS)
    print("JS: renamed v10 -> v11")

with io.open(JS, "r", encoding="utf-8") as f:
    js = f.read()

if "h-full flex flex-col items-center justify-center text-center px-4" in js:
    print("JS: empty state already present")
else:
    old_empty = ''' if (!programs || programs.length === 0) {
 listEl.innerHTML = `
 <div class="text-center py-8">
 <p class="text-white/90 text-sm font-medium mb-1">Пока нет программ</p>
 <p class="text-muted2 text-xs">Создай программу — и сможешь назначать её клиентам</p>
 </div>`;
 return;
 }'''
    new_empty = ''' if (!programs || programs.length === 0) {
 listEl.innerHTML = `
 <div class="h-full flex flex-col items-center justify-center text-center px-4">
 <div class="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-surface2 mb-4 text-muted/40 empty-icon-ring">
 <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
 <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
 <rect x="9" y="3" width="6" height="4" rx="1"/>
 <path d="M9 12h6M9 16h4"/>
 </svg>
 </div>
 <p class="text-white/90 text-sm font-medium mb-1">Пока нет программ</p>
 <p class="text-muted2 text-xs max-w-[240px]">Создай программу ниже — и сможешь назначать её клиентам</p>
 </div>`;
 return;
 }'''
    assert old_empty in js, "empty state marker not found in JS"
    js = js.replace(old_empty, new_empty, 1)
    print("JS: empty state applied")

with io.open(JS, "w", encoding="utf-8") as f:
    f.write(js)
print("JS OK, lines:", len(js.splitlines()))