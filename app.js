// ============ TELEGRAM WEBAPP INIT ============
const tg = window.Telegram?.WebApp;
if (tg) {
 tg.ready();
 tg.expand();
 tg.setHeaderColor('#08080c');
 tg.setBackgroundColor('#08080c');

 if (typeof tg.disableVerticalSwipes === 'function') tg.disableVerticalSwipes();
 if (typeof tg.requestFullscreen === 'function') tg.requestFullscreen();

 // Top-offset: даже в fullscreen Telegram рисует close/expand (~50px).
 // Используем contentSafeAreaInset из SDK 7.0+ для точного расчёта.
 let topOffset = 56;
 try {
 const safeTop = (tg.contentSafeAreaInset && tg.contentSafeAreaInset.top) || 0;
 const sysTop = (tg.safeAreaInset && tg.safeAreaInset.top) || 0;
 if (safeTop > 0) {
 topOffset = Math.max(topOffset, safeTop + 8);
 } else if (sysTop > 0) {
 topOffset = Math.max(topOffset, sysTop + 8);
 }
 } catch (e) {}
 document.documentElement.style.setProperty('--safe-top-offset', topOffset + 'px');

 const isMobile = ['android', 'ios', 'android_x'].includes(tg.platform);
 if (isMobile) document.body.classList.add('mobile-body');
}

const API_URL = 'https://gymlyvlad.duckdns.org';

// ============ UTIL ============
function parseServerDate(iso) {
 if (!iso) return null;
 if (typeof iso !== 'string') return new Date(iso);
 if (!/[Zz]|[+-]\d{2}:?\d{2}$/.test(iso)) {
 return new Date(iso + 'Z');
 }
 return new Date(iso);
}

function parseWeightInput(str) {
 if (str == null) return NaN;
 let s = String(str).trim().replace(',', '.').replace(/[^\d.\-]/g, '');
 if (!s) return NaN;
 const n = parseFloat(s);
 return n;
}

// ============ УМНЫЙ BLUR ============
const MODAL_IDS = [
 'sheet-backdrop',
 'create-ex-backdrop',
 'programs-sheet-backdrop',
 'weight-sheet-backdrop',
 'reminder-sheet-backdrop',
 'profile-edit-backdrop',
];

document.addEventListener('pointerdown', (e) => {
 const active = document.activeElement;
 if (!active) return;
 const tag = active.tagName;
 if (tag !== 'INPUT' && tag !== 'TEXTAREA') return;
 if (e.target === active) return;
 if (MODAL_IDS.some(id => e.target.closest && e.target.closest('#' + id))) return;
 if (e.target.closest && e.target.closest('button, a, label, input, textarea, select, [role="button"]')) return;
 active.blur();
}, true);

// ============ DOM ============
const screenHome = document.getElementById('screen-home');
const screenWorkout = document.getElementById('screen-workout');
const screenHistory = document.getElementById('screen-history');
const screenWorkoutDetail = document.getElementById('screen-workout-detail');
const screenProfile = document.getElementById('screen-profile');
const screenRecords = document.getElementById('screen-records');
const screenCalendar = document.getElementById('screen-calendar');
const screenOnboarding = document.getElementById('screen-onboarding');
const screenProgramEditor = document.getElementById('screen-program-editor');
const screenAi = document.getElementById('screen-ai');

const userNameEl = document.getElementById('user-name');
const recentListEl = document.getElementById('recent-list');
const workoutExercisesEl = document.getElementById('workout-exercises');
const workoutHeaderEl = document.getElementById('workout-header');
const workoutDividerEl = document.getElementById('workout-divider');
const workoutEmptyEl = document.getElementById('workout-empty');
const finishWorkoutBtn = document.getElementById('finish-workout');
const workoutTimerEl = document.getElementById('workout-timer');
const addExerciseBtn = document.getElementById('add-exercise-btn');
const historyListEl = document.getElementById('history-list');
const detailContentEl = document.getElementById('detail-content');
const detailTitleEl = document.getElementById('detail-title');
const detailDeleteBtn = document.getElementById('detail-delete-btn');
const startWorkoutBtn = document.getElementById('start-workout');

const sheetBackdrop = document.getElementById('sheet-backdrop');
const sheetContent = document.getElementById('sheet-content');
const sheetCloseBtn = document.getElementById('sheet-close');
const exercisesPickerEl = document.getElementById('exercises-picker');
const searchInput = document.getElementById('exercise-search');
const sheetCreateBtn = document.getElementById('sheet-create-btn');

const createExBackdrop = document.getElementById('create-ex-backdrop');
const createExPanel = document.getElementById('create-ex-panel');
const createExClose = document.getElementById('create-ex-close');
const createExName = document.getElementById('create-ex-name');
const createExGroup = document.getElementById('create-ex-group');
const createExSave = document.getElementById('create-ex-save');

const progSheetBackdrop = document.getElementById('programs-sheet-backdrop');
const progSheetContent = document.getElementById('programs-sheet-content');
const progSheetClose = document.getElementById('programs-sheet-close');
const progListEl = document.getElementById('programs-list');
const progEmptyWorkoutBtn = document.getElementById('programs-empty-workout');
const progCreateBtn = document.getElementById('programs-create-btn');

const programEditorName = document.getElementById('program-name-input');
const programEditorList = document.getElementById('program-exercises-list');
const programEditorAddBtn = document.getElementById('program-add-exercise');
const programSaveBtn = document.getElementById('program-save-btn');
const programEditorBack = document.getElementById('program-editor-back');
const programEditorEmpty = document.getElementById('program-editor-empty');

const restTimerEl = document.getElementById('rest-timer');
const restProgressEl = document.getElementById('rest-progress');
const restTimeEl = document.getElementById('rest-time');
const restSkipBtn = document.getElementById('rest-skip');

const profileNameEl = document.getElementById('profile-name');
const profileUsernameEl = document.getElementById('profile-username');
const profileExpChipEl = document.getElementById('profile-experience-chip');
const statStreakEl = document.getElementById('stat-streak');
const statWorkoutsEl = document.getElementById('stat-workouts');
const statSetsEl = document.getElementById('stat-sets');
const statVolumeEl = document.getElementById('stat-volume');
const streakHintEl = document.getElementById('streak-hint');
const recordsListEl = document.getElementById('records-list');

const profileEditBtn = document.getElementById('profile-edit-btn');
const profileMetricsEl = document.getElementById('profile-metrics');
const profileEmptyHintEl = document.getElementById('profile-empty-hint');
const pmWeightEl = document.getElementById('pm-weight');
const pmHeightEl = document.getElementById('pm-height');
const pmAgeEl = document.getElementById('pm-age');
const pmBmiEl = document.getElementById('pm-bmi');
const pmBmiLabelEl = document.getElementById('pm-bmi-label');
const pmCaloriesEl = document.getElementById('pm-calories');
const profileEditBackdrop = document.getElementById('profile-edit-backdrop');
const profileEditPanel = document.getElementById('profile-edit-panel');
const profileEditClose = document.getElementById('profile-edit-close');
const profileSaveBtn = document.getElementById('profile-save-btn');

const weightCurrentEl = document.getElementById('weight-current');
const weightDeltaEl = document.getElementById('weight-delta');
const weightSparkEl = document.getElementById('weight-sparkline');
const weightCardBtn = document.getElementById('weight-card-btn');
const weightSheetBackdrop = document.getElementById('weight-sheet-backdrop');
const weightSheetPanel = document.getElementById('weight-sheet-panel');
const weightSheetClose = document.getElementById('weight-sheet-close');
const weightInput = document.getElementById('weight-input');
const weightSaveBtn = document.getElementById('weight-save-btn');
const weightHistoryEl = document.getElementById('weight-history');

const reminderToggle = document.getElementById('reminder-toggle');
const reminderStatusEl = document.getElementById('reminder-status');
const reminderOpenBtn = document.getElementById('reminder-open-btn');
const reminderSheetBackdrop = document.getElementById('reminder-sheet-backdrop');
const reminderSheetPanel = document.getElementById('reminder-sheet-panel');
const reminderSheetClose = document.getElementById('reminder-sheet-close');
const reminderTimeInput = document.getElementById('reminder-time-input');
const reminderSaveBtn = document.getElementById('reminder-save-btn');

const calendarTitleEl = document.getElementById('calendar-title');
const calendarGridEl = document.getElementById('calendar-grid');
const calendarPrevBtn = document.getElementById('calendar-prev');
const calendarNextBtn = document.getElementById('calendar-next');
const calendarDayListEl = document.getElementById('calendar-day-list');

const obSaveBtn = document.getElementById('ob-save-btn');

// ============ STATE ============
let allExercises = [];
let allPrograms = [];
let currentWorkoutId = null;
let currentDetailWorkoutId = null;
let currentWorkoutStartedAt = null;
let workoutExercises = [];
let allWorkouts = [];
let currentProfile = null;

let editingProgram = { name: '', exercises: [] };
let sheetMode = 'workout';

let editGender = null;
let editGoal = null;
let editExperience = null;

let obGender = null;
let obGoal = null;
let obExperience = null;

const calendarCache = new Map();
let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth() + 1;
let calSelectedDay = null;

let weightHistory = [];
let reminderEditTime = null;

let workoutTimerInterval = null;
let restTimerInterval = null;
let restHideTimeout = null;
const REST_DURATION = 120;

const EXPERIENCE_LABELS = {
 beginner: 'Новичок',
 intermediate: 'Средний',
 advanced: 'Опытный',
};

const MUSCLE_GROUPS = ['Грудь', 'Спина', 'Ноги', 'Плечи', 'Руки', 'Пресс', 'Кардио', 'Другое'];

function authHeaders() {
 return { 'X-Init-Data': tg?.initData || '' };
}

function getTzOffset() {
 // JS возвращает минуты со ЗНАКОМ НАОБОРОТ (Москва = -180).
 // На бэке ждём «положительное = восточнее UTC», инвертируем знак.
 return -new Date().getTimezoneOffset();
}

// ============ ЭКРАНЫ ============
function showScreen(name) {
 screenHome.classList.toggle('hidden-screen', name !== 'home');
 screenWorkout.classList.toggle('hidden-screen', name !== 'workout');
 screenHistory.classList.toggle('hidden-screen', name !== 'history');
 screenWorkoutDetail.classList.toggle('hidden-screen', name !== 'workout-detail');
 screenProfile.classList.toggle('hidden-screen', name !== 'profile');
 screenRecords.classList.toggle('hidden-screen', name !== 'records');
 if (screenCalendar) screenCalendar.classList.toggle('hidden-screen', name !== 'calendar');
 if (screenOnboarding) screenOnboarding.classList.toggle('hidden-screen', name !== 'onboarding');
 if (screenProgramEditor) screenProgramEditor.classList.toggle('hidden-screen', name !== 'program-editor');
 if (screenAi) screenAi.classList.toggle('hidden-screen', name !== 'ai');

 document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
 document.getElementById('nav-' + name)?.classList.add('active');

   // Закрываем все открытые модалки при переключении экранов
  const MODAL_BACKDROPS = [
    'sheet-backdrop',
    'create-ex-backdrop',
    'programs-sheet-backdrop',
    'weight-sheet-backdrop',
    'reminder-sheet-backdrop',
    'profile-edit-backdrop',
    'full-reminders-backdrop',
    'nutrition-sheet-backdrop',
  ];
  MODAL_BACKDROPS.forEach(function (id) {
    const el = document.getElementById(id);
    if (el && !el.classList.contains('hidden')) {
      el.classList.add('opacity-0');
      const inner = el.firstElementChild;
      if (inner) inner.classList.add('translate-y-full');
      setTimeout(function () { el.classList.add('hidden'); }, 250);
    }
  });

document.getElementById('wrap')?.scrollTo(0, 0);
}

// ============ ИМЯ + ОНБОРДИНГ ============
async function loadMe() {
 if (!tg?.initData) {
 if (userNameEl) userNameEl.textContent = 'Гость';
 return;
 }
 try {
 const res = await fetch(`${API_URL}/api/me`, { headers: authHeaders() });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 const me = await res.json();
 if (userNameEl) userNameEl.textContent = me.first_name || me.username || 'Гость';
 currentProfile = me;
 if (!me.onboarded_at) openOnboarding();
 if (typeof window.onGymlyUserLoaded === 'function') {
 try { window.onGymlyUserLoaded(me); } catch (e) { console.error(e); }
 }
 } catch (e) {
 console.error(e);
 if (userNameEl) userNameEl.textContent = 'Ошибка загрузки';
 }
}

// ============ ОНБОРДИНГ ============
function openOnboarding() {
 obGender = currentProfile?.gender || null;
 obGoal = currentProfile?.goal || null;
 obExperience = currentProfile?.experience || null;

 document.getElementById('ob-input-weight').value = currentProfile?.weight_kg ?? '';
 document.getElementById('ob-input-height').value = currentProfile?.height_cm ?? '';
 document.getElementById('ob-input-age').value = currentProfile?.age ?? '';

 updateObGenderUI();
 updateObGoalUI();
 updateObExperienceUI();
 showScreen('onboarding');
}

function updateObGenderUI() {
 document.querySelectorAll('[data-ob-gender]').forEach(btn => {
 const a = btn.dataset.obGender === obGender;
 btn.classList.toggle('bg-primary', a);
 btn.classList.toggle('text-white', a);
 btn.classList.toggle('border-primary', a);
 btn.classList.toggle('bg-surface2', !a);
 btn.classList.toggle('text-muted', !a);
 btn.classList.toggle('border-white/5', !a);
 });
}

function updateObGoalUI() {
 document.querySelectorAll('[data-ob-goal]').forEach(btn => {
 const a = btn.dataset.obGoal === obGoal;
 btn.classList.toggle('bg-primary', a);
 btn.classList.toggle('text-white', a);
 btn.classList.toggle('border-primary', a);
 btn.classList.toggle('bg-surface2', !a);
 btn.classList.toggle('text-muted', !a);
 btn.classList.toggle('border-white/5', !a);
 });
}

function updateObExperienceUI() {
 document.querySelectorAll('[data-ob-exp]').forEach(btn => {
 const a = btn.dataset.obExp === obExperience;
 btn.classList.toggle('bg-primary', a);
 btn.classList.toggle('text-white', a);
 btn.classList.toggle('border-primary', a);
 btn.classList.toggle('bg-surface2', !a);
 btn.classList.toggle('text-muted', !a);
 btn.classList.toggle('border-white/5', !a);
 const sub = btn.querySelector('.exp-sub');
 if (sub) {
 sub.classList.toggle('text-white/70', a);
 sub.classList.toggle('text-muted', !a);
 }
 });
}

async function saveOnboarding() {
 const wRaw = document.getElementById('ob-input-weight').value;
  const hRaw = document.getElementById('ob-input-height').value;
  const aRaw = document.getElementById('ob-input-age').value;
  const w = parseWeightInput(wRaw);
  const h = parseInt(hRaw);
  const a = parseInt(aRaw);
  // Валидация только если поле заполнено
  if (wRaw && (isNaN(w) || w < 20 || w > 400)) { tg?.showAlert('Вес должен быть 20-400 кг'); return; }
  if (hRaw && (isNaN(h) || h < 100 || h > 250)) { tg?.showAlert('Рост должен быть 100-250 см'); return; }
  if (aRaw && (isNaN(a) || a < 10 || a > 100)) { tg?.showAlert('Возраст должен быть 10-100 лет'); return; }
 if (!obGoal) { tg?.showAlert('Выбери цель'); return; }
 if (!obExperience) { tg?.showAlert('Выбери опыт'); return; }

 obSaveBtn.style.opacity = '0.6';
 try {
 const res = await fetch(`${API_URL}/api/me`, {
 method: 'PATCH',
 headers: { ...authHeaders(), 'Content-Type': 'application/json' },
 body: JSON.stringify((function(){
        const p = { goal: obGoal, experience: obExperience, mark_onboarded: true };
        if (wRaw && !isNaN(w)) p.weight_kg = w;
        if (hRaw && !isNaN(h)) p.height_cm = h;
        if (aRaw && !isNaN(a)) p.age = a;
        if (obGender) p.gender = obGender;
        return p;
      })()),
 });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 currentProfile = await res.json();
 renderProfileMetrics(currentProfile);
 tg?.HapticFeedback?.notificationOccurred('success');
 showScreen('home');
  updateStartButton();
  // Сразу ведём в тренировку
  setTimeout(function(){ try { openProgramsSheet(); } catch(e) {} }, 400);
 } catch (e) {
 console.error(e);
 tg?.showAlert('Не удалось сохранить');
 } finally {
 obSaveBtn.style.opacity = '1';
 }
}

// ============ ГЛАВНАЯ ============
async function loadRecentWorkouts() {
 if (!tg?.initData) return;
 try {
 const res = await fetch(`${API_URL}/api/workouts?tz_offset=${getTzOffset()}`, { headers: authHeaders() });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 const data = await res.json();
 allWorkouts = data.workouts;
 renderRecent(data.workouts);
 } catch (e) {
 console.error('loadRecentWorkouts', e);
 if (recentListEl) {
 recentListEl.innerHTML = '<p class="text-red-400 text-sm py-4 text-center">Ошибка: ' + e.message + '</p>';
 }
 }
}

function renderRecent(workouts) {
 if (!recentListEl) return;
 if (!workouts || workouts.length === 0) {
 recentListEl.innerHTML = '<p class="text-muted text-sm py-4 text-center">Пока нет тренировок</p>';
 return;
 }
 recentListEl.innerHTML = workouts.slice(0, 3).map(w => {
 const date = parseServerDate(w.finished_at || w.started_at);
 const dateStr = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
 const exNames = (w.exercises || []).map(e => e.exercise_name).join(', ');
 const preview = w.total_sets ? `${w.total_sets} подх. · ${exNames || 'без упражнений'}` : 'Без подходов';
 return `
 <div class="bg-surface rounded-3xl p-4 card-shadow flex items-center justify-between gap-2">
 <div class="min-w-0 flex-1">
 <p class="font-medium truncate">${exNames || 'Тренировка'}</p>
 <p class="text-sm text-muted truncate mt-0.5">${preview}</p>
 </div>
 <span class="text-muted text-sm shrink-0">${dateStr}</span>
 </div>
 `;
 }).join('');
}

// ============ УПРАЖНЕНИЯ ============
async function loadExercises() {
 const cached = localStorage.getItem('exercises_cache');
 if (cached) {
 try {
 allExercises = JSON.parse(cached);
 renderExercisesPicker(allExercises);
 } catch {}
 }
 try {
 const res = await fetch(`${API_URL}/api/exercises`, { headers: authHeaders() });
 const data = await res.json();
 allExercises = data.exercises;
 localStorage.setItem('exercises_cache', JSON.stringify(allExercises));
 renderExercisesPicker(allExercises);
 } catch (e) {
 if (!cached) {
 console.error(e);
 exercisesPickerEl.innerHTML = '<p class="text-red-400 text-center py-4 text-sm">Не удалось загрузить</p>';
 }
 }
}

function renderExercisesPicker(list) {
 if (!exercisesPickerEl) return;
 if (!list || list.length === 0) {
 exercisesPickerEl.innerHTML = '<p class="text-muted text-center py-4 text-sm">Ничего не найдено</p>';
 return;
 }
 const inWorkoutIds = new Set(workoutExercises.map(e => e.id));
 const inProgramIds = new Set(editingProgram.exercises.map(e => e.id));
 const usedIds = sheetMode === 'program' ? inProgramIds : inWorkoutIds;
 const available = list.filter(ex => !usedIds.has(ex.id));

 if (available.length === 0) {
 exercisesPickerEl.innerHTML = '<p class="text-muted text-center py-4 text-sm">Все упражнения добавлены</p>';
 return;
 }

 const groups = {};
 for (const ex of available) {
 if (!groups[ex.muscle_group]) groups[ex.muscle_group] = [];
 groups[ex.muscle_group].push(ex);
 }
 let html = '';
 for (const [group, items] of Object.entries(groups)) {
 html += `<p class="text-[10px] uppercase tracking-wider text-muted2 mt-3 mb-2">${group}</p>`;
 for (const ex of items) {
 const badge = ex.is_custom
 ? '<span class="text-[9px] uppercase tracking-wider text-primary2/70 bg-primary/10 rounded-full px-1.5 py-0.5 ml-1.5 shrink-0">моё</span>'
 : '';
 html += `
 <button class="exercise-pick w-full bg-surface2 hover:bg-surface active:scale-[0.98]
 transition rounded-2xl px-4 py-3.5 text-left flex items-center justify-between gap-2
"
 data-id="${ex.id}" data-name="${ex.name}">
 <span class="font-medium text-sm break-words min-w-0 text-left">${ex.name}${badge}</span>
 <span class="text-primary text-xl leading-none shrink-0 font-light">+</span>
 </button>
 `;
 }
 }
 exercisesPickerEl.innerHTML = html;

 exercisesPickerEl.querySelectorAll('.exercise-pick').forEach(btn => {
 btn.addEventListener('click', () => {
 if (sheetMode === 'program') {
 addExerciseToProgram(parseInt(btn.dataset.id), btn.dataset.name);
 } else {
 addExerciseToWorkout(parseInt(btn.dataset.id), btn.dataset.name);
 }
 closeSheet();
 });
 });
}

function openSheet(mode = 'workout') {
 sheetMode = mode;
 renderExercisesPicker(allExercises);
 sheetBackdrop.classList.remove('hidden');
 requestAnimationFrame(() => {
 sheetBackdrop.classList.remove('opacity-0');
 sheetContent.classList.remove('translate-y-full');
 });
 tg?.HapticFeedback?.impactOccurred('light');
}

function closeSheet() {
 sheetBackdrop.classList.add('opacity-0');
 sheetContent.classList.add('translate-y-full');
 setTimeout(() => sheetBackdrop.classList.add('hidden'), 250);
 tg?.HapticFeedback?.impactOccurred('light');
}

// ============ СОЗДАНИЕ УПРАЖНЕНИЯ ============
function openCreateExerciseSheet() {
 closeSheet();
 setTimeout(() => {
 createExName.value = '';
 createExGroup.value = '';
 renderMuscleGroupPicker();
 createExBackdrop.classList.remove('hidden');
 requestAnimationFrame(() => {
 createExBackdrop.classList.remove('opacity-0');
 createExPanel.classList.remove('translate-y-full');
 });
 tg?.HapticFeedback?.impactOccurred('light');
 }, 260);
}

function closeCreateExerciseSheet() {
 createExBackdrop.classList.add('opacity-0');
 createExPanel.classList.add('translate-y-full');
 setTimeout(() => createExBackdrop.classList.add('hidden'), 250);
 tg?.HapticFeedback?.impactOccurred('light');
}

function renderMuscleGroupPicker() {
 const container = document.getElementById('create-ex-group-chips');
 if (!container) return;
 container.innerHTML = MUSCLE_GROUPS.map(g => `
 <button type="button" class="muscle-chip py-2.5 px-3 rounded-2xl text-xs font-medium transition
 border bg-surface2 text-muted border-white/5"
 data-group="${g}">${g}</button>
 `).join('');
 container.querySelectorAll('.muscle-chip').forEach(btn => {
 btn.addEventListener('click', (e) => {
 e.preventDefault();
 createExGroup.value = btn.dataset.group;
 container.querySelectorAll('.muscle-chip').forEach(b => {
 const a = b.dataset.group === btn.dataset.group;
 b.classList.toggle('bg-primary', a);
 b.classList.toggle('text-white', a);
 b.classList.toggle('border-primary', a);
 b.classList.toggle('bg-surface2', !a);
 b.classList.toggle('text-muted', !a);
 b.classList.toggle('border-white/5', !a);
 });
 tg?.HapticFeedback?.selectionChanged?.();
 });
 });
}

async function saveCustomExercise() {
 const name = (createExName.value || '').trim();
 const group = (createExGroup.value || '').trim();
 if (!name || name.length > 128) { tg?.showAlert('Введи название (до 128 символов)'); return; }
 if (!group) { tg?.showAlert('Выбери группу мышц'); return; }

 createExSave.style.opacity = '0.6';
 try {
 const res = await fetch(`${API_URL}/api/exercises`, {
 method: 'POST',
 headers: { ...authHeaders(), 'Content-Type': 'application/json' },
 body: JSON.stringify({ name, muscle_group: group, is_compound: false }),
 });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 const created = await res.json();
 allExercises.push(created);
 allExercises.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
 localStorage.setItem('exercises_cache', JSON.stringify(allExercises));
 closeCreateExerciseSheet();
 tg?.HapticFeedback?.notificationOccurred('success');
 setTimeout(() => { openSheet(sheetMode); }, 300);
 } catch (e) {
 console.error(e);
 tg?.showAlert('Не удалось создать упражнение');
 } finally {
 createExSave.style.opacity = '1';
 }
}

// ============ ПРОГРАММЫ ============
async function openProgramsSheet() {
 if (currentWorkoutId) {
 showScreen('workout');
 renderWorkoutExercises();
 updateWorkoutUI();
 return;
 }
 progSheetBackdrop.classList.remove('hidden');
 requestAnimationFrame(() => {
 progSheetBackdrop.classList.remove('opacity-0');
 progSheetContent.classList.remove('translate-y-full');
 });
 tg?.HapticFeedback?.impactOccurred('light');
 progListEl.innerHTML = '<p class="text-muted text-center py-4 text-sm">Загрузка...</p>';
 await loadPrograms();
 renderProgramsList();
}

function closeProgramsSheet() {
 progSheetBackdrop.classList.add('opacity-0');
 progSheetContent.classList.add('translate-y-full');
 setTimeout(() => progSheetBackdrop.classList.add('hidden'), 250);
 tg?.HapticFeedback?.impactOccurred('light');
}

async function loadPrograms() {
 try {
 const res = await fetch(`${API_URL}/api/programs`, { headers: authHeaders() });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 const data = await res.json();
 allPrograms = data.programs || [];
 } catch (e) {
 console.error('loadPrograms', e);
 allPrograms = [];
 }
}

function renderProgramsList() {
 const templates = allPrograms.filter(p => p.is_template);
 const mine = allPrograms.filter(p => !p.is_template);
 let html = '';

 if (templates.length > 0) {
 html += '<p class="text-[10px] uppercase tracking-wider text-muted2 mb-2">Программы для тебя</p>';
 for (const p of templates) {
 const cnt = (p.exercises || []).length;
 html += `
 <button class="program-item w-full bg-surface2 hover:bg-surface active:scale-[0.98]
 transition rounded-2xl p-4 text-left mb-2"
 data-program-id="${p.id}">
 <div class="flex items-center justify-between gap-2">
 <div class="min-w-0">
 <p class="font-semibold">${p.name}</p>
 <p class="text-xs text-muted mt-0.5">${cnt} упражнений</p>
 </div>
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b8b9e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
 </div>
 </button>
 `;
 }
 }

 if (mine.length > 0) {
 html += '<p class="text-[10px] uppercase tracking-wider text-muted2 mt-4 mb-2">Мои программы</p>';
 for (const p of mine) {
 const cnt = (p.exercises || []).length;
 html += `
 <div class="program-row flex items-center gap-2 mb-2">
 <button class="program-item flex-1 bg-surface2 hover:bg-surface active:scale-[0.98]
 transition rounded-2xl p-4 text-left"
 data-program-id="${p.id}">
 <div class="flex items-center justify-between gap-2">
 <div class="min-w-0">
 <p class="font-semibold">${p.name}</p>
 <p class="text-xs text-muted mt-0.5">${cnt} упражнений</p>
 </div>
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b8b9e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
 </div>
 </button>
 <button class="share-program-btn text-primary2/80 hover:text-primary2 p-2 rounded-xl border border-primary/15 bg-primary/5 active:scale-95 transition"
 data-program-id="${p.id}" data-program-name="${String(p.name).replace(/"/g, '&quot;')}" title="Поделиться">
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
 <circle cx="18" cy="5" r="3"/>
 <circle cx="6" cy="12" r="3"/>
 <circle cx="18" cy="19" r="3"/>
 <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>
 </svg>
 </button>
 <button class="delete-program text-muted hover:text-red-400 p-2 rounded-xl bg-surface2"
 data-program-id="${p.id}" title="Удалить">
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
 </button>
 </div>
 `;
 }
 }

 if (templates.length === 0 && mine.length === 0) {
 html = '<p class="text-muted text-center py-4 text-sm">Программ пока нет</p>';
 }

 progListEl.innerHTML = html;
 progListEl.querySelectorAll('.program-item').forEach(btn => {
 btn.addEventListener('click', () => startWorkoutFromProgram(parseInt(btn.dataset.programId)));
 });
 progListEl.querySelectorAll('.delete-program').forEach(btn => {
 btn.addEventListener('click', (e) => {
 e.stopPropagation();
 deleteProgram(parseInt(btn.dataset.programId));
 });
 });
}

async function startWorkoutFromProgram(programId) {
 tg?.HapticFeedback?.impactOccurred('medium');
 try {
 const res = await fetch(`${API_URL}/api/workouts/from-program/${programId}?tz_offset=${getTzOffset()}`, {
 method: 'POST',
 headers: authHeaders(),
 });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 const data = await res.json();

 currentWorkoutId = data.workout_id;
 startWorkoutTimer(data.started_at);

 workoutExercises = (data.exercises || []).map(e => ({
 id: e.id,
 name: e.name,
 sets: [],
 target_sets: e.target_sets,
 target_reps: e.target_reps,
 is_bodyweight: !!e.is_bodyweight,
 }));

 closeProgramsSheet();
 updateStartButton();
 renderWorkoutExercises();
 updateWorkoutUI();
 showScreen('workout');

 for (const we of workoutExercises) {
 fillLastSet(we.id);
 }
 } catch (e) {
 console.error(e);
 tg?.showAlert('Не удалось начать тренировку');
 }
}

async function deleteProgram(programId) {
 const ok = await new Promise(resolve => {
 if (tg?.showConfirm) tg.showConfirm('Удалить программу?', (yes) => resolve(yes));
 else resolve(confirm('Удалить программу?'));
 });
 if (!ok) return;
 try {
 const res = await fetch(`${API_URL}/api/programs/${programId}`, {
 method: 'DELETE',
 headers: authHeaders(),
 });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 tg?.HapticFeedback?.notificationOccurred('success');
 await loadPrograms();
 renderProgramsList();
 } catch (e) {
 console.error(e);
 tg?.showAlert('Не удалось удалить');
 }
}

// ============ РЕДАКТОР ПРОГРАММЫ ============
function openProgramEditor() {
 editingProgram = { name: '', exercises: [] };
 if (programEditorName) programEditorName.value = '';
 renderProgramEditorExercises();
 closeProgramsSheet();
 showScreen('program-editor');
}

function closeProgramEditor() {
 showScreen('home');
}

function addExerciseToProgram(id, name) {
 tg?.HapticFeedback?.impactOccurred('light');
 if (editingProgram.exercises.some(e => e.id === id)) return;
 editingProgram.exercises.push({ id, name });
 renderProgramEditorExercises();
}

function removeExerciseFromProgram(id) {
 editingProgram.exercises = editingProgram.exercises.filter(e => e.id !== id);
 renderProgramEditorExercises();
}

function renderProgramEditorExercises() {
 if (!programEditorList) return;
 if (editingProgram.exercises.length === 0) {
 programEditorList.innerHTML = '';
 if (programEditorEmpty) programEditorEmpty.classList.remove('hidden');
 return;
 }
 if (programEditorEmpty) programEditorEmpty.classList.add('hidden');
 programEditorList.innerHTML = editingProgram.exercises.map((ex, idx) => `
 <div class="bg-surface rounded-2xl p-3.5 card-shadow flex items-center gap-3">
 <span class="text-muted text-xs w-6 shrink-0 text-center">${idx + 1}</span>
 <p class="flex-1 font-medium text-sm min-w-0 break-words">${ex.name}</p>
 <button class="remove-prog-ex text-muted hover:text-red-400 p-1.5 -mr-1 shrink-0" data-id="${ex.id}">
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
 </button>
 </div>
 `).join('');
 programEditorList.querySelectorAll('.remove-prog-ex').forEach(btn => {
 btn.addEventListener('click', () => removeExerciseFromProgram(parseInt(btn.dataset.id)));
 });
}

async function saveProgram() {
 const name = (programEditorName?.value || '').trim();
 if (!name) { tg?.showAlert('Введи название программы'); return; }
 if (name.length > 128) { tg?.showAlert('Название слишком длинное'); return; }
 if (editingProgram.exercises.length === 0) { tg?.showAlert('Добавь хотя бы одно упражнение'); return; }

 programSaveBtn.style.opacity = '0.6';
 try {
 const res = await fetch(`${API_URL}/api/programs`, {
 method: 'POST',
 headers: { ...authHeaders(), 'Content-Type': 'application/json' },
 body: JSON.stringify({ name, exercise_ids: editingProgram.exercises.map(e => e.id) }),
 });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 tg?.HapticFeedback?.notificationOccurred('success');
 await loadPrograms();
 showScreen('home');
 } catch (e) {
 console.error(e);
 tg?.showAlert('Не удалось сохранить программу');
 } finally {
 programSaveBtn.style.opacity = '1';
 }
}

// ============ ТАЙМЕРЫ ============
function startWorkoutTimer(startedAtISO) {
 stopWorkoutTimer();
 if (!startedAtISO) {
 if (workoutTimerEl) workoutTimerEl.textContent = '';
 return;
 }
 currentWorkoutStartedAt = parseServerDate(startedAtISO);
 tickWorkoutTimer();
 workoutTimerInterval = setInterval(tickWorkoutTimer, 1000);
}

function stopWorkoutTimer() {
 if (workoutTimerInterval) { clearInterval(workoutTimerInterval); workoutTimerInterval = null; }
 currentWorkoutStartedAt = null;
 if (workoutTimerEl) workoutTimerEl.textContent = '';
}

function tickWorkoutTimer() {
 if (!currentWorkoutStartedAt || !workoutTimerEl) return;
 const elapsed = Math.floor((Date.now() - currentWorkoutStartedAt.getTime()) / 1000);
 workoutTimerEl.textContent = formatDuration(elapsed);
}

function formatDuration(sec) {
 const h = Math.floor(sec / 3600);
 const m = Math.floor((sec % 3600) / 60);
 const s = sec % 60;
 if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
 return `${m}:${String(s).padStart(2, '0')}`;
}

function startRestTimer() {
 if (restTimerInterval) { clearInterval(restTimerInterval); restTimerInterval = null; }
 if (restHideTimeout) { clearTimeout(restHideTimeout); restHideTimeout = null; }
 let remaining = REST_DURATION;
 restTimerEl.classList.remove('hidden');
 void restTimerEl.offsetHeight;
 restTimerEl.classList.remove('translate-y-full');
 updateRestUI(remaining);
 restTimerInterval = setInterval(() => {
 remaining -= 1;
 if (remaining <= 0) { stopRestTimer(true); return; }
 updateRestUI(remaining);
 }, 1000);
}

function updateRestUI(remaining) {
 if (restTimeEl) restTimeEl.textContent = formatDuration(remaining);
 if (restProgressEl) restProgressEl.style.width = ((remaining / REST_DURATION) * 100) + '%';
}

function stopRestTimer(notify = false) {
 if (restTimerInterval) { clearInterval(restTimerInterval); restTimerInterval = null; }
 if (restHideTimeout) { clearTimeout(restHideTimeout); restHideTimeout = null; }
 if (restTimerEl) {
 restTimerEl.classList.add('translate-y-full');
 restHideTimeout = setTimeout(() => {
 restTimerEl.classList.add('hidden');
 restHideTimeout = null;
 }, 300);
 }
 if (notify) tg?.HapticFeedback?.notificationOccurred('success');
}

// ============ ТРЕНИРОВКА ============
async function startEmptyWorkout() {
 try {
 const res = await fetch(`${API_URL}/api/workouts`, {
 method: 'POST',
 headers: authHeaders(),
 });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 const data = await res.json();
 currentWorkoutId = data.workout_id;
 startWorkoutTimer(data.started_at);
 closeProgramsSheet();
 updateStartButton();
 renderWorkoutExercises();
 updateWorkoutUI();
 showScreen('workout');
 } catch (e) {
 console.error(e);
 tg?.showAlert('Не удалось начать тренировку');
 }
}

async function loadActiveWorkout() {
 if (!tg?.initData) return;
 try {
 const res = await fetch(`${API_URL}/api/workouts/active`, { headers: authHeaders() });
 if (!res.ok) return;
 const data = await res.json();
 if (data.active) {
 currentWorkoutId = data.active.id;
 startWorkoutTimer(data.active.started_at);

 // Собираем подходы по упражнению
 const map = {};
 for (const s of data.active.sets) {
 if (!map[s.exercise_id]) map[s.exercise_id] = { id: s.exercise_id, name: '', sets: [] };
 map[s.exercise_id].sets.push(s);
 }

 // Добавляем упражнения из плана (даже пустые — без подходов)
 const plan = data.active.plan || [];
 for (const p of plan) {
   const pName = p.name || p.exercise_name || '';
   if (!map[p.exercise_id]) {
     map[p.exercise_id] = {
       id: p.exercise_id,
       name: pName,
       sets: [],
       target_sets: p.target_sets,
       target_reps: p.target_reps,
       is_bodyweight: !!p.is_bodyweight,
     };
   } else {
     if (!map[p.exercise_id].name) map[p.exercise_id].name = pName;
     if (map[p.exercise_id].target_sets == null) map[p.exercise_id].target_sets = p.target_sets;
     if (map[p.exercise_id].target_reps == null) map[p.exercise_id].target_reps = p.target_reps;
     if (p.is_bodyweight) map[p.exercise_id].is_bodyweight = true;
   }
 }

 workoutExercises = Object.values(map);

 // Восстановим имена из локального справочника, если что-то пропущено
 for (const we of workoutExercises) {
 const found = allExercises.find(ex => ex.id === we.id);
 if (found) {
   if (!we.name) we.name = found.name;
   if (we.is_bodyweight == null) we.is_bodyweight = !!found.is_bodyweight;
 }
 }

 updateStartButton();
 renderWorkoutExercises();
 updateWorkoutUI();

 // Подтянем прошлые веса для пустых упражнений из плана
 for (const we of workoutExercises) {
 if (we.sets.length === 0) {
 fillLastSet(we.id);
 }
 }
 }
 } catch (e) { console.error(e); }
}

function updateStartButton() {
 if (!startWorkoutBtn) return;
 const titleEl = startWorkoutBtn.querySelector('.start-title');
 const subtitleEl = startWorkoutBtn.querySelector('.start-subtitle');
 const iconEl = startWorkoutBtn.querySelector('.start-icon');

 if (currentWorkoutId) {
 if (subtitleEl) subtitleEl.textContent = 'Продолжить';
 if (titleEl) titleEl.textContent = 'Тренировка идёт';
 if (iconEl) iconEl.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" class="text-white/90"><path d="M8 5v14l11-7z"/></svg>`;
 } else {
 if (subtitleEl) subtitleEl.textContent = 'Новая сессия';
 if (titleEl) titleEl.textContent = 'Начать тренировку';
 if (iconEl) iconEl.innerHTML = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/90"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
 }
}

function addExerciseToWorkout(id, name) {
 tg?.HapticFeedback?.impactOccurred('light');
 if (workoutExercises.some(e => e.id === id)) return;
 const _exRef = allExercises.find(e => e.id === id);
 workoutExercises.push({
   id, name, sets: [], lastWeight: null, lastReps: null,
   is_bodyweight: !!(_exRef && _exRef.is_bodyweight),
 });
 renderWorkoutExercises();
 updateWorkoutUI();
 fillLastSet(id);
 syncWorkoutPlan();
}

async function fillLastSet(exerciseId) {
 try {
 const res = await fetch(`${API_URL}/api/exercises/${exerciseId}/last-set`, { headers: authHeaders() });
 if (!res.ok) return;
 const data = await res.json();
 const we = workoutExercises.find(e => e.id === exerciseId);
 if (!we) return;
 we.lastWeight = data.weight;
 we.lastReps = data.reps;
 const card = workoutExercisesEl.querySelector(`[data-ex-id="${exerciseId}"]`);
 if (!card) return;
 const weightInput = card.querySelector('.set-weight');
 const repsInput = card.querySelector('.set-reps');
 if (weightInput && data.weight != null) weightInput.value = data.weight;
 if (repsInput && data.reps != null) repsInput.value = data.reps;
 const hint = card.querySelector('.last-set-hint');
 if (hint && data.weight != null && data.reps != null) {
 hint.textContent = `Прошлый раз: ${data.weight} кг × ${data.reps}`;
 hint.classList.remove('hidden');
 }
 } catch (e) { console.error('fillLastSet', e); }
}

async function syncWorkoutPlan() {
 if (!currentWorkoutId) return;
 const ids = workoutExercises.map(e => e.id);
 try {
 await fetch(`${API_URL}/api/workouts/${currentWorkoutId}/plan`, {
 method: 'PATCH',
 headers: { ...authHeaders(), 'Content-Type': 'application/json' },
 body: JSON.stringify({ exercise_ids: ids }),
 });
 } catch (e) {
 console.error('syncWorkoutPlan', e);
 }
}

function removeExerciseFromWorkout(id) {
 workoutExercises = workoutExercises.filter(e => e.id !== id);
 renderWorkoutExercises();
 updateWorkoutUI();
 syncWorkoutPlan();
}

function updateWorkoutUI() {
 const has = workoutExercises.length > 0;
 workoutHeaderEl.classList.toggle('hidden', !has);
 workoutDividerEl.classList.toggle('hidden', !has);
 finishWorkoutBtn.classList.toggle('hidden', !has);
 if (workoutEmptyEl) workoutEmptyEl.classList.toggle('hidden', has);
}

function renderWorkoutExercises() {
 if (workoutExercises.length === 0) {
 workoutExercisesEl.innerHTML = '';
 return;
 }
 workoutExercisesEl.innerHTML = workoutExercises.map(ex => {
 const planHint = (ex.target_sets && ex.target_reps)
 ? `<p class="plan-hint text-xs text-primary2/80 mb-2">План: ${ex.target_sets} × ${ex.target_reps}</p>`
 : '';
 return `
 <div class="bg-surface rounded-3xl p-4 overflow-hidden card-shadow" data-ex-id="${ex.id}">
 <div class="flex items-start justify-between gap-2 mb-2">
 <p class="font-semibold break-words min-w-0 flex-1">${ex.name}</p>
 <button class="remove-ex text-muted2 text-xs hover:text-red-400 shrink-0" data-ex-id="${ex.id}">удалить</button>
 </div>
 <p class="last-set-hint hidden text-xs text-muted mb-1"></p>
 ${planHint}
 <div class="sets-container space-y-1.5 mb-3" data-ex-id="${ex.id}"></div>
 <div class="flex gap-2 items-stretch">
 ${ex.is_bodyweight ? '' : ` <input type="text" inputmode="decimal" placeholder="Вес"
 class="set-weight flex-1 min-w-0 bg-surface2 rounded-2xl px-3 py-3 text-white text-center
 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
 data-ex-id="${ex.id}">
`}
 <input type="text" inputmode="numeric" placeholder="Повт"
 class="set-reps flex-1 min-w-0 bg-surface2 rounded-2xl px-3 py-3 text-white text-center
 focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
 data-ex-id="${ex.id}">
 <button class="add-set-btn bg-primary hover:bg-primary/90 active:scale-95 transition
 rounded-2xl w-12 shrink-0 font-bold text-white text-xl"
 data-ex-id="${ex.id}">+</button>
 </div>
 </div>
 `;
 }).join('');

 workoutExercises.forEach(ex => renderSetsForExercise(ex.id, ex.sets));

 workoutExercisesEl.querySelectorAll('.remove-ex').forEach(btn => {
 btn.addEventListener('click', () => removeExerciseFromWorkout(parseInt(btn.dataset.exId)));
 });
 workoutExercisesEl.querySelectorAll('.add-set-btn').forEach(btn => {
 btn.addEventListener('click', () => addSetInline(parseInt(btn.dataset.exId)));
 });
 workoutExercisesEl.querySelectorAll('.set-reps').forEach(inp => {
 inp.addEventListener('keydown', (e) => {
 if (e.key === 'Enter') addSetInline(parseInt(inp.dataset.exId));
 });
 });
}

function renderSetsForExercise(exerciseId, sets) {
 const container = workoutExercisesEl.querySelector(`.sets-container[data-ex-id="${exerciseId}"]`);
 if (!container) return;
 if (!sets || sets.length === 0) { container.innerHTML = ''; return; }
 container.innerHTML = sets.map((s, i) => {
 const isLast = i === sets.length - 1;
 return `
 <div class="set-row flex items-center gap-2 text-sm py-1" data-set-id="${s.id}">
 <span class="text-muted2 text-xs w-6 shrink-0">#${i + 1}</span>
 <span class="flex-1"><b>${s.weight}</b> кг × <b>${s.reps}</b></span>
 ${isLast ? `<button class="delete-set text-muted2 hover:text-red-400 transition p-1 -mr-1 shrink-0" data-set-id="${s.id}" data-ex-id="${exerciseId}">
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
 </button>` : ''}
 </div>
 `;
 }).join('');
 container.querySelectorAll('.delete-set').forEach(btn => {
 btn.addEventListener('click', () => deleteSetInline(parseInt(btn.dataset.exId), btn.dataset.setId));
 });
}

async function deleteSetInline(exerciseId, setId) {
 const we = workoutExercises.find(e => e.id === exerciseId);
 if (!we) return;
 const idx = we.sets.findIndex(s => String(s.id) === String(setId));
 if (idx === -1) return;
 const removed = we.sets[idx];
 we.sets.splice(idx, 1);
 renderSetsForExercise(exerciseId, we.sets);
 tg?.HapticFeedback?.impactOccurred('medium');
 if (String(setId).startsWith('temp_')) return;
 if (!currentWorkoutId) return;
 try {
 const res = await fetch(`${API_URL}/api/workouts/${currentWorkoutId}/sets/${setId}`, {
 method: 'DELETE', headers: authHeaders(),
 });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 calendarCache.clear();
 } catch (e) {
 console.error(e);
 we.sets.splice(idx, 0, removed);
 renderSetsForExercise(exerciseId, we.sets);
 tg?.showAlert('Не удалось удалить подход');
 }
}

async function addSetInline(exerciseId) {
 const card = workoutExercisesEl.querySelector(`[data-ex-id="${exerciseId}"]`);
 if (!card) return;
 const weightInput = card.querySelector('.set-weight');
 const repsInput = card.querySelector('.set-reps');
 const _weBW = workoutExercises.find(e => e.id === exerciseId);
 const _isBW = !!(_weBW && _weBW.is_bodyweight);
 const weight = _isBW ? 0 : parseWeightInput(weightInput.value);
 const reps = parseInt(repsInput.value);
 if (!_isBW && (isNaN(weight) || weight < 0)) { tg?.showAlert('Введи вес'); return; }
 if (isNaN(reps) || reps < 1) { tg?.showAlert('Введи повторы'); return; }

 const we = workoutExercises.find(e => e.id === exerciseId);
 if (!we) return;
 const tempId = 'temp_' + Date.now();
 const optimisticSet = { id: tempId, exercise_id: exerciseId, set_number: we.sets.length + 1, weight, reps };
 we.sets.push(optimisticSet);
 renderSetsForExercise(exerciseId, we.sets);
 repsInput.blur();
 tg?.HapticFeedback?.notificationOccurred('success');

 if (!currentWorkoutId) {
 await startEmptyWorkout();
 if (!currentWorkoutId) {
 we.sets = we.sets.filter(s => s.id !== tempId);
 renderSetsForExercise(exerciseId, we.sets);
 tg?.showAlert('Не удалось начать тренировку');
 return;
 }
 }
 try {
 const params = new URLSearchParams({ exercise_id: exerciseId, weight, reps });
 const res = await fetch(`${API_URL}/api/workouts/${currentWorkoutId}/sets?${params}`, {
 method: 'POST', headers: authHeaders(),
 });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 const realSet = await res.json();
 const idx = we.sets.findIndex(s => s.id === tempId);
 if (idx !== -1) we.sets[idx] = realSet;
 renderSetsForExercise(exerciseId, we.sets);
 startRestTimer();
 calendarCache.clear();
 } catch (e) {
 console.error(e);
 we.sets = we.sets.filter(s => s.id !== tempId);
 renderSetsForExercise(exerciseId, we.sets);
 tg?.showAlert('Не удалось сохранить подход');
 }
}

async function finishWorkout() {
 const _totalSets = workoutExercises.reduce((s, ex) => s + ((ex.sets && ex.sets.length) || 0), 0);
 if (_totalSets === 0) {
 const _ok = await new Promise(resolve => {
 if (tg?.showConfirm) tg.showConfirm('Пустая тренировка. Удалить?', (yes) => resolve(yes));
 else resolve(confirm('Удалить пустую?'));
 });
 if (_ok) {
 try {
 await fetch(`${API_URL}/api/workouts/${currentWorkoutId}`, { method: 'DELETE', headers: authHeaders() });
 } catch (_e) {}
 currentWorkoutId = null;
 workoutExercises = [];
 stopWorkoutTimer();
 stopRestTimer();
 updateStartButton();
 calendarCache.clear();
 calSelectedDay = null;
 await loadRecentWorkouts();
 showScreen('home');
 }
 return;
 }
 if (!currentWorkoutId) return;
 const ok = await new Promise(resolve => {
 if (tg?.showConfirm) tg.showConfirm('Завершить тренировку?', (yes) => resolve(yes));
 else resolve(confirm('Завершить тренировку?'));
 });
 if (!ok) return;
 try {
 const res = await fetch(`${API_URL}/api/workouts/${currentWorkoutId}/finish`, {
 method: 'PATCH', headers: authHeaders(),
 });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 tg?.HapticFeedback?.notificationOccurred('success');
 currentWorkoutId = null;
 workoutExercises = [];
 stopWorkoutTimer();
 stopRestTimer();
 updateStartButton();
 calendarCache.clear();
 calSelectedDay = null;
 await loadRecentWorkouts();
 showScreen('home');
 } catch (e) {
 console.error(e);
 tg?.showAlert('Не удалось завершить');
 }
}

// ============ ИСТОРИЯ ============
async function loadHistory() {
 if (!tg?.initData) return;
 historyListEl.innerHTML = '<p class="text-muted text-center py-8">Загрузка...</p>';
 try {
 const res = await fetch(`${API_URL}/api/workouts`, { headers: authHeaders() });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 const data = await res.json();
 allWorkouts = data.workouts;
 renderHistory(allWorkouts);
 } catch (e) {
 console.error(e);
 historyListEl.innerHTML = '<p class="text-red-400 text-center py-8">Ошибка: ' + e.message + '</p>';
 }
}

function renderHistory(workouts) {
 if (!workouts || workouts.length === 0) {
 historyListEl.innerHTML = `
 <div class="text-center py-16">
 <div class="inline-flex items-center justify-center w-20 h-20 rounded-4xl bg-surface mb-5 text-muted/40 empty-icon-ring">
 <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
 <path d="M3 3v18h18"/>
 <path d="M7 14l3-3 3 3 5-6"/>
 </svg>
 </div>
 <p class="text-white/90 text-sm font-medium mb-1">Пока нет тренировок</p>
 <p class="text-muted2 text-xs">Начни первую — и она появится здесь</p>
 </div>
 `;
 return;
 }
 historyListEl.innerHTML = workouts.map(w => {
 const date = parseServerDate(w.finished_at || w.started_at);
 const dateStr = date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' });
 const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
 const exNames = (w.exercises || []).map(e => e.exercise_name).join(', ');
 return `
 <button class="workout-item w-full bg-surface hover:bg-surface2 active:scale-[0.98]
 transition rounded-3xl p-4 text-left overflow-hidden card-shadow"
 data-id="${w.id}">
 <div class="flex items-start justify-between gap-2 mb-2">
 <div class="min-w-0">
 <p class="font-semibold">${dateStr}</p>
 <p class="text-xs text-muted mt-0.5">${timeStr}</p>
 </div>
 <span class="text-xs text-muted bg-surface2 rounded-full px-2.5 py-1 shrink-0">${w.total_sets || 0} подх.</span>
 </div>
 <p class="text-sm text-muted truncate">${exNames || 'Без упражнений'}</p>
 </button>
 `;
 }).join('');
 historyListEl.querySelectorAll('.workout-item').forEach(btn => {
 btn.addEventListener('click', () => openWorkoutDetail(parseInt(btn.dataset.id)));
 });
}

function openWorkoutDetail(workoutId) {
 const workout = allWorkouts.find(w => w.id === workoutId);
 if (!workout) { tg?.showAlert('Тренировка не найдена'); return; }
 currentDetailWorkoutId = workoutId;
 tg?.HapticFeedback?.impactOccurred('light');
 const date = parseServerDate(workout.finished_at || workout.started_at);
 detailTitleEl.textContent = date.toLocaleDateString('ru-RU', {
 day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit',
 });
 if (!workout.exercises || workout.exercises.length === 0) {
 detailContentEl.innerHTML = '<p class="text-muted text-center py-8">В тренировке не было подходов</p>';
 } else {
 detailContentEl.innerHTML = workout.exercises.map(ex => `
 <div class="bg-surface rounded-3xl p-4 overflow-hidden card-shadow">
 <p class="font-semibold mb-3 break-words">${ex.exercise_name}</p>
 <div class="space-y-1.5">
 ${ex.sets.map((s, i) => `
 <div class="flex items-center justify-between text-sm">
 <span class="text-muted2 text-xs">#${i + 1}</span>
 <span><b>${s.weight}</b> кг × <b>${s.reps}</b></span>
 </div>
 `).join('')}
 </div>
 </div>
 `).join('');
 }
 showScreen('workout-detail');
}

async function deleteWorkout() {
 if (!currentDetailWorkoutId) return;

 const ok = await new Promise(resolve => {
 if (tg?.showConfirm) tg.showConfirm('Удалить тренировку? Действие необратимо.', (yes) => resolve(yes));
 else resolve(confirm('Удалить тренировку?'));
 });
 if (!ok) return;

 detailDeleteBtn.style.opacity = '0.5';
 const deletedId = currentDetailWorkoutId;
 try {
 const res = await fetch(`${API_URL}/api/workouts/${deletedId}`, {
 method: 'DELETE',
 headers: authHeaders(),
 });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);

 tg?.HapticFeedback?.notificationOccurred('success');

 calendarCache.clear();
 allWorkouts = allWorkouts.filter(w => w.id !== deletedId);
 currentDetailWorkoutId = null;

 showScreen('history');
 renderHistory(allWorkouts);
 loadRecentWorkouts();
 } catch (e) {
 console.error(e);
 tg?.showAlert('Не удалось удалить тренировку');
 } finally {
 detailDeleteBtn.style.opacity = '1';
 }
}

// ============ КАЛЕНДАРЬ ============
const MONTH_NAMES = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
const WEEKDAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

async function loadCalendarMonth(year, month) {
 const key = `${year}-${month}`;
 if (calendarCache.has(key)) return calendarCache.get(key);
 const res = await fetch(`${API_URL}/api/workouts/calendar?year=${year}&month=${month}`, { headers: authHeaders() });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 const data = await res.json();
 const days = data.days || [];
 calendarCache.set(key, days);
 return days;
}

async function renderCalendar(year, month) {
 calYear = year; calMonth = month;
 if (calendarTitleEl) calendarTitleEl.textContent = `${MONTH_NAMES[month - 1]} ${year}`;
 if (calendarDayListEl) { calendarDayListEl.classList.add('hidden'); calendarDayListEl.innerHTML = ''; }
 calSelectedDay = null;
 calendarGridEl.innerHTML = '<p class="col-span-7 text-muted text-center py-4 text-sm">Загрузка...</p>';

 let days = [];
 try { days = await loadCalendarMonth(year, month); }
 catch (e) {
 console.error('calendar', e);
 calendarGridEl.innerHTML = '<p class="col-span-7 text-red-400 text-center py-4 text-sm">Ошибка загрузки</p>';
 return;
 }

 const dayMap = new Map(); days.forEach(d => dayMap.set(d.day, d));
 const firstDay = new Date(year, month - 1, 1).getDay();
 const offset = (firstDay + 6) % 7;
 const daysInMonth = new Date(year, month, 0).getDate();
 const today = new Date();
 const isCurrentMonth = today.getFullYear() === year && (today.getMonth() + 1) === month;
 const todayDate = today.getDate();

 let html = WEEKDAYS.map(w =>
 `<div class="text-center text-[10px] uppercase tracking-wider text-muted2 py-2">${w}</div>`
 ).join('');
 for (let i = 0; i < offset; i++) html += '<div></div>';

 for (let d = 1; d <= daysInMonth; d++) {
 const info = dayMap.get(d) || { workouts: [], nutrition: null };
 const hasWorkout = (info.workouts || []).length > 0;
 const hasFood = !!info.nutrition;
 const hasAny = hasWorkout || hasFood;
 const isToday = isCurrentMonth && d === todayDate;

 const baseCls = 'aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition relative';
 const stateCls = hasAny
 ? (hasWorkout ? 'bg-primary/15 text-white font-semibold active:scale-95 cursor-pointer' : 'bg-amber-400/10 text-amber-100/90 font-semibold active:scale-95 cursor-pointer')
 : 'text-muted/70';
 const ringCls = isToday ? 'ring-1 ring-primary/60' : '';
 const countBadge = hasWorkout && info.workouts.length > 1
 ? `<span class="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-[9px] font-bold text-white flex items-center justify-center leading-none">${info.workouts.length}</span>`
 : '';

 let dots = '';
 if (hasWorkout || hasFood) {
 dots = '<span class="absolute bottom-1.5 flex gap-0.5">'
 + (hasWorkout ? '<span class="w-1 h-1 rounded-full bg-primary"></span>' : '')
 + (hasFood ? '<span class="w-1 h-1 rounded-full bg-orange-400"></span>' : '')
 + '</span>';
 }

 html += `
 <div class="${baseCls} ${stateCls} ${ringCls}" data-day="${d}">
 <span>${d}</span>
 ${dots}
 ${countBadge}
 </div>
 `;
 }
 calendarGridEl.innerHTML = html;

 calendarGridEl.querySelectorAll('[data-day]').forEach(el => {
 el.addEventListener('click', async () => {
 const d = parseInt(el.dataset.day);
 const info = dayMap.get(d) || { workouts: [], nutrition: null };
 const _isToday = isCurrentMonth && d === todayDate;
 const _hasActive = !!currentWorkoutId && _isToday;
 if ((!info.workouts || info.workouts.length === 0) && !info.nutrition && !_hasActive) {
 if (calendarDayListEl) { calendarDayListEl.classList.add('hidden'); calendarDayListEl.innerHTML = ''; }
 calSelectedDay = null;
 return;
 }
 if (_hasActive) {
 tg?.HapticFeedback?.impactOccurred('light');
 renderCalendarActiveWorkout(d, info);
 return;
 }
 tg?.HapticFeedback?.impactOccurred('light');
 if ((info.workouts || []).length === 1 && !info.nutrition) {
 await ensureWorkoutsLoaded();
 openWorkoutDetail(info.workouts[0].workout_id);
 return;
 }
 calSelectedDay = d;
 if ((info.workouts || []).length > 0) await ensureWorkoutsLoaded();
 renderCalendarDayList(d, info);
 });
 });
}

function renderCalendarDayList(day, info) {
function renderCalendarActiveWorkout(day, info) {
 if (!calendarDayListEl) return;
 const monthName = MONTH_NAMES[calMonth - 1].toLowerCase();
 let html = `<p class="text-[10px] uppercase tracking-wider text-muted2 mb-3">${day} ${monthName}</p>`;
 html += `
 <div class="bg-primary/10 rounded-2xl p-4 mb-3 border border-primary/20">
 <div class="flex items-center gap-2 mb-2">
 <span class="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-primary/20 text-primary2 shrink-0">
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
 <circle cx="12" cy="12" r="9"/>
 <path d="M12 7v5l3 2"/>
 </svg>
 </span>
 <p class="text-sm font-semibold">Тренировка идёт</p>
 </div>
 <p class="text-xs text-muted mb-3">Заверши её, чтобы она появилась в истории</p>
 <button id="cal-resume-workout" class="w-full bg-primary hover:bg-primary/90 active:scale-[0.98] transition rounded-2xl py-3 font-semibold text-sm text-white">
 Продолжить
 </button>
 </div>
 `;
 calendarDayListEl.innerHTML = html;
 calendarDayListEl.classList.remove('hidden');
 document.getElementById('cal-resume-workout')?.addEventListener('click', () => {
 tg?.HapticFeedback?.impactOccurred('medium');
 showScreen('workout');
 renderWorkoutExercises();
 updateWorkoutUI();
 });
}


 if (!calendarDayListEl) return;
 const workouts = info.workouts || [];
 const nut = info.nutrition || null;
 const monthName = MONTH_NAMES[calMonth - 1].toLowerCase();

 let html = `<p class="text-[10px] uppercase tracking-wider text-muted2 mb-3">${day} ${monthName}</p>`;

 if (nut) {
 const target = (typeof calcCalories === 'function' && currentProfile)
 ? calcCalories(currentProfile.weight_kg, currentProfile.height_cm, currentProfile.age, currentProfile.gender, currentProfile.goal)
 : null;
 const cal = Math.round(nut.calories || 0);
 const targetLine = target ? `<span class="text-muted2 text-xs ml-1">/ ${target} ккал</span>` : '';

 html += `
 <div class="bg-surface2 rounded-2xl p-4 mb-3">
 <div class="flex items-center gap-2 mb-3">
 <span class="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300/80 shrink-0">
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
 <path d="M12 7.5c-1.5-1.2-3-2-4.5-2C4.5 5.5 2.5 8 2.5 11c0 4.5 3 9 6.5 9 1 0 2-.4 3-.4s2 .4 3 .4c3.5 0 6.5-4.5 6.5-9 0-3-2-5.5-5-5.5-1.5 0-3 .8-4.5 2z"/>
 <path d="M12 7.5v-3.2"/>
 </svg>
 </span>
 <p class="text-xs font-semibold text-white/90">Питание</p>
 </div>
 <div class="flex items-baseline mb-2">
 <span class="text-2xl font-bold tracking-tight">${cal}</span>
 ${targetLine}
 </div>
 <div class="grid grid-cols-3 gap-2">
 <div class="bg-bg rounded-xl py-2 text-center">
 <p class="text-[9px] uppercase text-muted2">Б</p>
 <p class="text-sm font-semibold mt-0.5 text-sky-300/80">${Math.round(nut.protein || 0)}г</p>
 </div>
 <div class="bg-bg rounded-xl py-2 text-center">
 <p class="text-[9px] uppercase text-muted2">Ж</p>
 <p class="text-sm font-semibold mt-0.5 text-amber-300/80">${Math.round(nut.fat || 0)}г</p>
 </div>
 <div class="bg-bg rounded-xl py-2 text-center">
 <p class="text-[9px] uppercase text-muted2">У</p>
 <p class="text-sm font-semibold mt-0.5 text-emerald-300/80">${Math.round(nut.carbs || 0)}г</p>
 </div>
 </div>
 <p class="text-[10px] text-muted2 mt-2">Записей: ${nut.entries_count || 0}</p>
 </div>
 `;
 }

 if (workouts.length > 0) {
 html += `<p class="text-[10px] uppercase tracking-wider text-muted2 mb-2">Тренировки · ${workouts.length}</p>`;
 html += '<div class="space-y-2">';
 for (const w of workouts) {
 const date = parseServerDate(w.finished_at);
 const time = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
 html += `
 <button class="calendar-day-workout w-full bg-surface2 hover:bg-surface rounded-2xl p-3 text-left
 flex items-center justify-between gap-2 active:scale-[0.98] transition"
 data-workout-id="${w.workout_id}">
 <div class="min-w-0 flex items-center gap-2.5">
 <span class="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-primary/10 border border-primary/15 text-primary2 shrink-0">
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
 <path d="M6.5 6.5v11"/><path d="M17.5 6.5v11"/><path d="M3 9v6"/><path d="M21 9v6"/><path d="M6.5 12h11"/>
 </svg>
 </span>
 <div class="min-w-0">
 <p class="text-sm font-medium">${time}</p>
 <p class="text-xs text-muted mt-0.5">${w.total_sets || 0} подходов</p>
 </div>
 </div>
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b8b9e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
 </button>
 `;
 }
 html += '</div>';
 }

 if (!nut && workouts.length === 0) {
 html += '<p class="text-muted text-center py-6 text-sm">Ничего не записано</p>';
 }

 calendarDayListEl.innerHTML = html;
 calendarDayListEl.classList.remove('hidden');
 calendarDayListEl.querySelectorAll('.calendar-day-workout').forEach(btn => {
 btn.addEventListener('click', async () => {
 const wid = parseInt(btn.dataset.workoutId);
 tg?.HapticFeedback?.impactOccurred('light');
 await ensureWorkoutsLoaded();
 openWorkoutDetail(wid);
 });
 });
}

async function ensureWorkoutsLoaded() {
 if (allWorkouts.length > 0) return;
 try {
 const res = await fetch(`${API_URL}/api/workouts`, { headers: authHeaders() });
 if (!res.ok) return;
 const data = await res.json();
 allWorkouts = data.workouts;
 } catch (e) { console.error(e); }
}

// ============ ПРОФИЛЬ ============
function calcBMI(weight, height) {
 if (!weight || !height) return null;
 const h = height / 100;
 return weight / (h * h);
}

function bmiLabel(bmi) {
 if (bmi < 18.5) return { text: 'Недовес', color: 'text-blue-400' };
 if (bmi < 25) return { text: 'Норма', color: 'text-green-400' };
 if (bmi < 30) return { text: 'Избыток', color: 'text-yellow-400' };
 return { text: 'Ожирение', color: 'text-red-400' };
}

function calcCalories(weight, height, age, gender, goal) {
 if (!weight || !height || !age || !gender) return null;
 const base = 10 * weight + 6.25 * height - 5 * age;
 const bmr = gender === 'male' ? base + 5 : base - 161;
 const tdee = bmr * 1.375;
 if (goal === 'lose') return Math.round(tdee * 0.8);
 if (goal === 'gain') return Math.round(tdee * 1.15);
 return Math.round(tdee);
}

function renderProfileMetrics(p) {
 if (!p) return;
 if (profileExpChipEl) {
 if (p.experience && EXPERIENCE_LABELS[p.experience]) {
 profileExpChipEl.textContent = EXPERIENCE_LABELS[p.experience];
 profileExpChipEl.classList.remove('hidden');
 } else {
 profileExpChipEl.classList.add('hidden');
 }
 }
 const hasAny = p.weight_kg || p.height_cm || p.age;
 if (!hasAny) {
 if (profileMetricsEl) profileMetricsEl.classList.add('hidden');
 if (profileEmptyHintEl) profileEmptyHintEl.classList.remove('hidden');
 return;
 }
 if (profileMetricsEl) profileMetricsEl.classList.remove('hidden');
 if (profileEmptyHintEl) profileEmptyHintEl.classList.add('hidden');

 const w = p.weight_kg, h = p.height_cm, a = p.age;
 if (pmWeightEl) pmWeightEl.textContent = w ? `${w} кг` : '—';
 if (pmHeightEl) pmHeightEl.textContent = h ? `${h} см` : '—';
 if (pmAgeEl) pmAgeEl.textContent = a ? `${a}` : '—';

 const bmi = calcBMI(w, h);
 if (bmi) {
 if (pmBmiEl) pmBmiEl.textContent = bmi.toFixed(1);
 const lbl = bmiLabel(bmi);
 if (pmBmiLabelEl) {
 pmBmiLabelEl.textContent = lbl.text;
 pmBmiLabelEl.className = `text-xs font-medium ${lbl.color}`;
 }
 } else {
 if (pmBmiEl) pmBmiEl.textContent = '—';
 if (pmBmiLabelEl) { pmBmiLabelEl.textContent = ''; pmBmiLabelEl.className = 'text-xs'; }
 }
 const cal = calcCalories(w, h, a, p.gender, p.goal);
 if (pmCaloriesEl) pmCaloriesEl.textContent = cal ? `${cal} ккал` : '—';
}

// ============ ВЕС ============
async function loadWeight() {
 if (!tg?.initData) return;
 try {
 const res = await fetch(`${API_URL}/api/weight`, { headers: authHeaders() });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 const data = await res.json();
 weightHistory = data.logs || [];
 renderWeightCard(data.latest, weightHistory);
 } catch (e) {
 console.error('loadWeight', e);
 renderWeightCard(null, []);
 }
}

function renderWeightCard(latest, logs) {
 if (!weightCurrentEl) return;
 if (!latest) {
 weightCurrentEl.textContent = '—';
 if (weightDeltaEl) weightDeltaEl.textContent = '';
 if (weightSparkEl) weightSparkEl.innerHTML = '';
 return;
 }
 weightCurrentEl.textContent = `${latest.weight_kg} кг`;
 if (logs.length >= 2) {
 const prev = logs[1].weight_kg;
 const delta = latest.weight_kg - prev;
 const sign = delta > 0 ? '+' : '';
 const cls = delta > 0 ? 'text-orange-400' : (delta < 0 ? 'text-green-400' : 'text-muted');
 if (weightDeltaEl) {
 weightDeltaEl.className = `text-xs font-medium ${cls} ml-2`;
 weightDeltaEl.textContent = `${sign}${delta.toFixed(1)} кг`;
 }
 } else {
 if (weightDeltaEl) { weightDeltaEl.textContent = ''; weightDeltaEl.className = 'text-xs'; }
 }
 renderWeightSparkline(logs);
}

function renderWeightSparkline(logs) {
 if (!weightSparkEl) return;
 if (!logs || logs.length < 2) { weightSparkEl.innerHTML = ''; return; }
 const last = logs.slice(0, 30).reverse();
 const weights = last.map(l => l.weight_kg);
 const minW = Math.min(...weights);
 const maxW = Math.max(...weights);
 const range = maxW - minW || 1;
 const W = 280, H = 56, pad = 6;
 const stepX = (W - pad * 2) / (weights.length - 1);
 const points = weights.map((w, i) => {
 const x = pad + stepX * i;
 const y = H - pad - ((w - minW) / range) * (H - pad * 2);
 return [x, y];
 });
 const linePath = points.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
 const lp = points[points.length - 1];
 weightSparkEl.innerHTML = `
 <svg width="100%" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="display:block">
 <path d="${linePath}" fill="none" stroke="#7c6cff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
 <circle cx="${lp[0].toFixed(1)}" cy="${lp[1].toFixed(1)}" r="3" fill="#7c6cff"/>
 <circle cx="${lp[0].toFixed(1)}" cy="${lp[1].toFixed(1)}" r="5.5" fill="#7c6cff" opacity="0.25"/>
 </svg>
 `;
}

function openWeightSheet() {
 let placeholder = '75.5';
 if (weightHistory && weightHistory.length > 0) {
 placeholder = weightHistory[0].weight_kg;
 } else if (currentProfile?.weight_kg) {
 placeholder = currentProfile.weight_kg;
 }
 if (weightInput) {
 weightInput.value = '';
 weightInput.placeholder = String(placeholder);
 }
 renderWeightHistory();
 weightSheetBackdrop.classList.remove('hidden');
 requestAnimationFrame(() => {
 weightSheetBackdrop.classList.remove('opacity-0');
 weightSheetPanel.classList.remove('translate-y-full');
 });
 tg?.HapticFeedback?.impactOccurred('light');
}

function closeWeightSheet() {
 weightSheetBackdrop.classList.add('opacity-0');
 weightSheetPanel.classList.add('translate-y-full');
 setTimeout(() => weightSheetBackdrop.classList.add('hidden'), 250);
 tg?.HapticFeedback?.impactOccurred('light');
}

function renderWeightHistory() {
 if (!weightHistoryEl) return;
 if (!weightHistory || weightHistory.length === 0) {
 weightHistoryEl.innerHTML = '<p class="text-muted text-center text-sm py-3">Пока нет записей</p>';
 return;
 }
 weightHistoryEl.innerHTML = weightHistory.slice(0, 12).map(l => {
 const d = parseServerDate(l.recorded_at);
 const dStr = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
 const tStr = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
 return `
 <div class="weight-row flex items-center gap-2 text-sm py-2 border-b border-white/5 last:border-0">
 <div class="flex-1 min-w-0">
 <p class="font-medium">${l.weight_kg} кг</p>
 <p class="text-xs text-muted mt-0.5">${dStr} · ${tStr}</p>
 </div>
 <button class="delete-weight text-muted2 hover:text-red-400 p-1.5 -mr-1 shrink-0" data-id="${l.id}">
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
 </button>
 </div>
 `;
 }).join('');
 weightHistoryEl.querySelectorAll('.delete-weight').forEach(btn => {
 btn.addEventListener('click', () => deleteWeightLog(parseInt(btn.dataset.id)));
 });
}

async function saveWeight() {
 const raw = weightInput?.value || '';
 const w = parseWeightInput(raw);
 if (isNaN(w) || w < 20 || w > 400) {
 tg?.showAlert(`Введи вес (20–400 кг). Сейчас:"${raw}"`);
 return;
 }
 weightSaveBtn.style.opacity = '0.6';
 try {
 const res = await fetch(`${API_URL}/api/weight`, {
 method: 'POST',
 headers: { ...authHeaders(), 'Content-Type': 'application/json' },
 body: JSON.stringify({ weight_kg: w }),
 });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 tg?.HapticFeedback?.notificationOccurred('success');
 if (currentProfile) currentProfile.weight_kg = w;
 renderProfileMetrics(currentProfile);
 await loadWeight();
 renderWeightHistory();
 if (weightInput) weightInput.value = '';
 } catch (e) {
 console.error(e);
 tg?.showAlert('Не удалось записать вес');
 } finally {
 weightSaveBtn.style.opacity = '1';
 }
}

async function deleteWeightLog(logId) {
 const ok = await new Promise(resolve => {
 if (tg?.showConfirm) tg.showConfirm('Удалить запись?', (yes) => resolve(yes));
 else resolve(confirm('Удалить запись?'));
 });
 if (!ok) return;
 try {
 const res = await fetch(`${API_URL}/api/weight/${logId}`, { method: 'DELETE', headers: authHeaders() });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 tg?.HapticFeedback?.notificationOccurred('success');
 await loadWeight();
 if (weightHistory.length > 0 && currentProfile) {
 currentProfile.weight_kg = weightHistory[0].weight_kg;
 renderProfileMetrics(currentProfile);
 }
 renderWeightHistory();
 } catch (e) {
 console.error(e);
 tg?.showAlert('Не удалось удалить');
 }
}

// ============ НАПОМИНАНИЯ ============
function utcToLocalHHMM(utcHHMM) {
 if (!utcHHMM) return null;
 const [h, m] = utcHHMM.split(':').map(Number);
 const d = new Date();
 d.setUTCHours(h, m, 0, 0);
 return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function localToUtcHHMM(localHHMM) {
 if (!localHHMM) return null;
 const [h, m] = localHHMM.split(':').map(Number);
 const d = new Date();
 d.setHours(h, m, 0, 0);
 return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

function renderReminderCard(p) {
 if (!reminderToggle) return;
 const enabled = !!p?.reminder_enabled;
 reminderToggle.checked = enabled;
 if (reminderStatusEl) {
 if (enabled && p.reminder_time) {
 reminderStatusEl.textContent = `Каждый день в ${utcToLocalHHMM(p.reminder_time)}`;
 reminderStatusEl.className = 'text-xs text-muted mt-1';
 } else if (enabled) {
 reminderStatusEl.textContent = 'Задай время напоминания';
 reminderStatusEl.className = 'text-xs text-yellow-300/80 mt-1';
 } else {
 reminderStatusEl.textContent = 'Напоминания выключены';
 reminderStatusEl.className = 'text-xs text-muted mt-1';
 }
 }
 if (reminderOpenBtn) reminderOpenBtn.classList.toggle('hidden', !enabled);
}

function openReminderSheet() {
 if (!currentProfile) return;
 reminderEditTime = currentProfile.reminder_time ? utcToLocalHHMM(currentProfile.reminder_time) : '18:00';
 if (reminderTimeInput) reminderTimeInput.value = reminderEditTime;
 updateReminderChips();
 reminderSheetBackdrop.classList.remove('hidden');
 requestAnimationFrame(() => {
 reminderSheetBackdrop.classList.remove('opacity-0');
 reminderSheetPanel.classList.remove('translate-y-full');
 });
 tg?.HapticFeedback?.impactOccurred('light');
}

function closeReminderSheet() {
 reminderSheetBackdrop.classList.add('opacity-0');
 reminderSheetPanel.classList.add('translate-y-full');
 setTimeout(() => reminderSheetBackdrop.classList.add('hidden'), 250);
 tg?.HapticFeedback?.impactOccurred('light');
}

function updateReminderChips() {
 document.querySelectorAll('[data-reminder-preset]').forEach(btn => {
 const a = btn.dataset.reminderPreset === reminderEditTime;
 btn.classList.toggle('bg-primary', a);
 btn.classList.toggle('text-white', a);
 btn.classList.toggle('border-primary', a);
 btn.classList.toggle('bg-surface2', !a);
 btn.classList.toggle('text-muted', !a);
 btn.classList.toggle('border-white/5', !a);
 });
}

async function saveReminder() {
 const localTime = reminderTimeInput?.value;
 if (!localTime || !/^\d{2}:\d{2}$/.test(localTime)) { tg?.showAlert('Выбери время'); return; }
 const utcTime = localToUtcHHMM(localTime);
 reminderSaveBtn.style.opacity = '0.6';
 try {
 const res = await fetch(`${API_URL}/api/me`, {
 method: 'PATCH',
 headers: { ...authHeaders(), 'Content-Type': 'application/json' },
 body: JSON.stringify({ reminder_enabled: true, reminder_time: utcTime }),
 });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 currentProfile = await res.json();
 renderReminderCard(currentProfile);
 closeReminderSheet();
 tg?.HapticFeedback?.notificationOccurred('success');
 } catch (e) {
 console.error(e);
 tg?.showAlert('Не удалось сохранить');
 } finally {
 reminderSaveBtn.style.opacity = '1';
 }
}

async function toggleReminder(enabled) {
 try {
 const payload = { reminder_enabled: enabled };
 if (enabled && !currentProfile?.reminder_time) {
 payload.reminder_time = localToUtcHHMM('18:00');
 }
 const res = await fetch(`${API_URL}/api/me`, {
 method: 'PATCH',
 headers: { ...authHeaders(), 'Content-Type': 'application/json' },
 body: JSON.stringify(payload),
 });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 currentProfile = await res.json();
 renderReminderCard(currentProfile);
 tg?.HapticFeedback?.notificationOccurred('success');
 } catch (e) {
 console.error(e);
 renderReminderCard(currentProfile);
 tg?.showAlert('Не удалось переключить');
 }
}

// ============ ПРОФИЛЬ ЗАГРУЗКА ============
async function loadProfile() {
 if (!tg?.initData) return;
 const tgUser = tg.initDataUnsafe?.user;
 if (tgUser) {
 profileNameEl.textContent = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || 'Гость';
 profileUsernameEl.textContent = tgUser.username ? `@${tgUser.username}` : '';
 }

 statStreakEl.textContent = '—';
 statWorkoutsEl.textContent = '—';
 statSetsEl.textContent = '—';
 statVolumeEl.textContent = '—';
 streakHintEl.textContent = '';

 try {
 const [statsRes, meRes] = await Promise.all([
 fetch(`${API_URL}/api/profile/stats`, { headers: authHeaders() }),
 fetch(`${API_URL}/api/me`, { headers: authHeaders() }),
 ]);

 if (statsRes.ok) {
 const stats = await statsRes.json();
 statStreakEl.textContent = stats.streak;

      const flameSvg = document.querySelector('.streak-flame-svg');
      const glowLayer = document.getElementById('flame-glow-layer');
      if (flameSvg && glowLayer) {
        if (stats.streak >= 1) {
          glowLayer.style.opacity = '0.85';
          flameSvg.style.opacity = '1';
        } else {
          glowLayer.style.opacity = '0';
          flameSvg.style.opacity = '0.3';
        }
      }
 statWorkoutsEl.textContent = stats.workouts_count;
 statSetsEl.textContent = stats.sets_count;
 const kg = stats.total_volume_kg;
 if (kg < 1000) statVolumeEl.textContent = `${Math.round(kg)} кг`;
 else statVolumeEl.textContent = `${(kg / 1000).toFixed(1)} т`;

 if (stats.streak === 0 && stats.workouts_count > 0) streakHintEl.textContent = 'Тренируйся, чтобы начать стрик!';
 else if (stats.streak === 0) streakHintEl.textContent = 'Сделай первую тренировку';
 else if (stats.streak === 1) streakHintEl.textContent = 'Начало положено. Продолжай завтра!';
 else streakHintEl.textContent = 'Не разрывай серию! Тренируйся и завтра';
 }

 if (meRes.ok) {
 currentProfile = await meRes.json();
 renderProfileMetrics(currentProfile);
 renderReminderCard(currentProfile);
 }

 await loadWeight();
 if (typeof window.nutritionLoad === 'function') {
 try { await window.nutritionLoad(); } catch (e) { console.error(e); }
 }
 } catch (e) {
 console.error(e);
 statStreakEl.textContent = '?';
 statWorkoutsEl.textContent = '?';
 statSetsEl.textContent = '?';
 statVolumeEl.textContent = '?';
 }
}

function openProfileEdit() {
 if (!currentProfile) return;
 editGender = currentProfile.gender || null;
 editGoal = currentProfile.goal || null;
 editExperience = currentProfile.experience || null;
 document.getElementById('input-weight').value = currentProfile.weight_kg ?? '';
 document.getElementById('input-height').value = currentProfile.height_cm ?? '';
 document.getElementById('input-age').value = currentProfile.age ?? '';
 updateGenderUI();
 updateGoalUI();
 updateExperienceUI();
 profileEditBackdrop.classList.remove('hidden');
 requestAnimationFrame(() => {
 profileEditBackdrop.classList.remove('opacity-0');
 profileEditPanel.classList.remove('translate-y-full');
 });
 tg?.HapticFeedback?.impactOccurred('light');
}

function closeProfileEdit() {
 profileEditBackdrop.classList.add('opacity-0');
 profileEditPanel.classList.add('translate-y-full');
 setTimeout(() => profileEditBackdrop.classList.add('hidden'), 250);
 tg?.HapticFeedback?.impactOccurred('light');
}

function updateGenderUI() {
 document.querySelectorAll('[data-gender]').forEach(btn => {
 const a = btn.dataset.gender === editGender;
 btn.classList.toggle('bg-primary', a);
 btn.classList.toggle('text-white', a);
 btn.classList.toggle('border-primary', a);
 btn.classList.toggle('bg-surface2', !a);
 btn.classList.toggle('text-muted', !a);
 btn.classList.toggle('border-white/5', !a);
 });
}

function updateGoalUI() {
 document.querySelectorAll('[data-goal]').forEach(btn => {
 const a = btn.dataset.goal === editGoal;
 btn.classList.toggle('bg-primary', a);
 btn.classList.toggle('text-white', a);
 btn.classList.toggle('border-primary', a);
 btn.classList.toggle('bg-surface2', !a);
 btn.classList.toggle('text-muted', !a);
 btn.classList.toggle('border-white/5', !a);
 });
}

function updateExperienceUI() {
 document.querySelectorAll('[data-experience]').forEach(btn => {
 const a = btn.dataset.experience === editExperience;
 btn.classList.toggle('bg-primary', a);
 btn.classList.toggle('text-white', a);
 btn.classList.toggle('border-primary', a);
 btn.classList.toggle('bg-surface2', !a);
 btn.classList.toggle('text-muted', !a);
 btn.classList.toggle('border-white/5', !a);
 });
}

async function saveProfile() {
 const w = parseWeightInput(document.getElementById('input-weight').value);
 const h = parseInt(document.getElementById('input-height').value);
 const a = parseInt(document.getElementById('input-age').value);
 if (!isNaN(w) && (w < 20 || w > 400)) { tg?.showAlert('Вес должен быть 20–400 кг'); return; }
 if (!isNaN(h) && (h < 100 || h > 250)) { tg?.showAlert('Рост должен быть 100–250 см'); return; }
 if (!isNaN(a) && (a < 10 || a > 100)) { tg?.showAlert('Возраст 10–100 лет'); return; }
 const payload = {};
 if (!isNaN(w)) payload.weight_kg = w;
 if (!isNaN(h)) payload.height_cm = h;
 if (!isNaN(a)) payload.age = a;
 if (editGender) payload.gender = editGender;
 if (editGoal) payload.goal = editGoal;
 if (editExperience) payload.experience = editExperience;
 if (Object.keys(payload).length === 0) { tg?.showAlert('Заполни хотя бы одно поле'); return; }
 profileSaveBtn.style.opacity = '0.6';
 try {
 const res = await fetch(`${API_URL}/api/me`, {
 method: 'PATCH',
 headers: { ...authHeaders(), 'Content-Type': 'application/json' },
 body: JSON.stringify(payload),
 });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 currentProfile = await res.json();
 renderProfileMetrics(currentProfile);
 closeProfileEdit();
 tg?.HapticFeedback?.notificationOccurred('success');
 } catch (e) {
 console.error(e);
 tg?.showAlert('Не удалось сохранить');
 } finally {
 profileSaveBtn.style.opacity = '1';
 }
}

// ============ РЕКОРДЫ ============
async function loadRecords() {
 if (!tg?.initData) return;
 recordsListEl.innerHTML = '<p class="text-muted text-center py-8">Загрузка...</p>';
 try {
 const res = await fetch(`${API_URL}/api/records`, { headers: authHeaders() });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 const data = await res.json();
 renderRecords(data.records);
 } catch (e) {
 console.error(e);
 recordsListEl.innerHTML = '<p class="text-red-400 text-center py-8">Ошибка: ' + e.message + '</p>';
 }
}

function renderRecords(records) {
 if (!records || records.length === 0) {
 recordsListEl.innerHTML = '<p class="text-muted text-center py-8">Пока нет рекордов.<br>Добавь подход — и он появится здесь.</p>';
 return;
 }
 const groups = {};
 for (const r of records) {
 if (!groups[r.muscle_group]) groups[r.muscle_group] = [];
 groups[r.muscle_group].push(r);
 }
 let html = '';
 for (const [group, items] of Object.entries(groups)) {
 html += `<p class="text-[10px] uppercase tracking-wider text-muted2 mt-4 mb-2">${group}</p>`;
 for (const r of items) {
 const date = parseServerDate(r.achieved_at);
 const dateStr = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
 html += `
 <div class="bg-surface rounded-3xl p-4 card-shadow mb-2">
 <div class="flex items-start justify-between gap-2 mb-2">
 <p class="font-semibold break-words min-w-0 flex-1">${r.exercise_name}</p>
 <span class="text-xs text-muted shrink-0">${dateStr}</span>
 </div>
 <div class="flex items-center justify-between gap-2">
 <span class="text-sm"><b>${r.weight}</b> кг × <b>${r.reps}</b></span>
 <span class="text-xs bg-primary/15 text-primary2 rounded-full px-2.5 py-1 font-medium">1RM ≈ ${r.estimated_1rm} кг</span>
 </div>
 </div>
 `;
 }
 }
 recordsListEl.innerHTML = html;
}

// ============ СОБЫТИЯ ============
startWorkoutBtn?.addEventListener('click', async () => {
 tg?.HapticFeedback?.impactOccurred('medium');
 if (currentWorkoutId) {
 showScreen('workout');
 renderWorkoutExercises();
 updateWorkoutUI();
 return;
 }
 openProgramsSheet();
});

document.getElementById('workout-back')?.addEventListener('click', () => {
 showScreen('home');
 updateStartButton();
});

finishWorkoutBtn?.addEventListener('click', finishWorkout);

addExerciseBtn?.addEventListener('click', () => {
 openSheet('workout');
});

sheetCloseBtn?.addEventListener('click', closeSheet);
sheetBackdrop?.addEventListener('click', (e) => {
 if (e.target === sheetBackdrop) closeSheet();
});
sheetCreateBtn?.addEventListener('click', openCreateExerciseSheet);

createExClose?.addEventListener('click', closeCreateExerciseSheet);
createExSave?.addEventListener('click', saveCustomExercise);

progSheetClose?.addEventListener('click', closeProgramsSheet);
progSheetBackdrop?.addEventListener('click', (e) => {
 if (e.target === progSheetBackdrop) closeProgramsSheet();
});
progEmptyWorkoutBtn?.addEventListener('click', startEmptyWorkout);
progCreateBtn?.addEventListener('click', openProgramEditor);

programEditorAddBtn?.addEventListener('click', () => openSheet('program'));
programSaveBtn?.addEventListener('click', saveProgram);
programEditorBack?.addEventListener('click', closeProgramEditor);

restSkipBtn?.addEventListener('click', () => stopRestTimer(true));

searchInput?.addEventListener('input', (e) => {
 const q = e.target.value.trim().toLowerCase();
 const filtered = !q ? allExercises : allExercises.filter(ex =>
 ex.name.toLowerCase().includes(q) || ex.muscle_group.toLowerCase().includes(q)
 );
 renderExercisesPicker(filtered);
});

obSaveBtn?.addEventListener('click', saveOnboarding);
document.querySelectorAll('[data-ob-gender]').forEach(btn => {
 btn.addEventListener('click', () => {
 obGender = btn.dataset.obGender;
 updateObGenderUI();
 tg?.HapticFeedback?.selectionChanged?.();
 });
});
document.querySelectorAll('[data-ob-goal]').forEach(btn => {
 btn.addEventListener('click', () => {
 obGoal = btn.dataset.obGoal;
 updateObGoalUI();
 tg?.HapticFeedback?.selectionChanged?.();
 });
});
document.querySelectorAll('[data-ob-exp]').forEach(btn => {
 btn.addEventListener('click', () => {
 obExperience = btn.dataset.obExp;
 updateObExperienceUI();
 tg?.HapticFeedback?.selectionChanged?.();
 });
});

profileEditBtn?.addEventListener('click', openProfileEdit);
profileEditClose?.addEventListener('click', closeProfileEdit);
profileEditBackdrop?.addEventListener('click', (e) => {
 if (e.target === profileEditBackdrop) closeProfileEdit();
});
profileSaveBtn?.addEventListener('click', saveProfile);

document.querySelectorAll('[data-gender]').forEach(btn => {
 btn.addEventListener('click', () => {
 editGender = btn.dataset.gender;
 updateGenderUI();
 tg?.HapticFeedback?.selectionChanged?.();
 });
});
document.querySelectorAll('[data-goal]').forEach(btn => {
 btn.addEventListener('click', () => {
 editGoal = btn.dataset.goal;
 updateGoalUI();
 tg?.HapticFeedback?.selectionChanged?.();
 });
});
document.querySelectorAll('[data-experience]').forEach(btn => {
 btn.addEventListener('click', () => {
 editExperience = btn.dataset.experience;
 updateExperienceUI();
 tg?.HapticFeedback?.selectionChanged?.();
 });
});

weightCardBtn?.addEventListener('click', openWeightSheet);
weightSheetClose?.addEventListener('click', closeWeightSheet);
weightSheetBackdrop?.addEventListener('click', (e) => {
 if (e.target === weightSheetBackdrop) closeWeightSheet();
});
weightSaveBtn?.addEventListener('click', saveWeight);
weightInput?.addEventListener('keydown', (e) => {
 if (e.key === 'Enter') saveWeight();
});

reminderToggle?.addEventListener('change', (e) => toggleReminder(e.target.checked));
reminderOpenBtn?.addEventListener('click', openReminderSheet);
reminderSheetClose?.addEventListener('click', closeReminderSheet);
reminderSheetBackdrop?.addEventListener('click', (e) => {
 if (e.target === reminderSheetBackdrop) closeReminderSheet();
});
reminderSaveBtn?.addEventListener('click', saveReminder);
reminderTimeInput?.addEventListener('change', (e) => {
 reminderEditTime = e.target.value;
 updateReminderChips();
});
document.querySelectorAll('[data-reminder-preset]').forEach(btn => {
 btn.addEventListener('click', () => {
 reminderEditTime = btn.dataset.reminderPreset;
 if (reminderTimeInput) reminderTimeInput.value = reminderEditTime;
 updateReminderChips();
 tg?.HapticFeedback?.selectionChanged?.();
 });
});

calendarPrevBtn?.addEventListener('click', () => {
 let y = calYear, m = calMonth - 1;
 if (m < 1) { m = 12; y -= 1; }
 tg?.HapticFeedback?.impactOccurred('light');
 renderCalendar(y, m);
});

calendarNextBtn?.addEventListener('click', () => {
 let y = calYear, m = calMonth + 1;
 if (m > 12) { m = 1; y += 1; }
 tg?.HapticFeedback?.impactOccurred('light');
 renderCalendar(y, m);
});

document.getElementById('nav-home')?.addEventListener('click', () => {
 tg?.HapticFeedback?.impactOccurred('light');
 showScreen('home');
 updateStartButton();
});

document.getElementById('nav-calendar')?.addEventListener('click', () => {
 tg?.HapticFeedback?.impactOccurred('light');
 showScreen('calendar');
 renderCalendar(calYear, calMonth);
});

document.getElementById('nav-ai')?.addEventListener('click', () => {
 tg?.HapticFeedback?.impactOccurred('light');
 showScreen('ai');
 if (typeof window.aiOpen === 'function') window.aiOpen();
});

document.getElementById('nav-profile')?.addEventListener('click', () => {
 tg?.HapticFeedback?.impactOccurred('light');
 showScreen('profile');
 loadProfile();
});

document.getElementById('back-to-history')?.addEventListener('click', () => {
 showScreen('history');
});

detailDeleteBtn?.addEventListener('click', deleteWorkout);

document.getElementById('open-history-from-profile')?.addEventListener('click', () => {
 tg?.HapticFeedback?.impactOccurred('light');
 showScreen('history');
 loadHistory();
});

document.getElementById('open-records')?.addEventListener('click', () => {
 tg?.HapticFeedback?.impactOccurred('light');
 showScreen('records');
 loadRecords();
});

document.getElementById('back-to-profile')?.addEventListener('click', () => {
 showScreen('profile');
 loadProfile();
});

// ============ СТАРТ ============
(async () => {
 await Promise.all([
 loadMe(),
 loadExercises(),
 loadRecentWorkouts(),
 ]);
 await loadActiveWorkout();
})();
