# patch_trainer_prog_editor.py
import io

JS = "app-v10.js"
with io.open(JS, "r", encoding="utf-8") as f:
    js = f.read()

# --- 1. DOM-ссылка ---
m1 = "const screenClientDetail = document.getElementById('screen-client-detail');"
assert m1 in js, "m1 not found"
js = js.replace(m1, m1 + "\nconst screenTrainerProgEditor = document.getElementById('screen-program-trainer-editor');", 1)

# --- 2. toggle в showScreen ---
m2 = " if (screenClientDetail) screenClientDetail.classList.toggle('hidden-screen', name !== 'client-detail');"
assert m2 in js, "m2 not found"
js = js.replace(m2, m2 + "\n if (screenTrainerProgEditor) screenTrainerProgEditor.classList.toggle('hidden-screen', name !== 'program-trainer-editor');", 1)

# --- 3. renderExercisesPicker: поддержка mode 'trainer-prog' ---
old_used = " const usedIds = sheetMode === 'program' ? inProgramIds : inWorkoutIds;\n const available = list.filter(ex => !usedIds.has(ex.id));"
assert old_used in js, "usedIds block not found"
new_used = """ let usedIds;
 if (sheetMode === 'program') usedIds = inProgramIds;
 else if (sheetMode === 'trainer-prog') {
 const _day = trainerProgState.days[trainerProgState.activeIdx];
 usedIds = new Set(((_day && _day.exercises) || []).map(e => e.exercise_id));
 } else usedIds = inWorkoutIds;
 const available = list.filter(ex => !usedIds.has(ex.id));"""
js = js.replace(old_used, new_used, 1)

# --- 4. exercise-pick click: поддержка trainer-prog ---
old_pick = """ if (sheetMode === 'program') {
 addExerciseToProgram(parseInt(btn.dataset.id), btn.dataset.name);
 } else {
 addExerciseToWorkout(parseInt(btn.dataset.id), btn.dataset.name);
 }
 closeSheet();"""
assert old_pick in js, "pick handler not found"
new_pick = """ if (sheetMode === 'program') {
 addExerciseToProgram(parseInt(btn.dataset.id), btn.dataset.name);
 } else if (sheetMode === 'trainer-prog') {
 addExerciseToTrainerDay(parseInt(btn.dataset.id), btn.dataset.name);
 } else {
 addExerciseToWorkout(parseInt(btn.dataset.id), btn.dataset.name);
 }
 closeSheet();"""
js = js.replace(old_pick, new_pick, 1)

# --- 5. "Edit" кнопка в каждом item sheet'а + рендер кнопки "Создать новую" ---
old_render_item = """ return `
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
 });"""
assert old_render_item in js, "render item block not found"
new_render_item = """ return `
 <div class="flex items-center gap-2 mb-2">
 <button class="assign-prog-item flex-1 bg-surface2 hover:bg-surface active:scale-[0.98] transition rounded-2xl p-4 text-left"
 data-program-id="${p.id}">
 <div class="flex items-center justify-between gap-2">
 <div class="min-w-0">
 <p class="font-semibold truncate">${p.name}</p>
 <p class="text-xs text-muted mt-0.5">${meta}</p>
 </div>
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b8b9e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
 </div>
 </button>
 <button class="assign-prog-edit bg-surface2 hover:bg-surface p-3 rounded-2xl active:scale-95 transition shrink-0"
 data-program-id="${p.id}" title="Редактировать">
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b8b9e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
 <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
 <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
 </svg>
 </button>
 </div>`;
 }).join('');

 listEl.querySelectorAll('.assign-prog-item').forEach(btn => {
 btn.addEventListener('click', () => assignProgramToClient(parseInt(btn.dataset.programId)));
 });
 listEl.querySelectorAll('.assign-prog-edit').forEach(btn => {
 btn.addEventListener('click', (e) => {
 e.stopPropagation();
 openTrainerProgramEditor(parseInt(btn.dataset.programId), null);
 });
 });"""
js = js.replace(old_render_item, new_render_item, 1)

# --- 6. Большой блок: состояние + функции редактора + обработчики ---
m6 = "// ============ ТРЕНЕР: ВЫБОР ПРОГРАММЫ ДЛЯ КЛИЕНТА ============"
assert m6 in js, "trainer sheet section marker not found"

NEW_EDITOR = r'''// ============ ТРЕНЕР: РЕДАКТОР ПРОГРАММЫ (НЕДЕЛЯ) ============
let trainerProgState = {
 id: null,
 name: '',
 days: [{ day_index: 0, exercises: [] }],
 activeIdx: 0,
 returnClientId: null,
 isNewDraft: false,
};

async function openTrainerProgramEditor(programId, returnClientId) {
 closeTrainerProgramsSheet();
 trainerProgState = {
 id: null,
 name: '',
 days: [{ day_index: 0, exercises: [] }],
 activeIdx: 0,
 returnClientId: returnClientId || null,
 isNewDraft: false,
 };
 try {
 if (programId == null) {
 // Создаём пустую программу
 const res = await fetch(`${API_URL}/api/trainer/programs`, {
 method: 'POST',
 headers: { ...authHeaders(), 'Content-Type': 'application/json' },
 body: JSON.stringify({ name: 'Новая программа' }),
 });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 const data = await res.json();
 trainerProgState.id = data.id;
 trainerProgState.name = data.name || 'Новая программа';
 trainerProgState.isNewDraft = true;
 } else {
 const res = await fetch(`${API_URL}/api/trainer/programs/${programId}`, { headers: authHeaders() });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 const data = await res.json();
 trainerProgState.id = data.id;
 trainerProgState.name = data.name || '';
 trainerProgState.days = (data.days && data.days.length > 0)
 ? data.days.map(d => ({
 day_index: d.day_index,
 exercises: (d.exercises || []).map(e => ({
 exercise_id: e.exercise_id,
 name: e.name,
 target_sets: e.target_sets,
 target_reps: e.target_reps,
 })),
 }))
 : [{ day_index: 0, exercises: [] }];
 trainerProgState.activeIdx = 0;
 }
 showScreen('program-trainer-editor');
 renderTrainerProgEditor();
 } catch (e) {
 console.error('openTrainerProgramEditor', e);
 tg?.showAlert && tg.showAlert('Не удалось открыть программу');
 }
}

async function closeTrainerProgEditor(saveDraftDelete = true) {
 // Если это был черновик (создали только что) и пользователь не сохранил — удалим пустышку
 if (saveDraftDelete && trainerProgState.isNewDraft && trainerProgState.id) {
 try {
 await fetch(`${API_URL}/api/trainer/programs/${trainerProgState.id}`, {
 method: 'DELETE', headers: authHeaders(),
 });
 } catch (_) {}
 }
 const backClientId = trainerProgState.returnClientId;
 trainerProgState = { id: null, name: '', days: [{ day_index: 0, exercises: [] }], activeIdx: 0, returnClientId: null, isNewDraft: false };
 if (backClientId) {
 await openClientDetail(backClientId);
 } else {
 showScreen('trainer-clients');
 loadTrainerClients();
 }
}

function renderTrainerProgEditor() {
 const nameInput = document.getElementById('tprog-name-input');
 if (nameInput) nameInput.value = trainerProgState.name || '';
 renderTrainerProgTabs();
 renderTrainerProgDay();
}

function renderTrainerProgTabs() {
 const tabsEl = document.getElementById('tprog-days-tabs');
 if (!tabsEl) return;
 let html = '';
 trainerProgState.days.forEach((d, i) => {
 const active = i === trainerProgState.activeIdx;
 const cls = active
 ? 'bg-primary text-white border-primary'
 : 'bg-surface2 text-muted border-white/5';
 html += `<button class="tprog-tab px-3 py-2 rounded-2xl text-xs font-medium border transition ${cls}" data-idx="${i}">День ${i + 1}</button>`;
 });
 // Кнопка добавить день
 html += `<button id="tprog-add-day" class="px-3 py-2 rounded-2xl text-xs font-medium border transition bg-primary/10 text-primary2 border-primary/20">+ День</button>`;
 tabsEl.innerHTML = html;

 tabsEl.querySelectorAll('.tprog-tab').forEach(btn => {
 btn.addEventListener('click', () => {
 trainerProgState.activeIdx = parseInt(btn.dataset.idx);
 tg?.HapticFeedback?.selectionChanged?.();
 renderTrainerProgEditor();
 });
 });
 document.getElementById('tprog-add-day')?.addEventListener('click', addTrainerProgDay);
}

function renderTrainerProgDay() {
 const listEl = document.getElementById('tprog-exercises-list');
 const emptyEl = document.getElementById('tprog-empty');
 const removeDayBtn = document.getElementById('tprog-remove-day');
 if (!listEl) return;

 const day = trainerProgState.days[trainerProgState.activeIdx];
 const exs = (day && day.exercises) || [];

 if (removeDayBtn) {
 removeDayBtn.classList.toggle('hidden', trainerProgState.days.length <= 1);
 }

 if (exs.length === 0) {
 listEl.innerHTML = '';
 if (emptyEl) emptyEl.classList.remove('hidden');
 return;
 }
 if (emptyEl) emptyEl.classList.add('hidden');

 listEl.innerHTML = exs.map((ex, i) => `
 <div class="bg-surface2 rounded-2xl p-3 flex items-center gap-2">
 <div class="flex-1 min-w-0">
 <p class="text-sm font-medium truncate">${ex.name}</p>
 </div>
 <input type="text" inputmode="numeric" value="${ex.target_sets ?? ''}" placeholder="—"
 class="tprog-sets w-12 text-center bg-bg rounded-xl py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/40"
 data-idx="${i}">
 <span class="text-muted2 text-xs">×</span>
 <input type="text" inputmode="numeric" value="${ex.target_reps ?? ''}" placeholder="—"
 class="tprog-reps w-12 text-center bg-bg rounded-xl py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/40"
 data-idx="${i}">
 <button class="tprog-remove text-muted2 hover:text-red-400 p-1.5 shrink-0" data-idx="${i}" title="Удалить">
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
 </button>
 </div>
 `).join('');

 listEl.querySelectorAll('.tprog-remove').forEach(btn => {
 btn.addEventListener('click', () => {
 const idx = parseInt(btn.dataset.idx);
 trainerProgState.days[trainerProgState.activeIdx].exercises.splice(idx, 1);
 tg?.HapticFeedback?.impactOccurred('light');
 renderTrainerProgDay();
 });
 });

 // Обновляем таргеты в state при изменении инпутов
 listEl.querySelectorAll('.tprog-sets').forEach(inp => {
 inp.addEventListener('input', () => {
 const idx = parseInt(inp.dataset.idx);
 const v = inp.value.trim();
 trainerProgState.days[trainerProgState.activeIdx].exercises[idx].target_sets = v ? parseInt(v) : null;
 });
 });
 listEl.querySelectorAll('.tprog-reps').forEach(inp => {
 inp.addEventListener('input', () => {
 const idx = parseInt(inp.dataset.idx);
 const v = inp.value.trim();
 trainerProgState.days[trainerProgState.activeIdx].exercises[idx].target_reps = v ? parseInt(v) : null;
 });
 });
}

function addExerciseToTrainerDay(exerciseId, name) {
 const day = trainerProgState.days[trainerProgState.activeIdx];
 if (!day) return;
 if (day.exercises.some(e => e.exercise_id === exerciseId)) return;
 day.exercises.push({ exercise_id: exerciseId, name, target_sets: null, target_reps: null });
 tg?.HapticFeedback?.impactOccurred('light');
 renderTrainerProgDay();
}

function addTrainerProgDay() {
 const nextIdx = trainerProgState.days.length;
 trainerProgState.days.push({ day_index: nextIdx, exercises: [] });
 trainerProgState.activeIdx = nextIdx;
 tg?.HapticFeedback?.impactOccurred('light');
 renderTrainerProgEditor();
}

function removeCurrentTrainerProgDay() {
 if (trainerProgState.days.length <= 1) return;
 trainerProgState.days.splice(trainerProgState.activeIdx, 1);
 // Переиндексируем
 trainerProgState.days.forEach((d, i) => { d.day_index = i; });
 trainerProgState.activeIdx = Math.max(0, trainerProgState.activeIdx - 1);
 tg?.HapticFeedback?.impactOccurred('medium');
 renderTrainerProgEditor();
}

async function saveTrainerProg() {
 const nameInput = document.getElementById('tprog-name-input');
 const name = (nameInput?.value || '').trim();
 if (!name) { tg?.showAlert && tg.showAlert('Введи название программы'); return; }
 if (name.length > 128) { tg?.showAlert && tg.showAlert('Название слишком длинное'); return; }

 const saveBtn = document.getElementById('tprog-save');
 if (saveBtn) saveBtn.style.opacity = '0.6';

 const payload = {
 name,
 days: trainerProgState.days.map(d => ({
 day_index: d.day_index,
 exercises: d.exercises.map(e => ({
 exercise_id: e.exercise_id,
 target_sets: e.target_sets,
 target_reps: e.target_reps,
 })),
 })),
 };

 try {
 const res = await fetch(`${API_URL}/api/trainer/programs/${trainerProgState.id}`, {
 method: 'PUT',
 headers: { ...authHeaders(), 'Content-Type': 'application/json' },
 body: JSON.stringify(payload),
 });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);

 trainerProgState.name = name;
 trainerProgState.isNewDraft = false;
 tg?.HapticFeedback?.notificationOccurred('success');

 // Если пришли из карточки клиента — сразу назначим
 const returnClientId = trainerProgState.returnClientId;
 if (returnClientId && trainerProgState.id) {
 try {
 await fetch(`${API_URL}/api/trainer/clients/${returnClientId}/assign_program`, {
 method: 'POST',
 headers: { ...authHeaders(), 'Content-Type': 'application/json' },
 body: JSON.stringify({ program_id: trainerProgState.id }),
 });
 } catch (_) {}
 }

 // Сбросим черновик (уже сохранён)
 trainerProgState.isNewDraft = false;
 trainerProgState.returnClientId = returnClientId;

 // Выйти с обновлением
 trainerProgState.isNewDraft = false;
 const savedName = name;
 if (returnClientId) {
 trainerProgState.returnClientId = null;
 trainerProgState.isNewDraft = false;
 await openClientDetail(returnClientId);
 } else {
 trainerProgState.isNewDraft = false;
 showScreen('trainer-clients');
 loadTrainerClients();
 }
 } catch (e) {
 console.error('saveTrainerProg', e);
 tg?.showAlert && tg.showAlert('Не удалось сохранить программу');
 } finally {
 if (saveBtn) saveBtn.style.opacity = '1';
 }
}

async function deleteTrainerProg() {
 const ok = await new Promise(resolve => {
 if (tg?.showConfirm) tg.showConfirm('Удалить программу?', (yes) => resolve(yes));
 else resolve(confirm('Удалить программу?'));
 });
 if (!ok) return;
 if (!trainerProgState.id) { closeTrainerProgEditor(true); return; }
 try {
 const res = await fetch(`${API_URL}/api/trainer/programs/${trainerProgState.id}`, {
 method: 'DELETE', headers: authHeaders(),
 });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 tg?.HapticFeedback?.notificationOccurred('success');
 trainerProgState.isNewDraft = false; // уже удалено
 closeTrainerProgEditor(false);
 } catch (e) {
 console.error('deleteTrainerProg', e);
 tg?.showAlert && tg.showAlert('Не удалось удалить программу');
 }
}

'''

js = js.replace(m6, NEW_EDITOR + m6, 1)

# --- 7. Обработчики кнопок редактора — рядом с client-detail-back ---
m7 = "document.getElementById('client-detail-back')?.addEventListener('click', () => {"
assert m7 in js, "m7 not found"

NEW_HANDLERS = r'''document.getElementById('tprog-back')?.addEventListener('click', () => { tg?.HapticFeedback?.impactOccurred('light'); closeTrainerProgEditor(true); });
document.getElementById('tprog-save')?.addEventListener('click', saveTrainerProg);
document.getElementById('tprog-delete')?.addEventListener('click', deleteTrainerProg);
document.getElementById('tprog-add-exercise')?.addEventListener('click', () => { tg?.HapticFeedback?.impactOccurred('light'); openSheet('trainer-prog'); });
document.getElementById('tprog-remove-day')?.addEventListener('click', removeCurrentTrainerProgDay);
document.getElementById('tprog-create-new-from-sheet')?.addEventListener('click', () => { tg?.HapticFeedback?.impactOccurred('light'); openTrainerProgramEditor(null, assignTargetClientId); });

'''
js = js.replace(m7, NEW_HANDLERS + m7, 1)

with io.open(JS, "w", encoding="utf-8") as f:
    f.write(js)
print("JS OK, lines:", len(js.splitlines()))


# ===================== index.html =====================
HTML = "index.html"
with io.open(HTML, "r", encoding="utf-8") as f:
    h = f.read()

# 1) Кнопка "Создать новую" в sheet выбора программы клиента
anchor1 = ''' <div id="trainer-programs-list" class="flex-1 overflow-y-auto px-5 pb-6" style="-webkit-overflow-scrolling: touch;">
 <p class="text-muted text-center py-6 text-sm">Загрузка...</p>
 </div>'''
assert anchor1 in h, "trainer-programs-list anchor not found"
new_anchor1 = ''' <div id="trainer-programs-list" class="flex-1 overflow-y-auto px-5 pb-3" style="-webkit-overflow-scrolling: touch;">
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
 </div>'''
h = h.replace(anchor1, new_anchor1, 1)

# 2) Новый экран редактора — вставляем ПЕРЕД sheet'ом trainer-programs-sheet
anchor2 = " <!-- BOTTOM SHEET: ВЫБОР ПРОГРАММЫ ДЛЯ КЛИЕНТА (тренер) -->"
assert anchor2 in h, "sheet comment not found"

screen_editor = ''' <!-- ЭКРАН: РЕДАКТОР ПРОГРАММЫ ТРЕНЕРА (НЕДЕЛЯ) -->
 <div id="screen-program-trainer-editor" class="hidden-screen">
 <header class="flex items-center gap-3 mb-5 h-9">
 <button id="tprog-back" class="text-muted p-2 -ml-2 active:opacity-60">
 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
 </button>
 <h1 class="text-xl font-bold tracking-tight flex-1">Программа</h1>
 <button id="tprog-delete" class="text-muted hover:text-red-400 transition p-2 -mr-2 active:opacity-60" title="Удалить">
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
 <path d="M3 6h18"/>
 <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
 <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
 <path d="M10 11v6M14 11v6"/>
 </svg>
 </button>
 </header>

 <div class="mb-5">
 <label class="text-[10px] uppercase tracking-wider text-muted2 block mb-1.5">Название</label>
 <input id="tprog-name-input" type="text" maxlength="128" placeholder="Например: Неделя A"
 class="w-full bg-surface2 rounded-2xl px-4 py-3.5 text-white placeholder-muted2
 focus:outline-none focus:ring-2 focus:ring-primary/40 transition">
 </div>

 <div class="flex items-center gap-2 mb-3 flex-wrap">
 <div id="tprog-days-tabs" class="flex gap-2 flex-wrap flex-1"></div>
 <button id="tprog-remove-day" class="hidden text-xs text-red-300/80 hover:text-red-400 transition px-3 py-2 rounded-2xl bg-red-500/10 border border-red-500/20">
 Удалить день
 </button>
 </div>

 <div id="tprog-exercises-list" class="space-y-2 mb-4"></div>

 <div id="tprog-empty" class="hidden text-center py-8">
 <div class="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-surface mb-3 text-muted/40 empty-icon-ring">
 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
 <path d="M6.5 6.5v11"/>
 <path d="M17.5 6.5v11"/>
 <path d="M3 9v6"/>
 <path d="M21 9v6"/>
 <path d="M6.5 12h11"/>
 </svg>
 </div>
 <p class="text-muted text-xs">Пока пусто. Добавь упражнение в этот день</p>
 </div>

 <button id="tprog-add-exercise" class="w-full mt-4 bg-surface hover:bg-surface2 active:scale-[0.98]
 transition rounded-3xl py-4 font-medium text-base
 flex items-center justify-center gap-2.5
 text-white/90">
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
 Добавить упражнение
 </button>

 <button id="tprog-save" class="w-full mt-3 bg-primary hover:bg-primary/90 active:scale-[0.98]
 transition rounded-3xl py-4 font-semibold text-base text-white
 shadow-[0_10px_30px_-10px_rgba(124,108,255,0.55)]">
 Сохранить
 </button>
 </div>

'''
h = h.replace(anchor2, screen_editor + anchor2, 1)

# 3) cache-bust v9 -> v10
old = r"""document.write('<script src="app-v9.js?v=' + v + '&x=5"><\/script>');"""
new = r"""document.write('<script src="app-v10.js?v=' + v + '&x=6"><\/script>');"""
assert old in h, "html script marker not found"
h = h.replace(old, new, 1)

with io.open(HTML, "w", encoding="utf-8") as f:
    f.write(h)
print("HTML OK, lines:", len(h.splitlines()))