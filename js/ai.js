// js/ai.js
// AI-тренер: чат для парсинга еды → КБЖУ.
// Использует глобальные: tg, API_URL, authHeaders.

(function () {
  'use strict';
  console.log('[ai] loaded');

  const screen = document.getElementById('screen-ai');
  const list = document.getElementById('ai-messages');
  const input = document.getElementById('ai-input');
  const sendBtn = document.getElementById('ai-send');
  const clearBtn = document.getElementById('ai-clear');
  const navBtn = document.getElementById('nav-ai');

  if (!screen || !list || !input || !sendBtn) {
    console.warn('[ai] elements not found — skipping init');
    return;
  }

  // История в памяти
  let messages = [];
  let isLoading = false;

  // Стартовое сообщение
  const GREETING = {
    role: 'assistant',
    type: 'text',
    text: 'Привет! 👋 Опиши, что ты съел — я посчитаю калории и БЖУ.\n\nНапример: «омлет из 3 яиц и кофе с молоком»'
  };

  function getTzOffset() {
    if (typeof window.getTzOffset === 'function') return window.getTzOffset();
    // fallback
    return -new Date().getTimezoneOffset();
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  function scrollToBottom() {
    if (!list) return;
    // плавный скролл к низу
    requestAnimationFrame(function () {
      list.scrollTop = list.scrollHeight;
    });
  }

  // ============ Рендер сообщения ============
  function renderMessage(msg, idx) {
    const isUser = msg.role === 'user';

    if (msg.type === 'loading') {
      return ''
        + '<div class="flex items-start gap-3 mb-4" data-msg-idx="' + idx + '">'
        +   '<div class="w-8 h-8 rounded-xl bg-primary/10 border border-primary/15 text-primary2 shrink-0 flex items-center justify-center">'
        +     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>'
        +   '</div>'
        +   '<div class="bg-surface rounded-3xl rounded-tl-md px-4 py-3 border border-white/5">'
        +     '<div class="flex gap-1 items-center h-5">'
        +       '<span class="w-1.5 h-1.5 rounded-full bg-primary2/60 animate-pulse"></span>'
        +       '<span class="w-1.5 h-1.5 rounded-full bg-primary2/60 animate-pulse" style="animation-delay:0.15s"></span>'
        +       '<span class="w-1.5 h-1.5 rounded-full bg-primary2/60 animate-pulse" style="animation-delay:0.3s"></span>'
        +     '</div>'
        +   '</div>'
        + '</div>';
    }

    if (msg.type === 'error') {
      return ''
        + '<div class="flex justify-end mb-4" data-msg-idx="' + idx + '">'
        +   '<div class="bg-red-500/10 text-red-300/90 rounded-3xl rounded-tr-md px-4 py-3 text-sm max-w-[80%] border border-red-500/20">'
        +     escapeHtml(msg.text)
        +   '</div>'
        + '</div>';
    }

    if (msg.type === 'nutrition') {
      const items = (msg.items || []).map(function (it) {
        return ''
          + '<div class="flex items-center justify-between gap-3 py-1 text-sm">'
          +   '<span class="text-white/80 truncate min-w-0">' + escapeHtml(it.name || '—') + '</span>'
          +   '<span class="text-muted2 text-xs shrink-0">' + (it.grams ? Math.round(it.grams) + ' г · ' : '') + (it.calories ? Math.round(it.calories) + ' ккал' : '—') + '</span>'
          + '</div>';
      }).join('');

      return ''
        + '<div class="flex items-start gap-3 mb-4" data-msg-idx="' + idx + '">'
        +   '<div class="w-8 h-8 rounded-xl bg-accent/10 border border-accent/20 text-accent shrink-0 flex items-center justify-center">'
        +     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7.5c-1.5-1.2-3-2-4.5-2C4.5 5.5 2.5 8 2.5 11c0 4.5 3 9 6.5 9 1 0 2-.4 3-.4s2 .4 3 .4c3.5 0 6.5-4.5 6.5-9 0-3-2-5.5-5-5.5-1.5 0-3 .8-4.5 2z"/><path d="M12 7.5v-3.2"/></svg>'
        +   '</div>'
        +   '<div class="flex-1 min-w-0">'
        +     '<div class="bg-surface rounded-3xl rounded-tl-md p-4 border border-white/5">'
        +       '<p class="text-[10px] uppercase tracking-wider text-muted2 mb-2">Итог</p>'
        +       '<div class="grid grid-cols-4 gap-2 mb-3">'
        +         '<div class="bg-surface2 rounded-2xl py-2 text-center border border-white/5"><p class="text-[9px] uppercase text-muted2">Ккал</p><p class="text-base font-bold mt-0.5">' + Math.round(msg.calories || 0) + '</p></div>'
        +         '<div class="bg-surface2 rounded-2xl py-2 text-center border border-white/5"><p class="text-[9px] uppercase text-muted2">Б</p><p class="text-base font-bold mt-0.5">' + Math.round(msg.protein || 0) + 'г</p></div>'
        +         '<div class="bg-surface2 rounded-2xl py-2 text-center border border-white/5"><p class="text-[9px] uppercase text-muted2">Ж</p><p class="text-base font-bold mt-0.5">' + Math.round(msg.fat || 0) + 'г</p></div>'
        +         '<div class="bg-surface2 rounded-2xl py-2 text-center border border-white/5"><p class="text-[9px] uppercase text-muted2">У</p><p class="text-base font-bold mt-0.5">' + Math.round(msg.carbs || 0) + 'г</p></div>'
        +       '</div>'
        +       (items ? '<div class="border-t border-white/5 pt-2 mt-2">' + items + '</div>' : '')
        +     '</div>'
        +     '<button class="ai-save-btn mt-2 w-full bg-primary hover:bg-primary/90 active:scale-[0.98] transition rounded-2xl py-3 font-semibold text-sm text-white" data-msg-idx="' + idx + '" style="box-shadow:0 8px 24px -10px rgba(124,108,255,0.55);">'
        +       'Сохранить в КБЖУ'
        +     '</button>'
        +   '</div>'
        + '</div>';
    }

    // text
    return ''
      + '<div class="flex ' + (isUser ? 'justify-end' : 'items-start gap-3') + ' mb-4" data-msg-idx="' + idx + '">'
      +   (isUser ? '' : '<div class="w-8 h-8 rounded-xl bg-primary/10 border border-primary/15 text-primary2 shrink-0 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="3"/></svg></div>')
      +   '<div class="' + (isUser
              ? 'bg-primary text-white rounded-3xl rounded-tr-md px-4 py-3 text-sm max-w-[80%] break-words'
              : 'bg-surface rounded-3xl rounded-tl-md px-4 py-3 text-sm border border-white/5 text-white/90 max-w-[80%] whitespace-pre-wrap') + '">'
      +     escapeHtml(msg.text)
      +   '</div>'
      + '</div>';
  }

  function renderAll() {
    list.innerHTML = messages.map(renderMessage).join('');
    // Обработчики «Сохранить»
    list.querySelectorAll('.ai-save-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const idx = parseInt(btn.dataset.msgIdx, 10);
        saveNutrition(idx, btn);
      });
    });
    scrollToBottom();
  }

  // ============ Отправка ============
  async function sendMessage(text) {
    if (!text || isLoading) return;

    text = text.trim();
    if (!text) return;
    if (text.length > 500) {
      tg?.showAlert('Слишком длинное сообщение (до 500 символов)');
      return;
    }

    isLoading = true;
    sendBtn.disabled = true;
    sendBtn.style.opacity = '0.5';
    input.value = '';

    messages.push({ role: 'user', type: 'text', text: text });
    const loadingIdx = messages.length;
    messages.push({ role: 'assistant', type: 'loading' });
    renderAll();

    try {
      const res = await fetch(API_URL + '/api/nutrition/parse', {
        method: 'POST',
        headers: Object.assign({}, authHeaders(), { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ text: text }),
      });

      if (!res.ok) {
        let errMsg = 'Не удалось распознать';
        if (res.status === 502) errMsg = 'AI временно недоступен. Попробуй ещё раз.';
        if (res.status === 400) errMsg = 'Не получилось разобрать. Опиши еду проще.';
        throw new Error(errMsg);
      }

      const data = await res.json();
      messages[loadingIdx] = {
        role: 'assistant',
        type: 'nutrition',
        calories: data.calories,
        protein: data.protein,
        fat: data.fat,
        carbs: data.carbs,
        items: data.items || [],
        rawText: text,
      };
      renderAll();
      tg?.HapticFeedback?.notificationOccurred('success');
    } catch (e) {
      console.error('[ai]', e);
      messages[loadingIdx] = {
        role: 'assistant',
        type: 'error',
        text: e.message || 'Ошибка',
      };
      renderAll();
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      sendBtn.style.opacity = '1';
    }
  }

  // ============ Сохранение ============
  async function saveNutrition(idx, btn) {
    const msg = messages[idx];
    if (!msg || msg.type !== 'nutrition' || msg.saved) return;

    btn.style.opacity = '0.6';
    btn.textContent = 'Сохраняю...';
    tg?.HapticFeedback?.impactOccurred('medium');

    try {
      // Отправляем УЖЕ готовые данные — LLM второй раз НЕ вызываем
      const res = await fetch(API_URL + '/api/nutrition/save', {
        method: 'POST',
        headers: Object.assign({}, authHeaders(), { 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          raw_text: msg.rawText,
          calories: msg.calories,
          protein: msg.protein,
          fat: msg.fat,
          carbs: msg.carbs,
          items: msg.items || [],
          tz_offset: getTzOffset(),
        }),
      });

      if (!res.ok) throw new Error('HTTP ' + res.status);
      try { if (window.clearCalendarCache) window.clearCalendarCache(); } catch (_) {}

      msg.saved = true;
      btn.outerHTML = '<div class="mt-2 text-center text-xs text-accent/80 py-2">✓ Сохранено в КБЖУ</div>';
      tg?.HapticFeedback?.notificationOccurred('success');
    } catch (e) {
      console.error('[ai save]', e);
      tg?.showAlert('Не удалось сохранить');
      btn.style.opacity = '1';
      btn.textContent = 'Сохранить в КБЖУ';
    }
  }

  // ============ Слушатели ============
  sendBtn.addEventListener('click', function () {
    sendMessage(input.value);
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input.value);
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      tg?.showConfirm ? tg.showConfirm('Очистить чат?', function (ok) {
        if (ok) { messages = [GREETING]; renderAll(); }
      }) : (confirm('Очистить чат?') && (messages = [GREETING], renderAll()));
    });
  }

  // ============ Публичный API ============
  window.aiOpen = function () {
    if (messages.length === 0) {
      messages = [GREETING];
      renderAll();
    }
    // Фокус на поле
    setTimeout(function () { input.focus(); }, 300);
  };

  // Инициализация
  messages = [GREETING];
  renderAll();

  console.log('[ai] ready');
})();