// ============ TELEGRAM WEBAPP INIT ============
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#0a0a0f');
  tg.setBackgroundColor('#0a0a0f');

  if (typeof tg.disableVerticalSwipes === 'function') tg.disableVerticalSwipes();
  if (typeof tg.requestFullscreen === 'function') tg.requestFullscreen();

  const offset = tg.isFullscreen ? '16px' : '56px';
  document.documentElement.style.setProperty('--safe-top-offset', offset);

  const isMobile = ['android', 'ios', 'android_x'].includes(tg.platform);
  if (isMobile) document.body.classList.add('mobile-body');
}

const API_URL = 'https://gymlyvlad.duckdns.org';

// ============ DOM ============
const screenHome = document.getElementById('screen-home');
const screenWorkout = document.getElementById('screen-workout');
const screenHistory = document.getElementById('screen-history');
const screenWorkoutDetail = document.getElementById('screen-workout-detail');
const screenProfile = document.getElementById('screen-profile');
const screenRecords = document.getElementById('screen-records');

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
const startWorkoutBtn = document.getElementById('start-workout');

// Bottom sheet
const sheetBackdrop = document.getElementById('sheet-backdrop');
const sheetContent = document.getElementById('sheet-content');
const sheetCloseBtn = document.getElementById('sheet-close');
const exercisesPickerEl = document.getElementById('exercises-picker');
const searchInput = document.getElementById('exercise-search');

// Rest timer
const restTimerEl = document.getElementById('rest-timer');
const restProgressEl = document.getElementById('rest-progress');
const restTimeEl = document.getElementById('rest-time');
const restSkipBtn = document.getElementById('rest-skip');

// Profile
const profileNameEl = document.getElementById('profile-name');
const profileUsernameEl = document.getElementById('profile-username');
const statStreakEl = document.getElementById('stat-streak');
const statWorkoutsEl = document.getElementById('stat-workouts');
const statSetsEl = document.getElementById('stat-sets');
const statVolumeEl = document.getElementById('stat-volume');
const streakHintEl = document.getElementById('streak-hint');
const recordsListEl = document.getElementById('records-list');

// ============ STATE ============
let allExercises = [];
let currentWorkoutId = null;
let currentWorkoutStartedAt = null;
let workoutExercises = [];
let allWorkouts = [];

// Таймеры
let workoutTimerInterval = null;
let restTimerInterval = null;
const REST_DURATION = 120; // секунд

function authHeaders() {
  return { 'X-Init-Data': tg?.initData || '' };
}

// ============ ЭКРАНЫ ============
function showScreen(name) {
  screenHome.classList.toggle('hidden-screen', name !== 'home');
  screenWorkout.classList.toggle('hidden-screen', name !== 'workout');
  screenHistory.classList.toggle('hidden-screen', name !== 'history');
  screenWorkoutDetail.classList.toggle('hidden-screen', name !== 'workout-detail');
  screenProfile.classList.toggle('hidden-screen', name !== 'profile');
  screenRecords.classList.toggle('hidden-screen', name !== 'records');

  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('nav-' + name)?.classList.add('active');

  document.getElementById('wrap')?.scrollTo(0, 0);
}

// ============ ИМЯ В ШАПКЕ ============
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
  } catch (e) {
    console.error(e);
    if (userNameEl) userNameEl.textContent = 'Ошибка загрузки';
  }
}

// ============ ГЛАВНАЯ ============
async function loadRecentWorkouts() {
  if (!tg?.initData) return;
  try {
    const res = await fetch(`${API_URL}/api/workouts`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderRecent(data.workouts);
  } catch (e) {
    console.error('loadRecentWorkouts', e);
    if (recentListEl) {
      recentListEl.innerHTML =
        '<p class="text-red-400 text-sm py-4 text-center">Ошибка: ' + e.message + '</p>';
    }
  }
}

function renderRecent(workouts) {
  if (!recentListEl) return;
  if (!workouts || workouts.length === 0) {
    recentListEl.innerHTML =
      '<p class="text-muted text-sm py-4 text-center">Пока нет тренировок</p>';
    return;
  }
  recentListEl.innerHTML = workouts.slice(0, 3).map(w => {
    const date = new Date(w.finished_at || w.started_at);
    const dateStr = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    const exNames = (w.exercises || []).map(e => e.exercise_name).join(', ');
    const preview = w.total_sets
      ? `${w.total_sets} подх. · ${exNames || 'без упражнений'}`
      : 'Без подходов';
    return `
      <div class="bg-surface rounded-2xl p-4 border border-white/5 card-shadow flex items-center justify-between gap-2">
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
    const res = await fetch(`${API_URL}/api/exercises`);
    const data = await res.json();
    allExercises = data.exercises;
    localStorage.setItem('exercises_cache', JSON.stringify(allExercises));
    renderExercisesPicker(allExercises);
  } catch (e) {
    if (!cached) {
      console.error(e);
      exercisesPickerEl.innerHTML =
        '<p class="text-red-400 text-center py-4 text-sm">Не удалось загрузить</p>';
    }
  }
}

function renderExercisesPicker(list) {
  if (list.length === 0) {
    exercisesPickerEl.innerHTML =
      '<p class="text-muted text-center py-4 text-sm">Ничего не найдено</p>';
    return;
  }
  const inWorkoutIds = new Set(workoutExercises.map(e => e.id));
  const available = list.filter(ex => !inWorkoutIds.has(ex.id));

  if (available.length === 0) {
    exercisesPickerEl.innerHTML =
      '<p class="text-muted text-center py-4 text-sm">Все упражнения добавлены</p>';
    return;
  }

  const groups = {};
  for (const ex of available) {
    if (!groups[ex.muscle_group]) groups[ex.muscle_group] = [];
    groups[ex.muscle_group].push(ex);
  }
  let html = '';
  for (const [group, items] of Object.entries(groups)) {
    html += `<p class="text-xs uppercase tracking-wider text-muted mt-3 mb-2">${group}</p>`;
    for (const ex of items) {
      html += `
        <button class="exercise-pick w-full bg-surface hover:bg-surface2 active:scale-[0.98]
                       transition rounded-2xl px-4 py-3.5 text-left flex items-center justify-between gap-2
                       border border-white/5"
                data-id="${ex.id}" data-name="${ex.name}">
          <span class="font-medium text-sm break-words min-w-0 text-left">${ex.name}</span>
          <span class="text-primary text-xl leading-none shrink-0 font-light">+</span>
        </button>
      `;
    }
  }
  exercisesPickerEl.innerHTML = html;

  exercisesPickerEl.querySelectorAll('.exercise-pick').forEach(btn => {
    btn.addEventListener('click', () => {
      addExerciseToWorkout(parseInt(btn.dataset.id), btn.dataset.name);
      closeSheet();
    });
  });
}

// ============ BOTTOM SHEET ============
function openSheet() {
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

// ============ ТАЙМЕР ТРЕНИРОВКИ ============
function startWorkoutTimer(startedAtISO) {
  stopWorkoutTimer();
  if (!startedAtISO) {
    if (workoutTimerEl) workoutTimerEl.textContent = '';
    return;
  }
  currentWorkoutStartedAt = new Date(startedAtISO);
  tickWorkoutTimer();
  workoutTimerInterval = setInterval(tickWorkoutTimer, 1000);
}

function stopWorkoutTimer() {
  if (workoutTimerInterval) {
    clearInterval(workoutTimerInterval);
    workoutTimerInterval = null;
  }
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
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ============ ТАЙМЕР ОТДЫХА ============
function startRestTimer() {
  stopRestTimer();
  let remaining = REST_DURATION;

  restTimerEl.classList.remove('hidden');
  requestAnimationFrame(() => {
    restTimerEl.classList.remove('translate-y-full');
  });

  updateRestUI(remaining);

  restTimerInterval = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      stopRestTimer(true);
      return;
    }
    updateRestUI(remaining);
  }, 1000);
}

function updateRestUI(remaining) {
  if (restTimeEl) restTimeEl.textContent = formatDuration(remaining);
  if (restProgressEl) {
    const pct = (remaining / REST_DURATION) * 100;
    restProgressEl.style.width = pct + '%';
  }
}

function stopRestTimer(notify = false) {
  if (restTimerInterval) {
    clearInterval(restTimerInterval);
    restTimerInterval = null;
  }
  if (restTimerEl) {
    restTimerEl.classList.add('translate-y-full');
    setTimeout(() => restTimerEl.classList.add('hidden'), 250);
  }
  if (notify) {
    tg?.HapticFeedback?.notificationOccurred('success');
  }
}

// ============ ТРЕНИРОВКА ============
async function startWorkout() {
  try {
    const res = await fetch(`${API_URL}/api/workouts`, {
      method: 'POST',
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    currentWorkoutId = data.workout_id;
    startWorkoutTimer(data.started_at);
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

      const map = {};
      for (const s of data.active.sets) {
        if (!map[s.exercise_id]) {
          map[s.exercise_id] = { id: s.exercise_id, name: '', sets: [] };
        }
        map[s.exercise_id].sets.push(s);
      }
      workoutExercises = Object.values(map);

      for (const we of workoutExercises) {
        const found = allExercises.find(ex => ex.id === we.id);
        if (found) we.name = found.name;
      }
      updateStartButton();
      renderWorkoutExercises();
      updateWorkoutUI();
    }
  } catch (e) {
    console.error(e);
  }
}

function updateStartButton() {
  if (!startWorkoutBtn) return;
  const titleEl = startWorkoutBtn.querySelector('.start-title');
  const subtitleEl = startWorkoutBtn.querySelector('.start-subtitle');
  const iconEl = startWorkoutBtn.querySelector('.start-icon');

  if (currentWorkoutId) {
    if (subtitleEl) subtitleEl.textContent = 'Продолжить';
    if (titleEl) titleEl.textContent = 'Тренировка идёт';
    if (iconEl) iconEl.textContent = '⏵';
  } else {
    if (subtitleEl) subtitleEl.textContent = 'Новая сессия';
    if (titleEl) titleEl.textContent = 'Начать тренировку';
    if (iconEl) iconEl.textContent = '🏋️';
  }
}

function addExerciseToWorkout(id, name) {
  tg?.HapticFeedback?.impactOccurred('light');
  if (workoutExercises.some(e => e.id === id)) return;
  workoutExercises.push({ id, name, sets: [], lastWeight: null, lastReps: null });
  renderWorkoutExercises();
  updateWorkoutUI();
  // Подтягиваем прошлые веса
  fillLastSet(id);
}

async function fillLastSet(exerciseId) {
  try {
    const res = await fetch(`${API_URL}/api/exercises/${exerciseId}/last-set`, {
      headers: authHeaders(),
    });
    if (!res.ok) return;
    const data = await res.json();
    const we = workoutExercises.find(e => e.id === exerciseId);
    if (!we) return;
    we.lastWeight = data.weight;
    we.lastReps = data.reps;

    // Найти карточку и заполнить inputs
    const card = workoutExercisesEl.querySelector(`[data-ex-id="${exerciseId}"]`);
    if (!card) return;
    const weightInput = card.querySelector('.set-weight');
    const repsInput = card.querySelector('.set-reps');
    if (weightInput && data.weight != null) weightInput.value = data.weight;
    if (repsInput && data.reps != null) repsInput.value = data.reps;
  } catch (e) {
    console.error('fillLastSet', e);
  }
}

function removeExerciseFromWorkout(id) {
  workoutExercises = workoutExercises.filter(e => e.id !== id);
  renderWorkoutExercises();
  updateWorkoutUI();
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

  workoutExercisesEl.innerHTML = workoutExercises.map(ex => `
    <div class="bg-surface rounded-2xl p-4 overflow-hidden border border-white/5 card-shadow" data-ex-id="${ex.id}">
      <div class="flex items-start justify-between gap-2 mb-3">
        <p class="font-semibold break-words min-w-0 flex-1">${ex.name}</p>
        <button class="remove-ex text-muted text-xs hover:text-red-400 shrink-0"
                data-ex-id="${ex.id}">удалить</button>
      </div>

      <div class="sets-container space-y-1.5 mb-3" data-ex-id="${ex.id}"></div>

      <div class="flex gap-2 items-stretch">
        <input type="number" step="0.5" min="0" inputmode="decimal"
               placeholder="Вес"
               class="set-weight flex-1 min-w-0 bg-surface2 rounded-xl px-3 py-2.5 text-white text-center
                      focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
               data-ex-id="${ex.id}">
        <input type="number" min="1" inputmode="numeric"
               placeholder="Повт"
               class="set-reps flex-1 min-w-0 bg-surface2 rounded-xl px-3 py-2.5 text-white text-center
                      focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
               data-ex-id="${ex.id}">
        <button class="add-set-btn bg-accent hover:bg-green-500 active:scale-95 transition
                       rounded-xl w-12 shrink-0 font-bold text-black/80"
                data-ex-id="${ex.id}">+</button>
      </div>
    </div>
  `).join('');

  workoutExercises.forEach(ex => {
    renderSetsForExercise(ex.id, ex.sets);
  });

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

  if (!sets || sets.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = sets.map((s, i) => `
    <div class="set-row flex items-center justify-between text-sm py-1" data-set-id="${s.id}">
      <span class="text-muted text-xs">#${i + 1}</span>
      <span><b>${s.weight}</b> кг × <b>${s.reps}</b></span>
    </div>
  `).join('');
}

async function addSetInline(exerciseId) {
  const card = workoutExercisesEl.querySelector(`[data-ex-id="${exerciseId}"]`);
  if (!card) return;

  const weightInput = card.querySelector('.set-weight');
  const repsInput = card.querySelector('.set-reps');
  const weight = parseFloat(weightInput.value);
  const reps = parseInt(repsInput.value);

  if (isNaN(weight) || weight < 0) { tg?.showAlert('Введи вес'); return; }
  if (isNaN(reps) || reps < 1) { tg?.showAlert('Введи повторы'); return; }

  const we = workoutExercises.find(e => e.id === exerciseId);
  if (!we) return;

  const tempId = 'temp_' + Date.now();
  const optimisticSet = {
    id: tempId,
    exercise_id: exerciseId,
    set_number: we.sets.length + 1,
    weight: weight,
    reps: reps,
  };
  we.sets.push(optimisticSet);

  renderSetsForExercise(exerciseId, we.sets);

  // НЕ очищаем значения — оставляем для следующего подхода
  // Но убираем фокус с reps (пользователь уже нажал +)
  repsInput.blur();
  tg?.HapticFeedback?.notificationOccurred('success');

  if (!currentWorkoutId) {
    await startWorkout();
    if (!currentWorkoutId) {
      we.sets = we.sets.filter(s => s.id !== tempId);
      renderSetsForExercise(exerciseId, we.sets);
      tg?.showAlert('Не удалось начать тренировку');
      return;
    }
  }

  try {
    const params = new URLSearchParams({
      exercise_id: exerciseId,
      weight: weight,
      reps: reps,
    });
    const res = await fetch(
      `${API_URL}/api/workouts/${currentWorkoutId}/sets?${params}`,
      { method: 'POST', headers: authHeaders() }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const realSet = await res.json();

    const idx = we.sets.findIndex(s => s.id === tempId);
    if (idx !== -1) we.sets[idx] = realSet;
    renderSetsForExercise(exerciseId, we.sets);

    // Запускаем таймер отдыха
    startRestTimer();

    if (realSet.record) {
      const r = realSet.record;
      setTimeout(() => {
        if (r.is_first) {
          tg?.showAlert(
            `🏆 Первый рекорд!\n\n${r.exercise_name}\n${r.weight} кг × ${r.reps}\nРасчётный 1RM: ${r.estimated_1rm} кг`
          );
        } else {
          tg?.showAlert(
            `🎉 Новый рекорд!\n\n${r.exercise_name}\n${r.weight} кг × ${r.reps}\n+${r.improvement} кг к 1RM`
          );
        }
      }, 350);
    }
  } catch (e) {
    console.error(e);
    we.sets = we.sets.filter(s => s.id !== tempId);
    renderSetsForExercise(exerciseId, we.sets);
    tg?.showAlert('Не удалось сохранить подход');
  }
}

async function finishWorkout() {
  if (!currentWorkoutId) return;
  const ok = await new Promise(resolve => {
    if (tg?.showConfirm) tg.showConfirm('Завершить тренировку?', (yes) => resolve(yes));
    else resolve(confirm('Завершить тренировку?'));
  });
  if (!ok) return;

  try {
    const res = await fetch(
      `${API_URL}/api/workouts/${currentWorkoutId}/finish`,
      { method: 'PATCH', headers: authHeaders() }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    tg?.HapticFeedback?.notificationOccurred('success');
    currentWorkoutId = null;
    workoutExercises = [];
    stopWorkoutTimer();
    stopRestTimer();
    updateStartButton();
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
    historyListEl.innerHTML = '<p class="text-muted text-center py-8">Пока нет тренировок</p>';
    return;
  }
  historyListEl.innerHTML = workouts.map(w => {
    const date = new Date(w.finished_at || w.started_at);
    const dateStr = date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' });
    const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const exNames = (w.exercises || []).map(e => e.exercise_name).join(', ');
    return `
      <button class="workout-item w-full bg-surface hover:bg-surface2 active:scale-[0.98]
                     transition rounded-2xl p-4 text-left overflow-hidden border border-white/5 card-shadow"
              data-id="${w.id}">
        <div class="flex items-start justify-between gap-2 mb-2">
          <div class="min-w-0">
            <p class="font-semibold">${dateStr}</p>
            <p class="text-xs text-muted mt-0.5">${timeStr}</p>
          </div>
          <span class="text-xs text-muted bg-surface2 rounded-full px-2.5 py-1 shrink-0">
            ${w.total_sets || 0} подх.
          </span>
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
  if (!workout) return;
  tg?.HapticFeedback?.impactOccurred('light');

  const date = new Date(workout.finished_at || workout.started_at);
  detailTitleEl.textContent = date.toLocaleDateString('ru-RU', {
    day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit',
  });

  if (!workout.exercises || workout.exercises.length === 0) {
    detailContentEl.innerHTML =
      '<p class="text-muted text-center py-8">В тренировке не было подходов</p>';
  } else {
    detailContentEl.innerHTML = workout.exercises.map(ex => `
      <div class="bg-surface rounded-2xl p-4 overflow-hidden border border-white/5 card-shadow">
        <p class="font-semibold mb-3 break-words">${ex.exercise_name}</p>
        <div class="space-y-1.5">
          ${ex.sets.map((s, i) => `
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted text-xs">#${i + 1}</span>
              <span><b>${s.weight}</b> кг × <b>${s.reps}</b></span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }
  showScreen('workout-detail');
}

// ============ ПРОФИЛЬ ============
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
    const res = await fetch(`${API_URL}/api/profile/stats`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const stats = await res.json();

    statStreakEl.textContent = stats.streak;
    statWorkoutsEl.textContent = stats.workouts_count;
    statSetsEl.textContent = stats.sets_count;

    const kg = stats.total_volume_kg;
    if (kg < 1000) {
      statVolumeEl.textContent = `${Math.round(kg)} кг`;
    } else {
      statVolumeEl.textContent = `${(kg / 1000).toFixed(1)} т`;
    }

    if (stats.streak === 0 && stats.workouts_count > 0) {
      streakHintEl.textContent = 'Тренируйся, чтобы начать стрик!';
    } else if (stats.streak === 0) {
      streakHintEl.textContent = 'Сделай первую тренировку';
    } else if (stats.streak === 1) {
      streakHintEl.textContent = 'Начало положено. Продолжай завтра!';
    } else {
      streakHintEl.textContent = 'Не разрывай серию! Тренируйся и завтра';
    }
  } catch (e) {
    console.error(e);
    statStreakEl.textContent = '?';
    statWorkoutsEl.textContent = '?';
    statSetsEl.textContent = '?';
    statVolumeEl.textContent = '?';
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
    recordsListEl.innerHTML =
      '<p class="text-muted text-center py-8">Пока нет рекордов.<br>Добавь подход — и он появится здесь.</p>';
    return;
  }

  const groups = {};
  for (const r of records) {
    if (!groups[r.muscle_group]) groups[r.muscle_group] = [];
    groups[r.muscle_group].push(r);
  }

  let html = '';
  for (const [group, items] of Object.entries(groups)) {
    html += `<p class="text-xs uppercase tracking-wider text-muted mt-4 mb-2">${group}</p>`;
    for (const r of items) {
      const date = new Date(r.achieved_at);
      const dateStr = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
      html += `
        <div class="bg-surface rounded-2xl p-4 border border-white/5 card-shadow mb-2">
          <div class="flex items-start justify-between gap-2 mb-2">
            <p class="font-semibold break-words min-w-0 flex-1">${r.exercise_name}</p>
            <span class="text-xs text-muted shrink-0">${dateStr}</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm"><b>${r.weight}</b> кг × <b>${r.reps}</b></span>
            <span class="text-xs bg-primary/15 text-primary2 rounded-full px-2.5 py-1 font-medium">
              1RM ≈ ${r.estimated_1rm} кг
            </span>
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

  if (!currentWorkoutId) {
    startWorkoutBtn.style.opacity = '0.6';
    await startWorkout();
    startWorkoutBtn.style.opacity = '1';
  }
  updateStartButton();
  updateWorkoutUI();
  renderWorkoutExercises();
  showScreen('workout');
  if (allExercises.length === 0) await loadExercises();
});

document.getElementById('workout-back')?.addEventListener('click', () => {
  showScreen('home');
  updateStartButton();
});

finishWorkoutBtn?.addEventListener('click', finishWorkout);

addExerciseBtn?.addEventListener('click', () => {
  renderExercisesPicker(allExercises);
  openSheet();
});

sheetCloseBtn?.addEventListener('click', closeSheet);
sheetBackdrop?.addEventListener('click', (e) => {
  if (e.target === sheetBackdrop) closeSheet();
});

restSkipBtn?.addEventListener('click', () => {
  stopRestTimer(true);
});

searchInput?.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  const filtered = !q ? allExercises : allExercises.filter(ex =>
    ex.name.toLowerCase().includes(q) || ex.muscle_group.toLowerCase().includes(q)
  );
  renderExercisesPicker(filtered);
});

document.getElementById('nav-home')?.addEventListener('click', () => {
  tg?.HapticFeedback?.impactOccurred('light');
  showScreen('home');
  updateStartButton();
});

document.getElementById('nav-history')?.addEventListener('click', () => {
  tg?.HapticFeedback?.impactOccurred('light');
  showScreen('history');
  loadHistory();
});

document.getElementById('nav-profile')?.addEventListener('click', () => {
  tg?.HapticFeedback?.impactOccurred('light');
  showScreen('profile');
  loadProfile();
});

document.getElementById('back-to-history')?.addEventListener('click', () => {
  showScreen('history');
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
