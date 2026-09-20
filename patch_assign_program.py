# patch_assign_program.py
import io

JS = "app-v9.js"
with io.open(JS, "r", encoding="utf-8") as f:
    js = f.read()

# --- 1. Заменяем заглушку кнопки "Дать программу" на открытие sheet ---
old_give = """ document.getElementById('client-detail-give')?.addEventListener('click', () => {
 tg?.HapticFeedback?.impactOccurred('light');
 if (typeof window.shareProgramWithClient === 'function') {
 window.shareProgramWithClient(c.id, c.username);
 } else {
 tg?.showAlert && tg.showAlert('Шаринг программ появится в след. обновлении');
 }
 });"""
assert old_give in js, "give button handler not found"
js = js.replace(old_give, """ document.getElementById('client-detail-give')?.addEventListener('click', () => {
 tg?.HapticFeedback?.impactOccurred('light');
 openTrainerProgramsSheet(c.id);
 });""", 1)

# --- 2. Кнопка "Сменить" в блоке программы (если назначена) ---
old_prog = """ // Программа
 if (d.program) {
 html += `
 <div class="bg-surface rounded-3xl p-4 card-shadow">
 <p class="text-[10px] uppercase tracking-wider text-muted2 mb-1">Программа</p>
 <p class="font-semibold">${d.program.name}</p>
 <p class="text-xs text-muted mt-0.5">${d.program.exercises_count} упражнений</p>
 </div>`;
 } else {
 html += `
 <div class="bg-surface rounded-3xl p-4 card-shadow">
 <p class="text-[10px] uppercase tracking-wider text-muted2 mb-1">Программа</p>
 <p class="text-sm text-muted">Пока не задана</p>
 </div>`;
 }"""
assert old_prog in js, "program block not found"

new_prog = """ // Программа
 if (d.program) {
 const _isAssigned = !!d.program.is_assigned;
 const _days = d.program.days_count || 0;
 const _exs = d.program.exercises_count || 0;
 const _label = _isAssigned ? 'Программа (от тебя)' : 'Программа (своя)';
 const _meta = _days > 1 ? `${_days} дн. · ${_exs} упражнений` : `${_exs} упражнений`;
 html += `
 <div class="bg-surface rounded-3xl p-4 card-shadow">
 <div class="flex items-start justify-between gap-2">
 <div class="min-w-0">
 <p class="text-[10px] uppercase tracking-wider text-muted2 mb-1">${_label}</p>
 <p class="font-semibold break-words">${d.program.name}</p>
 <p class="text-xs text-muted mt-0.5">${_meta}</p>
 </div>
 <button id="client-detail-change-prog" class="text-xs text-primary2 bg-primary/10 hover:bg-primary/15 active:scale-95 transition rounded-2xl px-3 py-2 shrink-0 border border-primary/20">
 ${_isAssigned ? 'Сменить' : 'Назначить'}
 </button>
 </div>
 </div>`;
 } else {
 html += `
 <div class="bg-surface rounded-3xl p-4 card-shadow">
 <div class="flex items-start justify-between gap-2">
 <div>
 <p class="text-[10px] uppercase tracking-wider text-muted2 mb-1">Программа</p>
 <p class="text-sm text-muted">Пока не задана</p>
 </div>
 <button id="client-detail-change-prog" class="text-xs text-primary2 bg-primary/10 hover:bg-primary/15 active:scale-95 transition rounded-2xl px-3 py-2 shrink-0 border border-primary/20">
 Дать программу
 </button>
 </div>
 </div>`;
 }"""
js = js.replace(old_prog, new_prog, 1)

# --- 3. Обработчик кнопки "Сменить"/"Назначить" рядом с остальными в renderClientDetail ---
old_write = """ document.getElementById('client-detail-write')?.addEventListener('click', () => {"""
assert old_write in js, "write handler marker not found"
js = js.replace(old_write, """ document.getElementById('client-detail-change-prog')?.addEventListener('click', () => {
 tg?.HapticFeedback?.impactOccurred('light');
 openTrainerProgramsSheet(c.id);
 });

 document.getElementById('client-detail-write')?.addEventListener('click', () => {""", 1)

# --- 4. Функции sheet'а программ тренера ---
marker = "async function showAddClientLink() {"
assert marker in js, "showAddClientLink marker not found"

NEW_SHEET = r'''// ============ ТРЕНЕР: ВЫБОР ПРОГРАММЫ ДЛЯ КЛИЕНТА ============
let assignTargetClientId = null;

function openTrainerProgramsSheet(clientId) {
 assignTargetClientId = clientId;
 const backdrop = document.getElementById('trainer-programs-sheet-backdrop');
 const panel = document.getElementById('trainer-programs-sheet-panel');
 const listEl = document.getElementById('trainer-programs-list');
 if (!backdrop || !panel || !listEl) return;
 listEl.innerHTML = '<p class="text-muted text-center py-6 text-sm">Загрузка...</p>';
 backdrop.classList.remove('hidden');
 requestAnimationFrame(() => {
 backdrop.classList.remove('opacity-0');
 panel.classList.remove('translate-y-full');
 });
 tg?.HapticFeedback?.impactOccurred('light');
 loadTrainerProgramsForAssign();
}

function closeTrainerProgramsSheet() {
 const backdrop = document.getElementById('trainer-programs-sheet-backdrop');
 const panel = document.getElementById('trainer-programs-sheet-panel');
 if (!backdrop || !panel) return;
 backdrop.classList.add('opacity-0');
 panel.classList.add('translate-y-full');
 setTimeout(() => backdrop.classList.add('hidden'), 250);
 tg?.HapticFeedback?.impactOccurred('light');
}

async function loadTrainerProgramsForAssign() {
 const listEl = document.getElementById('trainer-programs-list');
 if (!listEl) return;
 try {
 const res = await fetch(`${API_URL}/api/trainer/programs`, { headers: authHeaders() });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 const data = await res.json();
 renderTrainerProgramsForAssign(data.programs || []);
 } catch (e) {
 console.error('loadTrainerProgramsForAssign', e);
 listEl.innerHTML = '<p class="text-red-400 text-center py-6 text-sm">Ошибка загрузки</p>';
 }
}

function renderTrainerProgramsForAssign(programs) {
 const listEl = document.getElementById('trainer-programs-list');
 if (!listEl) return;
 if (!programs || programs.length === 0) {
 listEl.innerHTML = `
 <div class="text-center py-8">
 <p class="text-white/90 text-sm font-medium mb-1">Пока нет программ</p>
 <p class="text-muted2 text-xs">Создай программу — и сможешь назначать её клиентам</p>
 </div>`;
 return;
 }
 listEl.innerHTML = programs.map(p => {
 const meta = (p.days_count > 1)
 ? `${p.days_count} дн. · ${p.exercises_count} упражнений`
 : `${p.exercises_count} упражнений`;
 return `
 <button class="assign-prog-item w-full bg-surface2 hover:bg-surface active:scale-[0.98] transition rounded-2xl p-4 text-left mb-2"
 data-program-id="${p.id}">
 <div class="flex items-center justify-between gap-2">
 <div class="min-w-0">
 <p class="font-semibold truncate">${p.name}</p>
 <p class="text-xs text-muted mt-0.5">${meta}</p>
 </div>
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b8b9e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
 </div>
 </button>`;
 }).join('');

 listEl.querySelectorAll('.assign-prog-item').forEach(btn => {
 btn.addEventListener('click', () => assignProgramToClient(parseInt(btn.dataset.programId)));
 });
}

async function assignProgramToClient(programId) {
 if (!assignTargetClientId) return;
 const listEl = document.getElementById('trainer-programs-list');
 if (listEl) listEl.style.opacity = '0.5';
 try {
 const res = await fetch(`${API_URL}/api/trainer/clients/${assignTargetClientId}/assign_program`, {
 method: 'POST',
 headers: { ...authHeaders(), 'Content-Type': 'application/json' },
 body: JSON.stringify({ program_id: programId }),
 });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 tg?.HapticFeedback?.notificationOccurred('success');
 closeTrainerProgramsSheet();
 // Перерисовать карточку клиента
 await openClientDetail(assignTargetClientId);
 } catch (e) {
 console.error('assignProgramToClient', e);
 tg?.showAlert && tg.showAlert('Не удалось назначить программу');
 } finally {
 if (listEl) listEl.style.opacity = '1';
 }
}

'''

js = js.replace(marker, NEW_SHEET + marker, 1)

# --- 5. Обработчики close/backdrop ---
marker2 = "document.getElementById('client-detail-back')?.addEventListener('click', () => {"
assert marker2 in js, "client-detail-back marker not found"
js = js.replace(marker2, """document.getElementById('trainer-programs-sheet-close')?.addEventListener('click', closeTrainerProgramsSheet);
document.getElementById('trainer-programs-sheet-backdrop')?.addEventListener('click', (e) => {
 if (e.target === document.getElementById('trainer-programs-sheet-backdrop')) closeTrainerProgramsSheet();
});

""" + marker2, 1)

with io.open(JS, "w", encoding="utf-8") as f:
    f.write(js)
print("JS OK, lines:", len(js.splitlines()))

# ===================== index.html =====================
HTML = "index.html"
with io.open(HTML, "r", encoding="utf-8") as f:
    h = f.read()

# 1) Добавить sheet ПОСЛЕ закрытия #screen-client-detail (перед </div></div> у wrap)
anchor = ''' <div id="client-detail-content" class="space-y-3">
 <p class="text-muted text-center py-8">Загрузка...</p>
 </div>
 </div>'''
assert anchor in h, "client-detail-content anchor not found"
sheet_html = anchor + '''

 <!-- BOTTOM SHEET: ВЫБОР ПРОГРАММЫ ДЛЯ КЛИЕНТА (тренер) -->
 <div id="trainer-programs-sheet-backdrop" class="hidden fixed inset-0 z-[70] opacity-0 transition-opacity duration-250" style="background: rgba(0,0,0,.6); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);">
 <div id="trainer-programs-sheet-panel" class="absolute left-0 right-0 bottom-0 max-w-md mx-auto
 bg-surface rounded-t-3xl translate-y-full transition-transform duration-300
 max-h-[85vh] flex flex-col border-t border-white/8" style="box-shadow: 0 -20px 60px rgba(0,0,0,.5);">
 <div class="sheet-handle"></div>

 <div class="px-5 pt-4 pb-3 flex items-center justify-between">
 <h2 class="text-base font-semibold">Дать программу</h2>
 <button id="trainer-programs-sheet-close" class="text-muted p-1 -mr-1 active:opacity-60">
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
 <path d="M18 6L6 18M6 6l12 12"/>
 </svg>
 </button>
 </div>

 <div id="trainer-programs-list" class="flex-1 overflow-y-auto px-5 pb-6" style="-webkit-overflow-scrolling: touch;">
 <p class="text-muted text-center py-6 text-sm">Загрузка...</p>
 </div>
 </div>
 </div>'''
h = h.replace(anchor, sheet_html, 1)

# 2) cache-bust: app-v8.js -> app-v9.js
old = r"""document.write('<script src="app-v8.js?v=' + v + '&x=4"><\/script>');"""
new = r"""document.write('<script src="app-v9.js?v=' + v + '&x=5"><\/script>');"""
assert old in h, "html script marker not found"
h = h.replace(old, new, 1)

with io.open(HTML, "w", encoding="utf-8") as f:
    f.write(h)
print("HTML OK, lines:", len(h.splitlines()))