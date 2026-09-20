# patch_progs_fullscreen.py
import io

HTML = "index.html"
with io.open(HTML, "r", encoding="utf-8") as f:
    h = f.read()

# --- 1. Полностью меняем разметку sheet'а на полноэкранный экран ---
old_block = ''' <!-- BOTTOM SHEET: ВЫБОР ПРОГРАММЫ ДЛЯ КЛИЕНТА (тренер) -->
 <div id="trainer-programs-sheet-backdrop" class="hidden fixed inset-0 z-[70] opacity-0 transition-opacity duration-250" style="background: rgba(0,0,0,.6); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);">
 <div id="trainer-programs-sheet-panel" class="absolute left-0 right-0 bottom-0 max-w-md mx-auto
 bg-surface rounded-t-3xl translate-y-full transition-transform duration-300
 h-[75vh] max-h-[85vh] flex flex-col border-t border-white/8" style="box-shadow: 0 -20px 60px rgba(0,0,0,.5);">
 <div class="sheet-handle"></div>

 <div class="px-5 pt-4 pb-3 flex items-center justify-between">
 <h2 class="text-base font-semibold">Дать программу</h2>
 <button id="trainer-programs-sheet-close" class="text-muted p-1 -mr-1 active:opacity-60">
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
 <path d="M18 6L6 18M6 6l12 12"/>
 </svg>
 </button>
 </div>

 <div id="trainer-programs-list" class="flex-1 overflow-y-auto px-5 pb-3" style="-webkit-overflow-scrolling: touch;">
 <p class="text-muted text-center py-6 text-sm">Загрузка...</p>
 </div>

 <div class="px-5 pb-5 pt-3 border-t border-white/5">
 <button id="tprog-create-new-from-sheet" class="w-full bg-primary/10 hover:bg-primary/15 active:scale-[0.98]
 transition rounded-3xl py-3.5 font-medium text-sm text-primary2
 border border-primary/20
 flex items-center justify-center gap-2.5">
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
 Создать новую программу
 </button>
 </div>
 </div>
 </div>'''

new_block = ''' <!-- FULLSCREEN: ВЫБОР ПРОГРАММЫ ДЛЯ КЛИЕНТА (тренер) -->
 <div id="trainer-programs-sheet-backdrop" class="hidden fixed inset-0 z-[70] opacity-0 transition-opacity duration-250" style="background: #0a0a0f;">
 <div id="trainer-programs-sheet-panel" class="absolute inset-0 max-w-md mx-auto bg-bg translate-y-full transition-transform duration-300 flex flex-col">

 <div class="px-5 pb-3 flex items-center gap-3" style="padding-top: calc(env(safe-area-inset-top, 0) + var(--safe-top-offset, 56px));">
 <button id="trainer-programs-sheet-close" class="text-muted p-2 -ml-2 active:opacity-60">
 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
 </button>
 <h2 class="text-[22px] font-bold tracking-tight">Дать программу</h2>
 </div>

 <div id="trainer-programs-list" class="flex-1 overflow-y-auto px-5 pb-3" style="-webkit-overflow-scrolling: touch;">
 <p class="text-muted text-center py-6 text-sm">Загрузка...</p>
 </div>

 <div class="px-5 pb-5 pt-3 border-t border-white/5" style="padding-bottom: calc(env(safe-area-inset-bottom, 0) + 20px);">
 <button id="tprog-create-new-from-sheet" class="w-full bg-primary/10 hover:bg-primary/15 active:scale-[0.98]
 transition rounded-3xl py-3.5 font-medium text-sm text-primary2
 border border-primary/20
 flex items-center justify-center gap-2.5">
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
 Создать новую программу
 </button>
 </div>
 </div>
 </div>'''

assert old_block in h, "trainer-programs block not found"
h = h.replace(old_block, new_block, 1)

# --- 2. Cache-bust v11 -> v12 ---
old_js = r"""document.write('<script src="app-v11.js?v=' + v + '&x=7"><\/script>');"""
new_js = r"""document.write('<script src="app-v12.js?v=' + v + '&x=8"><\/script>');"""
assert old_js in h, "script marker not found"
h = h.replace(old_js, new_js, 1)

with io.open(HTML, "w", encoding="utf-8") as f:
    f.write(h)
print("HTML OK, lines:", len(h.splitlines()))