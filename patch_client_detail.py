# patch_client_detail.py
# Фаза 2: экран карточки клиента (тренер).
import io

# ===================== app-v7.js =====================
JS = "app-v7.js"
with io.open(JS, "r", encoding="utf-8") as f:
    js = f.read()

# --- 1. Ссылка на screenClientDetail ---
m1 = "const screenTrainerClients = document.getElementById('screen-trainer-clients');"
assert m1 in js, "m1 not found"
js = js.replace(m1, m1 + "\nconst screenClientDetail = document.getElementById('screen-client-detail');", 1)

# --- 2. toggle в showScreen ---
m2 = " if (screenTrainerClients) screenTrainerClients.classList.toggle('hidden-screen', name !== 'trainer-clients');"
assert m2 in js, "m2 not found"
js = js.replace(m2, m2 + "\n if (screenClientDetail) screenClientDetail.classList.toggle('hidden-screen', name !== 'client-detail');", 1)

# --- 3. nav активный для client-detail ---
m3 = " const navName = name === 'trainer-clients' ? 'trainer' : name;"
assert m3 in js, "m3 not found"
js = js.replace(m3, " const navName = (name === 'trainer-clients' || name === 'client-detail') ? 'trainer' : name;", 1)

# --- 4. Карточка клиента кликабельна ---
m4 = ''' <div class="bg-surface rounded-3xl p-4 card-shadow">
 <div class="flex items-start justify-between gap-3 mb-1.5">
 <p class="font-semibold break-words min-w-0 flex-1">${name}</p>'''
assert m4 in js, "m4 not found"
js = js.replace(m4, ''' <div class="bg-surface rounded-3xl p-4 card-shadow cursor-pointer active:scale-[0.98] transition" data-client-id="${c.id}">
 <div class="flex items-start justify-between gap-3 mb-1.5">
 <p class="font-semibold break-words min-w-0 flex-1">${name}</p>''', 1)

# --- 5. Делегирование кликов после innerHTML ---
m5 = ''' }).join('');
}

async function showAddClientLink() {'''
assert m5 in js, "m5 not found"
js = js.replace(m5, ''' }).join('');

 listEl.querySelectorAll('[data-client-id]').forEach(el => {
 el.addEventListener('click', () => {
 tg?.HapticFeedback?.impactOccurred('light');
 openClientDetail(parseInt(el.dataset.clientId));
 });
 });
}

async function showAddClientLink() {''', 1)

# --- 6. Функции openClientDetail / renderClientDetail + back button ---
m6 = "async function showAddClientLink() {"
assert m6 in js, "m6 not found"

NEW_FUNCS = r'''let currentClientId = null;

async function openClientDetail(clientId) {
 currentClientId = clientId;
 showScreen('client-detail');
 const content = document.getElementById('client-detail-content');
 const titleEl = document.getElementById('client-detail-title');
 if (titleEl) titleEl.textContent = 'Клиент';
 if (content) content.innerHTML = '<p class="text-muted text-center py-8">Загрузка...</p>';
 try {
 const res = await fetch(`${API_URL}/api/trainer/clients/${clientId}`, { headers: authHeaders() });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 const data = await res.json();
 renderClientDetail(data);
 } catch (e) {
 console.error('openClientDetail', e);
 if (content) content.innerHTML = '<p class="text-red-400 text-center py-8">Ошибка загрузки</p>';
 }
}

function fmtVolume(kg) {
 if (kg == null) return '—';
 if (kg < 1000) return Math.round(kg) + ' кг';
 return (kg / 1000).toFixed(1) + ' т';
}

function fmtDate(iso) {
 const d = parseServerDate(iso);
 if (!d || isNaN(d.getTime())) return '';
 return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function fmtDateTime(iso) {
 const d = parseServerDate(iso);
 if (!d || isNaN(d.getTime())) return '';
 return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function renderClientDetail(d) {
 const content = document.getElementById('client-detail-content');
 const titleEl = document.getElementById('client-detail-title');
 if (!content) return;
 if (!d || !d.client) { content.innerHTML = '<p class="text-muted text-center py-8">Нет данных</p>'; return; }

 const c = d.client;
 const s = d.stats || {};
 const name = c.first_name || (c.username ? '@' + c.username : 'Клиент');
 if (titleEl) titleEl.textContent = name;

 let html = '';

 // Сводка
 html += `
 <div class="bg-surface rounded-3xl p-5 card-shadow">
 <p class="text-[10px] uppercase tracking-wider text-muted2 mb-2">Сводка</p>
 <div class="grid grid-cols-2 gap-3 mb-3">
 <div>
 <p class="text-xs text-muted">Тренировок</p>
 <p class="text-2xl font-bold mt-0.5">${s.workouts_count ?? 0}</p>
 </div>
 <div>
 <p class="text-xs text-muted">Подходов</p>
 <p class="text-2xl font-bold mt-0.5">${s.sets_count ?? 0}</p>
 </div>
 </div>
 <div class="flex items-center justify-between text-sm">
 <span class="text-muted">Общий тоннаж</span>
 <span class="font-semibold">${fmtVolume(s.total_volume_kg)}</span>
 </div>
 <div class="flex items-center justify-between text-sm mt-1.5">
 <span class="text-muted">Стрик</span>
 <span class="font-semibold">${s.streak ?? 0} дн.</span>
 </div>
 ${c.last_active_at ? `<p class="text-[11px] text-muted2 mt-3">Активность: ${fmtDateTime(c.last_active_at)}</p>` : ''}
 </div>
 `;

 // Кнопки
 html += `
 <div class="grid grid-cols-2 gap-3">
 <button id="client-detail-write" class="bg-primary/12 hover:bg-primary/18 text-primary2 rounded-3xl py-3.5 text-sm font-medium active:scale-[0.98] transition border border-primary/20">
 Написать
 </button>
 <button id="client-detail-give" class="bg-surface hover:bg-surface2 rounded-3xl py-3.5 text-sm font-medium active:scale-[0.98] transition border border-white/5">
 Дать программу
 </button>
 </div>
 `;

 // Тоннаж по группам мышц
 if (d.muscle_groups && d.muscle_groups.length > 0) {
 const maxV = Math.max.apply(null, d.muscle_groups.map(g => g.volume_kg || 0)) || 1;
 html += `
 <div class="bg-surface rounded-3xl p-5 card-shadow">
 <p class="text-[10px] uppercase tracking-wider text-muted2 mb-3">Тоннаж по группам</p>
 <div class="space-y-3">
 ${d.muscle_groups.map(g => {
 const pct = Math.max(4, Math.round(((g.volume_kg || 0) / maxV) * 100));
 return `
 <div>
 <div class="flex items-center justify-between text-xs mb-1">
 <span class="font-medium">${g.group || '—'}</span>
 <span class="text-muted">${fmtVolume(g.volume_kg)} · ${g.sets} подх.</span>
 </div>
 <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
 <div class="h-full rounded-full" style="width: ${pct}%; background: linear-gradient(90deg, #7c6cff 0%, #a78bfa 100%);"></div>
 </div>
 </div>`;
 }).join('')}
 </div>
 </div>
 `;
 }

 // Программа
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
 }

 // Последние тренировки
 if (d.recent_workouts && d.recent_workouts.length > 0) {
 html += `
 <div class="bg-surface rounded-3xl p-5 card-shadow">
 <p class="text-[10px] uppercase tracking-wider text-muted2 mb-3">Последние тренировки</p>
 <div class="space-y-2">
 ${d.recent_workouts.map(w => {
 const dt = w.finished_at || w.started_at;
 return `
 <div class="flex items-center justify-between gap-2 py-2 border-b border-white/5 last:border-0">
 <div class="min-w-0">
 <p class="text-sm font-medium">${fmtDate(dt)}</p>
 <p class="text-[11px] text-muted mt-0.5">${fmtDateTime(dt)}</p>
 </div>
 <span class="text-xs text-muted bg-surface2 rounded-full px-2.5 py-1 shrink-0">${w.total_sets || 0} подх.</span>
 </div>`;
 }).join('')}
 </div>
 </div>`;
 }

 // Питание
 if (d.nutrition) {
 const n = d.nutrition;
 html += `
 <div class="bg-surface rounded-3xl p-5 card-shadow">
 <p class="text-[10px] uppercase tracking-wider text-muted2 mb-1">Питание (последний день)</p>
 <p class="text-xs text-muted mb-3">${n.date || ''}</p>
 <p class="text-2xl font-bold mb-3">${Math.round(n.calories || 0)} <span class="text-sm text-muted font-normal">ккал</span></p>
 <div class="grid grid-cols-3 gap-2">
 <div class="bg-surface2 rounded-2xl py-2 text-center">
 <p class="text-[9px] uppercase text-muted2">Б</p>
 <p class="text-sm font-semibold mt-0.5 text-sky-300/80">${Math.round(n.protein || 0)}г</p>
 </div>
 <div class="bg-surface2 rounded-2xl py-2 text-center">
 <p class="text-[9px] uppercase text-muted2">Ж</p>
 <p class="text-sm font-semibold mt-0.5 text-amber-300/80">${Math.round(n.fat || 0)}г</p>
 </div>
 <div class="bg-surface2 rounded-2xl py-2 text-center">
 <p class="text-[9px] uppercase text-muted2">У</p>
 <p class="text-sm font-semibold mt-0.5 text-emerald-300/80">${Math.round(n.carbs || 0)}г</p>
 </div>
 </div>
 </div>`;
 }

 // Вес
 if (d.weight) {
 const w = d.weight;
 let deltaStr = '';
 let deltaCls = 'text-muted';
 if (w.delta_kg != null && w.delta_kg !== 0) {
 deltaStr = (w.delta_kg > 0 ? '+' : '') + Number(w.delta_kg).toFixed(1) + ' кг';
 deltaCls = w.delta_kg > 0 ? 'text-orange-400' : 'text-green-400';
 }
 html += `
 <div class="bg-surface rounded-3xl p-5 card-shadow">
 <p class="text-[10px] uppercase tracking-wider text-muted2 mb-2">Вес</p>
 <div class="flex items-baseline gap-2">
 <p class="text-2xl font-bold">${w.current_kg} кг</p>
 ${deltaStr ? `<span class="text-xs font-medium ${deltaCls}">${deltaStr}</span>` : ''}
 </div>
 ${w.recorded_at ? `<p class="text-[11px] text-muted2 mt-2">Записан: ${fmtDate(w.recorded_at)}</p>` : ''}
 </div>`;
 }

 // Рекорды
 if (d.records && d.records.length > 0) {
 html += `
 <div class="bg-surface rounded-3xl p-5 card-shadow">
 <p class="text-[10px] uppercase tracking-wider text-muted2 mb-3">Топ-5 рекордов (1RM)</p>
 <div class="space-y-2">
 ${d.records.map(r => `
 <div class="flex items-center justify-between gap-2 py-2 border-b border-white/5 last:border-0">
 <div class="min-w-0">
 <p class="text-sm font-medium truncate">${r.exercise_name}</p>
 <p class="text-[11px] text-muted mt-0.5">${r.weight} кг × ${r.reps}</p>
 </div>
 <span class="text-xs bg-primary/15 text-primary2 rounded-full px-2.5 py-1 font-medium shrink-0">≈ ${r.estimated_1rm} кг</span>
 </div>`).join('')}
 </div>
 </div>`;
 }

 if (s.workouts_count === 0 && !d.program && !d.nutrition && !d.weight && (!d.records || d.records.length === 0)) {
 html += `<div class="text-center py-8"><p class="text-muted text-sm">Клиент пока ничего не записал</p></div>`;
 }

 content.innerHTML = html;

 // Кнопки
 document.getElementById('client-detail-write')?.addEventListener('click', () => {
 tg?.HapticFeedback?.impactOccurred('light');
 const url = c.username ? ('https://t.me/' + c.username) : ('tg://user?id=' + c.id);
 if (tg && tg.openTelegramLink) tg.openTelegramLink(url);
 else window.open(url, '_blank');
 });

 document.getElementById('client-detail-give')?.addEventListener('click', () => {
 tg?.HapticFeedback?.impactOccurred('light');
 if (typeof window.shareProgramWithClient === 'function') {
 window.shareProgramWithClient(c.id, c.username);
 } else {
 tg?.showAlert && tg.showAlert('Шаринг программ появится в след. обновлении');
 }
 });
}

'''

js = js.replace(m6, NEW_FUNCS + m6, 1)

# --- 7. Back-обработчик ---
m7 = "document.getElementById('add-client-btn')?.addEventListener('click', () => {"
assert m7 in js, "m7 not found"
js = js.replace(m7, '''document.getElementById('client-detail-back')?.addEventListener('click', () => {
 tg?.HapticFeedback?.impactOccurred('light');
 showScreen('trainer-clients');
 loadTrainerClients();
});

''' + m7, 1)

with io.open(JS, "w", encoding="utf-8") as f:
    f.write(js)
print("JS OK, lines:", len(js.splitlines()))

# ===================== index.html =====================
HTML = "index.html"
with io.open(HTML, "r", encoding="utf-8") as f:
    h = f.read()

# --- 1. Добавить #screen-client-detail после #screen-trainer-clients ---
marker = "Клиенты, которых ты пригласил"
i = h.find(marker)
assert i != -1, "html marker not found"
close = h.find("</div>", i)
assert close != -1, "html close not found"
insert_at = close + len("</div>")

screen_html = '''

 <!-- ЭКРАН: КАРТОЧКА КЛИЕНТА (тренер) -->
 <div id="screen-client-detail" class="hidden-screen">
 <header class="flex items-center gap-3 mb-6 h-9">
 <button id="client-detail-back" class="text-muted p-2 -ml-2 active:opacity-60">
 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
 </button>
 <h1 id="client-detail-title" class="text-xl font-bold tracking-tight flex-1 truncate">Клиент</h1>
 </header>
 <div id="client-detail-content" class="space-y-3">
 <p class="text-muted text-center py-8">Загрузка...</p>
 </div>
 </div>'''

h = h[:insert_at] + screen_html + h[insert_at:]

# --- 2. Cache-bust: app-v6.js -> app-v7.js ---
old = r"""document.write('<script src="app-v6.js?v=' + v + '&x=2"><\/script>');"""
new = r"""document.write('<script src="app-v7.js?v=' + v + '&x=3"><\/script>');"""
assert old in h, "script marker not found"
h = h.replace(old, new, 1)

with io.open(HTML, "w", encoding="utf-8") as f:
    f.write(h)
print("HTML OK, lines:", len(h.splitlines()))