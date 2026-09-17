// js/sharing.js
// Шаринг программ: генерация ссылки, приём приглашения.
// Использует глобальные: tg, API_URL, authHeaders.

(function () {
  'use strict';
  console.log('[sharing] loaded');

  const SHARE_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>';

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  // ============ 1. Поделиться программой ============
  async function shareProgram(programId, programName) {
    tg?.HapticFeedback?.impactOccurred('medium');
    try {
      const res = await fetch(API_URL + '/api/programs/' + programId + '/share', {
        method: 'POST',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const url = data.share_url;
      const text = 'Попробуй мою программу «' + programName + '» в Gymly 💪';
      const shareUrl = 'https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(text);

      // 1) Родной для Telegram способ (работает в WebApp iframe)
      if (tg?.openTelegramLink) {
        tg.openTelegramLink(shareUrl);
        return;
      }

      // 2) Нативный share sheet (iOS/Android Safari/Chrome)
      if (navigator.share) {
        try {
          await navigator.share({ title: 'Gymly', text: text, url: url });
          return;
        } catch (e) {
          if (e && (e.name === 'AbortError' || e.name === 'NotAllowedError')) return;
        }
      }

      // 3) Fallback: открываем диалог через window.open
      try {
        window.open(shareUrl, '_blank');
        return;
      } catch (e) { /* fallthrough */ }

      // 4) Крайний случай: копируем в буфер
      await copyToClipboard(url);
      tg?.showAlert('Ссылка скопирована: ' + url);
    } catch (e) {
      console.error('shareProgram', e);
      tg?.showAlert('Не удалось поделиться');
    }
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch (e) { /* fallthrough */ }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { console.error(e); }
    document.body.removeChild(ta);
  }

  // ============ 2. Делегирование клика на кнопки share ============
  document.addEventListener('click', function (e) {
    const btn = e.target.closest && e.target.closest('.share-program-btn');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    const pid = parseInt(btn.dataset.programId, 10);
    const pname = btn.dataset.programName || 'Программа';
    if (!isNaN(pid)) shareProgram(pid, pname);
  }, true);

  // ============ 3. Модалка принятия программы ============
  let pendingShown = false;

  async function showPendingShareModal(shareId) {
    if (pendingShown) return;
    pendingShown = true;

    // Запрашиваем превью
    let preview = null;
    try {
      const res = await fetch(API_URL + '/api/programs/shared/' + encodeURIComponent(shareId));
      if (res.ok) {
        preview = await res.json();
      }
    } catch (e) {
      console.error('preview fetch', e);
    }

    if (!preview) {
      // Программа удалена или недоступна — тихо очищаем pending
      try {
        await fetch(API_URL + '/api/me/pending-share', {
          method: 'DELETE',
          headers: authHeaders(),
        });
      } catch (e) { /* ignore */ }
      return;
    }

    renderModal(preview);
  }

  function renderModal(preview) {
    const name = preview.name || 'Программа';
    const authorName = preview.author_name || null;
    const authorUsername = preview.author_username || null;
    let authorText = 'другом';
    if (authorName && authorUsername) authorText = escapeHtml(authorName) + ' (@' + escapeHtml(authorUsername) + ')';
    else if (authorName) authorText = escapeHtml(authorName);

    const exList = (preview.exercises || []).map(function (ex, i) {
      return ''
        + '<div class="flex items-center gap-2 py-1.5">'
        +   '<span class="text-muted2 text-[11px] w-5 shrink-0 text-center">' + (i + 1) + '</span>'
        +   '<p class="text-sm text-white/90 truncate">' + escapeHtml(ex.exercise_name || '—') + '</p>'
        + '</div>';
    }).join('');

    const modal = document.createElement('div');
    modal.id = 'pending-share-modal';
    modal.className = 'fixed inset-0 z-[80] flex items-end justify-center opacity-0 transition-opacity duration-200';
    modal.style.background = 'rgba(0,0,0,.7)';
    modal.style.backdropFilter = 'blur(4px)';
    modal.style.webkitBackdropFilter = 'blur(4px)';
    modal.innerHTML = ''
      + '<div class="bg-surface rounded-t-3xl max-w-md w-full border-t border-white/8 translate-y-full transition-transform duration-300" style="box-shadow: 0 -20px 60px rgba(0,0,0,.5);">'
      +   '<div class="sheet-handle"></div>'
      +   '<div class="px-5 pt-4 pb-2">'
      +     '<p class="text-[10px] uppercase tracking-wider text-muted2 mb-2">🎁 Тебе передали программу</p>'
      +     '<h2 class="text-xl font-bold tracking-tight mb-1">' + escapeHtml(name) + '</h2>'
      +     '<p class="text-sm text-muted">от ' + authorText + '</p>'
      +   '</div>'
      +   '<div class="px-5 py-4">'
      +     '<div class="bg-surface2 rounded-2xl p-4 max-h-56 overflow-y-auto border border-white/5">'
      +       '<p class="text-[10px] uppercase tracking-wider text-muted2 mb-2">' + (preview.exercises_count || 0) + ' упражнений</p>'
      +       exList
      +     '</div>'
      +   '</div>'
      +   '<div class="px-5 pb-5 pt-2 flex gap-2">'
      +     '<button class="cancel-pending-share flex-1 bg-surface2 hover:bg-surface3 active:scale-[0.98] transition rounded-3xl py-4 font-medium text-base text-white/80 border border-white/8">Пропустить</button>'
      +     '<button class="accept-pending-share flex-1 bg-primary hover:bg-primary/90 active:scale-[0.98] transition rounded-3xl py-4 font-semibold text-base text-white" style="box-shadow: 0 10px 30px -10px rgba(124,108,255,0.55);">Добавить</button>'
      +   '</div>'
      + '</div>';

    document.body.appendChild(modal);

    // Анимация появления
    requestAnimationFrame(function () {
      modal.classList.remove('opacity-0');
      const inner = modal.querySelector('div');
      if (inner) inner.classList.remove('translate-y-full');
    });

    // Клик по фону = Пропустить
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closePendingModal();
    });

    async function closePendingModal() {
      modal.classList.add('opacity-0');
      const inner = modal.querySelector('div');
      if (inner) inner.classList.add('translate-y-full');
      setTimeout(function () { modal.remove(); }, 250);
    }

    modal.querySelector('.cancel-pending-share').addEventListener('click', async function () {
      tg?.HapticFeedback?.impactOccurred('light');
      try {
        await fetch(API_URL + '/api/me/pending-share', { method: 'DELETE', headers: authHeaders() });
      } catch (e) { /* ignore */ }
      closePendingModal();
    });

    modal.querySelector('.accept-pending-share').addEventListener('click', async function () {
      const btn = modal.querySelector('.accept-pending-share');
      btn.style.opacity = '0.6';
      tg?.HapticFeedback?.impactOccurred('medium');
      try {
        const res = await fetch(API_URL + '/api/programs/shared/' + encodeURIComponent(preview.share_id) + '/accept', {
          method: 'POST',
          headers: authHeaders(),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        tg?.HapticFeedback?.notificationOccurred('success');
        await closePendingModal();
        tg?.showAlert('Программа добавлена в «Мои программы»');
      } catch (e) {
        console.error(e);
        tg?.showAlert('Не удалось добавить программу');
        btn.style.opacity = '1';
      }
    });
  }

  // ============ 4. Hook — вызывается из app.js после загрузки user ============
  window.onGymlyUserLoaded = function (me) {
    if (me && me.pending_share_id) {
      // Небольшая задержка — чтобы WebApp успел отрисоваться
      setTimeout(function () { showPendingShareModal(me.pending_share_id); }, 400);
    }
  };
})();