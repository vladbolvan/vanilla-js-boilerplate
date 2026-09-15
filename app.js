const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#0f172a');
  tg.setBackgroundColor('#0f172a');
}

const API_URL = 'https://dowdily-jocular-stint.cloudpub.ru';

const userNameEl = document.getElementById('user-name');

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

loadMe();

document.getElementById('start-workout')?.addEventListener('click', () => {
  tg?.HapticFeedback?.impactOccurred('medium');
  tg?.showAlert('Экран тренировки скоро появится');
});
