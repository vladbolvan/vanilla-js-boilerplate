// ============ TELEGRAM WEBAPP ============
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#0f172a');
  tg.setBackgroundColor('#0f172a');
}

const API_URL = 'https://dowdily-jocular-stint.cloudpub.ru';

// ============ ЭЛЕМЕНТЫ ============
const screenHome = document.getElementById('screen-home');
const screenExercises = document.getElementById('screen-exercises');
const bottomNav = document.getElementById('bottom-nav');
const userNameEl = document.getElementById('user-name');
const exercisesListEl = document.getElementById('exercises-list');
const searchInput = document.getElementById('exercise-search');

// ============ ЗАГРУЗКА ПРОФИЛЯ ============
async function loadMe() {
  const initData = tg?.initData;
  if (!initData) {
    if (userNameEl) userNameEl.textContent = 'Открой через Telegram';
    return;
  }
  try {
    const res = await fetch(`${API_URL}/api/me`, {
      headers: { 'X-Init-Data': initData },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const me = await res.json();
    if (userNameEl) userNameEl.textContent = me.first_name || me.username || 'Гость';
  } catch (e) {
    console.error(e);
    if (userNameEl) userNameEl.textContent = 'Ошибка загрузки';
  }
}

// ============ ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ ============
function showScreen(name) {
  if (name === 'home') {
    screenHome.classList.remove('hidden-screen');
    screenExercises.classList.add('hidden-screen');
    bottomNav.style.display = '';
  } else if (name === 'exercises') {
    screenHome.classList.add('hidden-screen');
    screenExercises.classList.remove('hidden-screen');
    bottomNav.style.display = 'none';
  }
  window.scrollTo(0, 0);
}

// ============ СПИСОК УПРАЖНЕНИЙ ============
let allExercises = [];

async function loadExercises() {
  try {
    const res = await fetch(`${API_URL}/api/exercises`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
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

  // Группируем по muscle_group
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

  // Обработчик на каждое упражнение
  exercisesListEl.querySelectorAll('.exercise-item').forEach(btn => {
    btn.addEventListener('click', () => {
      tg?.HapticFeedback?.impactOccurred('light');
      tg?.showAlert(`Выбрано: ${btn.dataset.name}`);
    });
  });
}

// ============ ПОИСК ============
searchInput?.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  if (!q) {
    renderExercises(allExercises);
    return;
  }
  const filtered = allExercises.filter(ex =>
    ex.name.toLowerCase().includes(q) ||
    ex.muscle_group.toLowerCase().includes(q)
  );
  renderExercises(filtered);
});

// ============ КНОПКИ ============
document.getElementById('start-workout')?.addEventListener('click', () => {
  tg?.HapticFeedback?.impactOccurred('medium');
  showScreen('exercises');
  if (allExercises.length === 0) loadExercises();
});

document.getElementById('back-to-home')?.addEventListener('click', () => {
  showScreen('home');
});

// ============ СТАРТ ============
loadMe();
