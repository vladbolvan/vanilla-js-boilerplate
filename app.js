// Инициализация Telegram WebApp
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();               // разворачиваем на весь экран
  tg.setHeaderColor('#0f172a');
  tg.setBackgroundColor('#0f172a');
}

// Приветствие — берём имя из Telegram
const userNameEl = document.getElementById('user-name');
const tgUser = tg?.initDataUnsafe?.user;
if (tgUser && userNameEl) {
  userNameEl.textContent = tgUser.first_name || tgUser.username || 'Гость';
}

// Кнопка «Начать тренировку»
document.getElementById('start-workout')?.addEventListener('click', () => {
  if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
  tg?.showAlert('Экран тренировки скоро появится');
});
