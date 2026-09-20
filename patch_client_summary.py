# patch_client_summary.py
import io

JS = "app-v8.js"
with io.open(JS, "r", encoding="utf-8") as f:
    js = f.read()

start = " // Сводка\n"
end = "\n // Кнопки\n"
i = js.find(start)
assert i != -1, "start marker ('// Сводка') not found"
j = js.find(end, i)
assert j != -1, "end marker ('// Кнопки') not found"

new_block = ''' // Сводка (блоки)
 const _activeLine = c.last_active_at ? ('Активность: ' + fmtDateTime(c.last_active_at)) : '';
 html += `
 <div class="bg-surface rounded-3xl p-4 card-shadow">
 <p class="text-[10px] uppercase tracking-wider text-muted2 mb-3 px-1">Сводка</p>
 <div class="grid grid-cols-2 gap-2">
 <div class="bg-surface2 rounded-2xl p-3 text-center">
 <p class="text-[10px] uppercase tracking-wider text-muted2">Тренировок</p>
 <p class="text-2xl font-bold mt-1 tracking-tight">${s.workouts_count ?? 0}</p>
 </div>
 <div class="bg-surface2 rounded-2xl p-3 text-center">
 <p class="text-[10px] uppercase tracking-wider text-muted2">Подходов</p>
 <p class="text-2xl font-bold mt-1 tracking-tight">${s.sets_count ?? 0}</p>
 </div>
 <div class="bg-surface2 rounded-2xl p-3 text-center">
 <p class="text-[10px] uppercase tracking-wider text-muted2">Тоннаж</p>
 <p class="text-2xl font-bold mt-1 tracking-tight">${fmtVolume(s.total_volume_kg)}</p>
 </div>
 <div class="bg-surface2 rounded-2xl p-3 text-center">
 <p class="text-[10px] uppercase tracking-wider text-muted2">Стрик</p>
 <p class="text-2xl font-bold mt-1 tracking-tight">${s.streak ?? 0}<span class="text-xs font-normal text-muted ml-1">дн.</span></p>
 </div>
 </div>
 ${_activeLine ? `<p class="text-[10px] text-muted2 text-center mt-3">${_activeLine}</p>` : ''}
 </div>
 `;
'''

js = js[:i] + new_block + js[j:]
with io.open(JS, "w", encoding="utf-8") as f:
    f.write(js)
print("JS OK, lines:", len(js.splitlines()))

# index.html: app-v7.js -> app-v8.js
HTML = "index.html"
with io.open(HTML, "r", encoding="utf-8") as f:
    h = f.read()

old = r"""document.write('<script src="app-v7.js?v=' + v + '&x=3"><\/script>');"""
new = r"""document.write('<script src="app-v8.js?v=' + v + '&x=4"><\/script>');"""
assert old in h, "html script marker not found"
h = h.replace(old, new, 1)

with io.open(HTML, "w", encoding="utf-8") as f:
    f.write(h)
print("HTML OK, lines:", len(h.splitlines()))