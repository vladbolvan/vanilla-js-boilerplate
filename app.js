const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#0f172a');
  tg.setBackgroundColor('#0f172a');
}

const API_URL = 'https://dowdily-jocular-stint.cloudpub.ru';

// DOM
const screenHome = document.getElementById('screen-home');
const screenExercises = document.getElementById('screen-exercises');
const screenInput = document.getElementById('screen-input');
const bottomNav = document.getElementById('bottom-nav');
const userNameEl = document.getElementById('user-name');
const exercisesListEl = document.getElementById('exercises-list');
const searchInput = document.getElementById('exercise-search');
const exerciseTitle = document.getElementById('exercise-title');
const setsListEl = document.getElementById('sets-list');

// State
let allExercises = [];
let currentWorkoutId = null;
let currentExercise = null;
let currentSets = [];

// ============ AUTH HEADER ============
function authHeaders() {
  return { 'X-Init-Data': tg?.initData || '' };
}

// ============ МЕНЮ ============
async function loadMe() {
  const initData = tg?.initData;
  if (!initData) {
    if (userNameEl) userNameEl.textContent = 'Открой через Telegram';
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

// ============ ЭКРАНЫ ============
function showScreen(name) {
  screenHome.classList.toggle('hidden-screen', name !== 'home');
  screenExercises.classList.toggle('hidden-screen', name !== 'exercises');
  screenInput.classList.toggle('hidden-screen', name !== 'input');
  bottomNav.style.display = name === 'home' ? '' : 'none';
  window.scrollTo(0, 0);
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
    console.log('Workout started:', currentWorkoutId);
  } catch (e) {
    console.error(e);
    tg?.showAlert('Не удалось начать тренировку');
  }
}

function onExercisePick(id, name) {
  tg?.HapticFeedback?.impactOccurred('light');
  currentExercise = { id: parseInt(id), name };
  currentSets = [];
  exerciseTitle.textContent = name;
  renderSets();
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

  const weightVal = document.getElementById('input-weight').value;
  const repsVal = document.getElementById('input-reps').value;
  const weight = parseFloat(weightVal);
  const reps = parseInt(repsVal);

  if (isNaN(weight) || weight < 0) {
    tg?.showAlert('Введи вес'); return;
  }
  if (isNaN(reps) || reps < 1) {
    tg?.showAlert('Введи повторы'); return;
  }

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
    renderSets();
    tg?.HapticFeedback?.notificationOccurred('success');
    document.getElementById('input-weight').value = '';
    document.getElementById('input-reps').value = '';
    document.getElementById('input-weight').focus();
  } catch (e) {
    console.error(e);
    tg?.showAlert('Не удалось сохранить подход');
  }
}

function renderSets() {
  if (currentSets.length === 0) {
    setsListEl.innerHTML =
      '<p class="text-slate-500 text-sm py-4 text-center">Пока пусто</p>';
    return;
  }
  setsListEl.innerHTML = currentSets.map((s, i) => `
    <div class="bg-surface rounded-xl p-3 flex items-center justify-between">
      <span class="text-slate-400 text-sm">#${i + 1}</span>
      <span class="font-semibold">${s.weight} кг × ${s.reps}</span>
    </div>
  `).join('');
}

// ============ СОБЫТИЯ ============
document.getElementById('start-workout')?.addEventListener('click', async () => {
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

searchInput?.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  const filtered = !q ? allExercises : allExercises.filter(ex =>
    ex.name.toLowerCase().includes(q) || ex.muscle_group.toLowerCase().includes(q)
  );
  renderExercises(filtered);
});

// Enter на поле reps = добавить подход
document.getElementById('input-reps')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addSet();
});

loadMe();
