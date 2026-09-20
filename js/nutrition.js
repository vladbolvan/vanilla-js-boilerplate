// js/nutrition.js
// Раздел «Питание» в профиле: карточка за сегодня + шторка с записями.

(function () {
  'use strict';
  console.log('[nutrition] loaded');

  const card = document.getElementById('nutrition-card');
  const totalsEl = document.getElementById('nutrition-totals');
  const progressEl = document.getElementById('nutrition-progress');
  const macrosEl = document.getElementById('nutrition-macros');
  const openSheetBtn = document.getElementById('nutrition-open-btn');
  const addFoodBtn = document.getElementById('nutrition-add-btn');

  const backdrop = document.getElementById('nutrition-sheet-backdrop');
  const panel = document.getElementById('nutrition-sheet-panel');
  const closeBtn = document.getElementById('nutrition-sheet-close');
  const entriesEl = document.getElementById('nutrition-entries');

  if (!card) {
    console.warn('[nutrition] card not found');
    return;
  }

  let todayData = null;

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + dd;
  }

  function getTargetCalories() {
    try {
      if (typeof calcCalories === 'function' && typeof currentProfile !== 'undefined' && currentProfile) {
        const c = calcCalories(
          currentProfile.weight_kg,
          currentProfile.height_cm,
          currentProfile.age,
          currentProfile.gender,
          currentProfile.goal
        );
        if (c) return c;
      }
    } catch (e) {}
    return null;
  }

  async function load() {
    if (typeof tg === 'undefined' || !tg?.initData) return;

    try {
      const res = await fetch(API_URL + '/api/nutrition?date=' + todayISO(), {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      todayData = await res.json();
      render();
    } catch (e) {
      console.error('[nutrition] load failed', e);
    }
  }

  function macroPill(label, value, cls) {
    return ''
      + '<div class="bg-white/[0.02] rounded-2xl py-2 px-2 text-center border border-white/[0.05]">'
      +   '<p class="text-[9px] uppercase tracking-wider text-muted2">' + label + '</p>'
      +   '<p class="text-sm font-semibold mt-0.5 ' + cls + '">' + value + '</p>'
      + '</div>';
  }

  function render() {
    if (!todayData) return;
    const t = todayData.totals || {};
    const cal = Math.round(t.calories || 0);
    const prot = Math.round(t.protein || 0);
    const fat = Math.round(t.fat || 0);
    const carbs = Math.round(t.carbs || 0);
    const target = getTargetCalories();

    if (totalsEl) {
      if (target) {
        totalsEl.innerHTML = '<span class="text-3xl font-bold tracking-tight">' + cal + '</span>'
          + '<span class="text-sm text-muted2 ml-1.5">/ ' + target + ' ккал</span>';
      } else {
        totalsEl.innerHTML = '<span class="text-3xl font-bold tracking-tight">' + cal + '</span>'
          + '<span class="text-sm text-muted2 ml-1.5">ккал</span>';
      }
    }

    if (progressEl) {
      if (target) {
        const pct = Math.min(100, Math.round((cal / target) * 100));
        progressEl.style.width = pct + '%';
      } else {
        progressEl.style.width = '0%';
      }
    }

    if (macrosEl) {
      macrosEl.innerHTML = ''
        + macroPill('Б', prot + 'г', 'text-sky-300/80')
        + macroPill('Ж', fat + 'г', 'text-amber-300/80')
        + macroPill('У', carbs + 'г', 'text-emerald-300/80');
    }
  }

  function openSheet() {
    if (!backdrop || !panel) return;
    renderEntries();
    backdrop.classList.remove('hidden');
    requestAnimationFrame(function () {
      backdrop.classList.remove('opacity-0');
      panel.classList.remove('translate-y-full');
    });
    tg?.HapticFeedback?.impactOccurred('light');
  }

  function closeSheet() {
    if (!backdrop || !panel) return;
    backdrop.classList.add('opacity-0');
    panel.classList.add('translate-y-full');
    setTimeout(function () { backdrop.classList.add('hidden'); }, 250);
    tg?.HapticFeedback?.impactOccurred('light');
  }

  function renderEntries() {
    if (!entriesEl || !todayData) return;
    const entries = todayData.entries || [];

    if (entries.length === 0) {
      entriesEl.innerHTML = '<p class="text-muted text-center py-6 text-sm">Пока ничего не записано.<br>Тапни «Добавить еду» в профиле.</p>';
      return;
    }

    entriesEl.innerHTML = entries.map(function (e) {
      let itemsHtml = '';
      try {
        const items = e.items || [];
        if (items.length > 0) {
          itemsHtml = '<div class="mt-2 space-y-0.5">' + items.map(function (it) {
            return '<p class="text-xs text-muted2 truncate">• ' + escapeHtml(it.name || '—')
              + (it.grams ? ' · ' + Math.round(it.grams) + 'г' : '')
              + (it.calories ? ' · ' + Math.round(it.calories) + ' ккал' : '')
              + '</p>';
          }).join('') + '</div>';
        }
      } catch (err) {}

      return ''
        + '<div class="bg-surface2 rounded-2xl p-3.5 border border-white/5 mb-2" data-entry-id="' + e.id + '">'
        +   '<div class="flex items-start justify-between gap-2">'
        +     '<div class="min-w-0 flex-1">'
        +       '<p class="text-sm font-medium text-white/90 break-words">' + escapeHtml(e.raw_text) + '</p>'
        +       '<div class="flex items-baseline gap-2 mt-1 flex-wrap">'
        +         '<span class="text-xs text-primary2/90 font-semibold">' + Math.round(e.calories) + ' ккал</span>'
        +         '<span class="text-[11px] text-muted2">Б ' + Math.round(e.protein) + ' · Ж ' + Math.round(e.fat) + ' · У ' + Math.round(e.carbs) + '</span>'
        +       '</div>'
        +       itemsHtml
        +     '</div>'
        +     '<button class="nutrition-delete text-muted2 hover:text-red-400 p-1.5 -mr-1 shrink-0" data-id="' + e.id + '">'
        +       '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>'
        +     '</button>'
        +   '</div>'
        + '</div>';
    }).join('');

    entriesEl.querySelectorAll('.nutrition-delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        deleteEntry(parseInt(btn.dataset.id, 10));
      });
    });
  }

  async function deleteEntry(id) {
    const confirmed = await new Promise(function (resolve) {
      if (tg?.showConfirm) tg.showConfirm('Удалить запись?', resolve);
      else resolve(confirm('Удалить запись?'));
    });
    if (!confirmed) return;

    try {
      const res = await fetch(API_URL + '/api/nutrition/' + id, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      try { if (window.clearCalendarCache) window.clearCalendarCache(); } catch (_) {}
      tg?.HapticFeedback?.notificationOccurred('success');

      if (todayData) {
        todayData.entries = todayData.entries.filter(function (e) { return e.id !== id; });
        const t = { calories: 0, protein: 0, fat: 0, carbs: 0 };
        todayData.entries.forEach(function (e) {
          t.calories += e.calories;
          t.protein += e.protein;
          t.fat += e.fat;
          t.carbs += e.carbs;
        });
        todayData.totals = t;
        render();
        renderEntries();
      }
    } catch (e) {
      console.error('[nutrition] delete failed', e);
      tg?.showAlert('Не удалось удалить');
    }
  }

  if (openSheetBtn) openSheetBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    openSheet();
  });
  if (closeBtn) closeBtn.addEventListener('click', closeSheet);
  if (backdrop) backdrop.addEventListener('click', function (e) {
    if (e.target === backdrop) closeSheet();
  });

  if (addFoodBtn) {
    addFoodBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      tg?.HapticFeedback?.impactOccurred('medium');
      if (typeof showScreen === 'function') {
        showScreen('ai');
        if (typeof window.aiOpen === 'function') window.aiOpen();
      }
    });
  }

  card.addEventListener('click', function (e) {
    if (e.target.closest('button')) return;
    openSheet();
  });

  window.nutritionLoad = load;
  console.log('[nutrition] ready');
})();