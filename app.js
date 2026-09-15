// ============ TELEGRAM WEBAPP INIT ============
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#0f172a');
  tg.setBackgroundColor('#0f172a');

  // Метод 1: официальные методы Telegram (Bot API 7.7+)
  if (typeof tg.disableVerticalSwipes === 'function') {
    tg.disableVerticalSwipes();
  }
  if (typeof tg.requestFullscreen === 'function') {
    tg.requestFullscreen();
  }

  // Метод 2: CSS-хак — только на мобильных
  const isMobile = ['android', 'ios', 'android_x'].includes(tg.platform);
  if (isMobile) {
    document.body.classList.add('mobile-body');
  }
}

const API_URL = 'https://dowdily-jocular-stint.cloudpub.ru';

// ============ DOM ============
const screenHome = document.getElementById('screen-home');
const screenExercises = document.getElementById('screen-exercises');
const screenInput = document.getElementById('screen-input');
const bottomNav = document.getElementById('bottom-nav');
const userNameEl = document.getElementById('user-name');
const exercisesListEl = document.getElementById('exercises-list');
const searchInput = document.getElementById('exercise-search');
const exerciseTitle = document.getElementById('exercise-title');
const setsListEl = document.getElementById('sets-list');
const startWorkoutBtn = document.getElementById('start-workout');
const recentListEl = document.getElementById('recent-list');

// ============ STATE ============
let allExercises = [];
let currentWorkoutId = null;
let currentExercise = null;
let currentSets = [];
let activeWorkout = null;

function authHeaders() {
  return { 'X-Init-Data': tg?.initData || '' };
}

// ============ ПРОФИЛЬ ============
async function loadMe() {
  if (!tg?.initData) return;
  try {
    const res = await fetch(`${API_URL}/api/me`, { headers: authHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const me = await res.json();
    if (userNameEl) userNameEl.textContent = me.first_name || me.username || 'Гость';
  } catch (e) {
    console.error(e);
  }
}

// ============ ЭКРАНЫ ============
function showScreen(name) {
  screenHome.classList.toggle('hidden-screen', name !== 'home');
  screenExercises.classList.toggle('hidden-screen', name !== 'exercises');
  screenInput.classList.toggle('hidden-screen', name !== 'input');
  bottomNav.style.display = name === 'home' ? '' : 'none';
  window.scrollTo(0, 0);
  document.getElementById('wrap')?.scrollTo(0, 0);
}

// ============ УПРАЖНЕНИЯ ============
async function loadExercises() {
  try {
    const res = await fetch(`${API_URL}/api/exercises`);
    const data = await res.json();
    allExercises = data.exercises;
    renderExercises(allExercises);
  } catch (e) {
    console.error(e);
    exercisesListEl.innerHTML =
      '<p class="text-red-400 text-center py-8">Не удалось загрузить</p>';
  }
}

function renderExercises(list) {
  if (list.length === 0) {
    exercisesListEl.innerHTML =
      '<p class="text-slate-500 text-center py-8">Ничего не найдено</p>';
    return;
  }
  const groups = {};
  for (const ex of list) {
    if (!groups[ex.muscle_group]) groups[ex.muscle_group] = [];
    groups[ex.muscle_group].push(ex);
  }
  let html = '';
  for (const [group, items] of Object.entries(groups)) {
    html += `<p class="text-xs uppercase tracking-wide text-slate-500 mt-4 mb-2">${group}</p>`;
    for (const ex of items) {
      html += `
        <button class="exercise-item w-full bg-surface hover:bg-surface2 active:scale-[0.98]
                       transition rounded-xl p-4 text-left flex items-center justify-between"
                data-id="${ex.id}" data-name="${ex.name}">
          <span class="font-medium">${ex.name}</span>
          ${ex.is_compound ? '<span class="text-xs text-accent">базовое</span>' : ''}
        </button>
      `;
    }
  }
  exercisesListEl.innerHTML = html;

  exercisesListEl.querySelectorAll('.exercise-item').forEach(btn => {
    btn.addEventListener('click', () => onExercisePick(btn.dataset.id, btn.dataset.name));
  });
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
    activeWorkout = { id: currentWorkoutId, sets: [] };
    updateStartButton();
    console.log('Workout started:', currentWorkoutId);
  } catch (e) {
    console.error(e);
    tg?.showAlert('Не удалось начать тренировку');
  }
}

async function loadActiveWorkout() {
  if (!tg?.initData) return;
  try {
    const res = await fetch(`${API_URL}/api/workouts/active`, {
      headers: authHeaders(),
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data.active) {
      currentWorkoutId = data.active.id;
      activeWorkout = data.active;
      currentSets = data.active.sets;
      updateStartButton();
      console.log('Active workout restored:', currentWorkoutId);
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

function onExercisePick(id, name) {
  tg?.HapticFeedback?.impactOccurred('light');
  currentExercise = { id: parseInt(id), name };
  const exerciseSets = currentSets.filter(s => s.exercise_id === currentExercise.id);
  exerciseTitle.textContent = name;
  renderSets(exerciseSets);
  showScreen('input');
  document.getElementById('input-weight').value = '';
  document.getElementById('input-reps').value = '';
  setTimeout(() => document.getElementById('input-weight').focus(), 100);
}

async function addSet() {
  if (!currentWorkoutId) {
    await startWorkout();
    if (!currentWorkoutId) return;
  }
  if (!currentExercise) return;

  const weight = parseFloat(document.getElementById('input-weight').value);
  const reps = parseInt(document.getElementById('input-reps').value);

  if (isNaN(weight) || weight < 0) { tg?.showAlert('Введи вес'); return; }
  if (isNaN(reps) || reps < 1) { tg?.showAlert('Введи повторы'); return; }

  try {
    const params = new URLSearchParams({
      exercise_id: currentExercise.id,
      weight: weight,
      reps: reps,
    });
    const res = await fetch(
      `${API_URL}/api/workouts/${currentWorkoutId}/sets?${params}`,
      { method: 'POST', headers: authHeaders() }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const set = await res.json();
    currentSets.push(set);
    const exerciseSets = currentSets.filter(s => s.exercise_id === currentExercise.id);
    renderSets(exerciseSets);
    tg?.HapticFeedback?.notificationOccurred('success');
    document.getElementById('input-weight').value = '';
    document.getElementById('input-reps').value = '';
    document.getElementById('input-weight').focus();
  } catch (e) {
    console.error(e);
    tg?.showAlert('Не удалось сохранить подход');
  }
}

function renderSets(sets) {
  if (!sets || sets.length === 0) {
    setsListEl.innerHTML =
      '<p class="text-slate-500 text-sm py-4 text-center">Пока пусто</p>';
    return;
  }
  setsListEl.innerHTML = sets.map((s, i) => `
    <div class="bg-surface rounded-xl p-3 flex items-center justify-between">
      <span class="text-slate-400 text-sm">#${i + 1}</span>
      <span class="font-semibold">${s.weight} кг × ${s.reps}</span>
    </div>
  `).join('');
}

async function finishWorkout() {
  if (!currentWorkoutId) return;

  const ok = await new Promise(resolve => {
    if (tg?.showConfirm) {
      tg.showConfirm('Завершить тренировку?', (yes) => resolve(yes));
    } else {
      resolve(confirm('Завершить тренировку?'));
    }
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
    activeWorkout = null;
    currentSets = [];
    currentExercise = null;
    updateStartButton();
    await loadRecentWorkouts();
    showScreen('home');
  } catch (e) {
    console.error(e);
    tg?.showAlert('Не удалось завершить');
  }
}

// ============ ИСТОРИЯ ============
async function loadRecentWorkouts() {
  if (!tg?.initData) return;
  try {
    const res = await fetch(`${API_URL}/api/workouts`, { headers: authHeaders() });
    if (!res.ok) return;
    const data = await res.json();
    renderRecent(data.workouts);
  } catch (e) {
    console.error(e);
  }
}

function renderRecent(workouts) {
  if (!recentListEl) return;
  if (!workouts || workouts.length === 0) {
    recentListEl.innerHTML =
      '<p class="text-slate-500 text-sm py-4 text-center">Пока нет тренировок</p>';
    return;
  }

  recentListEl.innerHTML = workouts.slice(0, 3).map(w => {
    const date = w.finished_at ? new Date(w.finished_at) : new Date(w.started_at);
    const dateStr = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    const exIds = new Set(w.sets.map(s => s.exercise_id));
    const preview = w.sets.length > 0
      ? `${w.sets.length} подходов · ${exIds.size} упражн.`
      : 'Без подходов';
    return `
      <div class="bg-surface rounded-xl p-4 flex items-center justify-between">
        <div>
          <p class="font-medium">Тренировка</p>
          <p class="text-sm text-slate-400">${preview}</p>
        </div>
        <span class="text-slate-500 text-sm">${dateStr}</span>
      </div>
    `;
  }).join('');
}

// ============ СОБЫТИЯ ============
startWorkoutBtn?.addEventListener('click', async () => {
  tg?.HapticFeedback?.impactOccurred('medium');
  if (!currentWorkoutId) await startWorkout();
  showScreen('exercises');
  if (allExercises.length === 0) loadExercises();
});

document.getElementById('back-to-home')?.addEventListener('click', () => {
  showScreen('home');
});

document.getElementById('back-to-exercises')?.addEventListener('click', () => {
  showScreen('exercises');
});

document.getElementById('add-set')?.addEventListener('click', addSet);
document.getElementById('finish-workout')?.addEventListener('click', finishWorkout);

searchInput?.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  const filtered = !q ? allExercises : allExercises.filter(ex =>
    ex.name.toLowerCase().includes(q) || ex.muscle_group.toLowerCase().includes(q)
  );
  renderExercises(filtered);
});

document.getElementById('input-reps')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addSet();
});

// ============ СТАРТ ============
(async () => {
  await loadMe();
  await loadActiveWorkout();
  await loadRecentWorkouts();
})();
