// js/reminders.js
// Расширенные напоминания: тренировка / вода / сон / еда.
// Подключается после app.js. Использует глобальные функции:
// tg, API_URL, authHeaders, utcToLocalHHMM, localToUtcHHMM.

(function () {
  'use strict';

  console.log('[reminders] loaded');

  // --- DOM карточки ---
  const card = document.getElementById('reminders-card');
  const list = document.getElementById('reminders-list');
  const openBtn = document.getElementById('reminders-open-btn');

  // --- DOM шторки ---
  const backdrop = document.getElementById('full-reminders-backdrop');
  const panel = document.getElementById('full-reminders-panel');
  const closeBtn = document.getElementById('full-reminders-close');
  const saveBtn = document.getElementById('full-reminders-save');

  // --- Поля формы ---
  const trToggle = document.getElementById('rt-training-toggle');
  const trTime = document.getElementById('rt-training-time');
  const waToggle = document.getElementById('rt-water-toggle');
  const waStart = document.getElementById('rt-water-start');
  const waEnd = document.getElementById('rt-water-end');
  const waIntervalInput = document.getElementById('rt-water-interval');
  const slToggle = document.getElementById('rt-sleep-toggle');
  const slTime = document.getElementById('rt-sleep-time');
  const fdToggle = document.getElementById('rt-food-toggle');
  const fdB = document.getElementById('rt-food-breakfast');
  const fdL = document.getElementById('rt-food-lunch');
  const fdD = document.getElementById('rt-food-dinner');

  if (!card) return; // старая версия index.html — не работаем

  // SVG-иконки в общем стиле приложения (stroke 1.8, round)
  const ICONS = {
    training: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5v11"/><path d="M17.5 6.5v11"/><path d="M3 9v6"/><path d="M21 9v6"/><path d="M6.5 12h11"/></svg>',
    water: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c0 0-6 6.7-6 11a6 6 0 1 0 12 0c0-4.3-6-11-6-11z"/></svg>',
    sleep: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 14.5A8.5 8.5 0 1 1 11.5 3.5a6.5 6.5 0 0 0 9 11z"/></svg>',
    food: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7.5c-1.5-1.2-3-2-4.5-2C4.5 5.5 2.5 8 2.5 11c0 4.5 3 9 6.5 9 1 0 2-.4 3-.4s2 .4 3 .4c3.5 0 6.5-4.5 6.5-9 0-3-2-5.5-5-5.5-1.5 0-3 .8-4.5 2z"/><path d="M12 7.5v-3.2"/><path d="M12 4.3c.5-1 1.5-1.8 2.8-1.8"/></svg>',
  };

  let localProfile = null;

  // --- UTC ↔ local HH:MM через функции из app.js ---
  function toLocal(hhmm) {
    if (!hhmm) return null;
    if (typeof utcToLocalHHMM === 'function') return utcToLocalHHMM(hhmm);
    return hhmm;
  }
  function toUtc(hhmm) {
    if (!hhmm) return null;
    if (typeof localToUtcHHMM === 'function') return localToUtcHHMM(hhmm);
    return hhmm;
  }

  // --- Рендер карточки ---
  function renderCard(p) {
    localProfile = p || {};
    if (!list) return;

    const items = [
      {
        icon: ICONS.training,
        label: 'Тренировка',
        enabled: !!p?.reminder_enabled,
        detail: p?.reminder_time ? toLocal(p.reminder_time) : null,
      },
      {
        icon: ICONS.water,
        label: 'Вода',
        enabled: !!p?.water_enabled,
        detail: (p?.water_start_time && p?.water_end_time)
          ? toLocal(p.water_start_time) + '–' + toLocal(p.water_end_time)
          : null,
      },
      {
        icon: ICONS.sleep,
        label: 'Сон',
        enabled: !!p?.sleep_enabled,
        detail: p?.sleep_time ? toLocal(p.sleep_time) : null,
      },
      {
        icon: ICONS.food,
        label: 'Еда',
        enabled: !!p?.food_enabled,
        detail: p?.food_enabled
          ? [toLocal(p.food_breakfast), toLocal(p.food_lunch), toLocal(p.food_dinner)]
              .filter(Boolean)
              .join(' · ')
          : null,
      },
    ];

    list.innerHTML = items.map(function (r) {
      const iconCls = r.enabled ? 'text-primary2' : 'text-muted2';
      const statusCls = r.enabled
        ? 'text-primary2/90 bg-primary/[0.08] border border-primary/15'
        : 'text-muted2/70 bg-white/[0.02] border border-white/[0.06]';
      return ''
        + '<div class="flex items-center justify-between gap-3 py-3">'
        +   '<div class="flex items-center gap-3 min-w-0 flex-1">'
        +     '<span class="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.05] shrink-0 ' + iconCls + '">' + r.icon + '</span>'
        +     '<div class="min-w-0 flex-1">'
        +       '<p class="text-sm font-medium truncate text-white/90">' + r.label + '</p>'
        +       (r.detail ? '<p class="text-[11px] text-muted2 mt-0.5 truncate">' + r.detail + '</p>' : '')
        +     '</div>'
        +   '</div>'
        +   '<span class="text-[10px] uppercase tracking-wider ' + statusCls + ' rounded-full px-2.5 py-1 shrink-0 font-medium">'
        +     (r.enabled ? 'вкл' : 'выкл')
        +   '</span>'
        + '</div>';
    }).join('');
  }

  // --- Чипы интервала воды ---
  function updateIntervalChips(active) {
    document.querySelectorAll('#rt-water-intervals .rt-int').forEach(function (btn) {
      const a = String(btn.dataset.interval) === String(active);
      btn.classList.toggle('bg-primary', a);
      btn.classList.toggle('text-white', a);
      btn.classList.toggle('border-primary', a);
      btn.classList.toggle('bg-surface2', !a);
      btn.classList.toggle('text-muted', !a);
      btn.classList.toggle('border-white/5', !a);
    });
  }

  // --- Открытие / закрытие шторки ---
  function openSheet() {
    const p = localProfile || {};

    if (trToggle) trToggle.checked = !!p.reminder_enabled;
    if (trTime) trTime.value = p.reminder_time ? toLocal(p.reminder_time) : '18:00';

    if (waToggle) waToggle.checked = !!p.water_enabled;
    if (waStart) waStart.value = p.water_start_time ? toLocal(p.water_start_time) : '10:00';
    if (waEnd) waEnd.value = p.water_end_time ? toLocal(p.water_end_time) : '22:00';
    const wi = p.water_interval_hours || 2;
    if (waIntervalInput) waIntervalInput.value = String(wi);
    updateIntervalChips(wi);

    if (slToggle) slToggle.checked = !!p.sleep_enabled;
    if (slTime) slTime.value = p.sleep_time ? toLocal(p.sleep_time) : '23:00';

    if (fdToggle) fdToggle.checked = !!p.food_enabled;
    if (fdB) fdB.value = p.food_breakfast ? toLocal(p.food_breakfast) : '08:00';
    if (fdL) fdL.value = p.food_lunch ? toLocal(p.food_lunch) : '13:00';
    if (fdD) fdD.value = p.food_dinner ? toLocal(p.food_dinner) : '19:00';

    backdrop.classList.remove('hidden');
    requestAnimationFrame(function () {
      backdrop.classList.remove('opacity-0');
      panel.classList.remove('translate-y-full');
    });
    tg?.HapticFeedback?.impactOccurred('light');
  }

  function closeSheet() {
    backdrop.classList.add('opacity-0');
    panel.classList.add('translate-y-full');
    setTimeout(function () { backdrop.classList.add('hidden'); }, 250);
    tg?.HapticFeedback?.impactOccurred('light');
  }

  // --- Сохранение ---
  async function save() {
    const payload = {
      reminder_enabled: trToggle ? trToggle.checked : false,
      reminder_time: toUtc(trTime ? trTime.value : null),
      water_enabled: waToggle ? waToggle.checked : false,
      water_start_time: toUtc(waStart ? waStart.value : null),
      water_end_time: toUtc(waEnd ? waEnd.value : null),
      water_interval_hours: parseInt((waIntervalInput ? waIntervalInput.value : '2') || '2', 10),
      sleep_enabled: slToggle ? slToggle.checked : false,
      sleep_time: toUtc(slTime ? slTime.value : null),
      food_enabled: fdToggle ? fdToggle.checked : false,
      food_breakfast: toUtc(fdB ? fdB.value : null),
      food_lunch: toUtc(fdL ? fdL.value : null),
      food_dinner: toUtc(fdD ? fdD.value : null),
    };

    if (saveBtn) saveBtn.style.opacity = '0.6';
    try {
      const res = await fetch(API_URL + '/api/me', {
        method: 'PATCH',
        headers: Object.assign({}, authHeaders(), { 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const updated = await res.json();
      renderCard(updated);
      closeSheet();
      tg?.HapticFeedback?.notificationOccurred('success');
    } catch (e) {
      console.error(e);
      tg?.showAlert('Не удалось сохранить');
    } finally {
      if (saveBtn) saveBtn.style.opacity = '1';
    }
  }

  // --- Перехватываем рендер из app.js ---
  // app.js вызывает renderReminderCard(currentProfile) в loadProfile().
  // Заменяем её на нашу версию — рисуем 4 пункта вместо старого одного.
  window.renderReminderCard = renderCard;

  // --- Слушатели ---
  if (openBtn) openBtn.addEventListener('click', openSheet);
  if (closeBtn) closeBtn.addEventListener('click', closeSheet);
  if (backdrop) backdrop.addEventListener('click', function (e) {
    if (e.target === backdrop) closeSheet();
  });
  if (saveBtn) saveBtn.addEventListener('click', save);

  // Тап по карточке (кроме кнопок) — открывает шторку
  card.addEventListener('click', function (e) {
    if (e.target.closest('button')) return;
    openSheet();
  });

  // Чипы интервала воды
  document.querySelectorAll('#rt-water-intervals .rt-int').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const v = parseInt(btn.dataset.interval, 10);
      if (waIntervalInput) waIntervalInput.value = String(v);
      updateIntervalChips(v);
      tg?.HapticFeedback?.selectionChanged?.();
    });
  });
})();