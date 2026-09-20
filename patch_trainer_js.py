with open('app-v5.js', 'r', encoding='utf-8') as f:
    src = f.read()

def replace_once(src, old, new, label):
    assert old in src, f'{label}: marker not found'
    return src.replace(old, new, 1)

# ============ 1. DOM: ссылка на экран клиентов ============
old = "const screenAi = document.getElementById('screen-ai');"
assert old in src, '1: screenAi marker not found'
new = old + "\nconst screenTrainerClients = document.getElementById('screen-trainer-clients');"
src = src.replace(old, new, 1)
print('1 OK: screenTrainerClients ref')

# ============ 2. state: obRole ============
old = "let obGender = null;"
assert old in src, '2: obGender not found'
new = "let obRole = null;\nlet obGender = null;"
src = src.replace(old, new, 1)
print('2 OK: obRole state')

# ============ 3. showScreen: trainer-clients ============
old = " if (screenAi) screenAi.classList.toggle('hidden-screen', name !== 'ai');"
assert old in src, '3: screenAi toggle not found'
new = old + "\n if (screenTrainerClients) screenTrainerClients.classList.toggle('hidden-screen', name !== 'trainer-clients');"
src = src.replace(old, new, 1)
print('3 OK: showScreen handles trainer-clients')

# ============ 4. openOnboarding: сброс obRole + UI ============
old = """function openOnboarding() {
 obGender = currentProfile?.gender || null;"""
assert old in src, '4: openOnboarding body not found'
new = """function openOnboarding() {
 obRole = currentProfile?.role || null;
 obGender = currentProfile?.gender || null;"""
src = src.replace(old, new, 1)

# добавить вызов updateObRoleUI в конце openOnboarding
old = """ updateObGenderUI();
 updateObGoalUI();
 updateObExperienceUI();
 showScreen('onboarding');"""
assert old in src, '4b: openOnboarding tail not found'
new = """ updateObRoleUI();
 updateObGenderUI();
 updateObGoalUI();
 updateObExperienceUI();
 showScreen('onboarding');"""
src = src.replace(old, new, 1)
print('4 OK: openOnboarding handles obRole')

# ============ 5. updateObRoleUI ============
old = "function updateObGenderUI() {"
assert old in src, '5: updateObGenderUI not found'
new_fn = """function updateObRoleUI() {
 document.querySelectorAll('[data-ob-role]').forEach(btn => {
 const a = btn.dataset.obRole === obRole;
 btn.classList.toggle('bg-primary', a);
 btn.classList.toggle('text-white', a);
 btn.classList.toggle('border-primary', a);
 btn.classList.toggle('bg-surface2', !a);
 btn.classList.toggle('text-muted', !a);
 btn.classList.toggle('border-white/5', !a);
 });
}

function updateObGenderUI() {"""
src = src.replace(old, new_fn, 1)
print('5 OK: updateObRoleUI')

# ============ 6. saveOnboarding: role в payload ============
old = "        const p = { goal: obGoal, experience: obExperience, mark_onboarded: true };"
assert old in src, '6: saveOnboarding payload not found'
new = "        const p = { goal: obGoal, experience: obExperience, mark_onboarded: true, role: obRole || 'user' };"
src = src.replace(old, new, 1)
print('6 OK: role in saveOnboarding')

# ============ 7. Валидация онбординга: role обязателен ============
old = " if (!obGoal) { tg?.showAlert('Выбери цель'); return; }"
assert old in src, '7: validation marker not found'
new = " if (!obRole) { tg?.showAlert('Выбери: тренируюсь или тренер'); return; }\n" + old
src = src.replace(old, new, 1)
print('7 OK: role required in onboarding')

# ============ 8. Обработчики [data-ob-role] ============
old = "document.querySelectorAll('[data-ob-gender]').forEach(btn => {"
assert old in src, '8: ob-gender handlers not found'
new_block = """document.querySelectorAll('[data-ob-role]').forEach(btn => {
 btn.addEventListener('click', () => {
 obRole = btn.dataset.obRole;
 updateObRoleUI();
 tg?.HapticFeedback?.selectionChanged?.();
 });
});
""" + old
src = src.replace(old, new_block, 1)
print('8 OK: ob-role handlers')

# ============ 9. loadMe: показать nav-trainer ============
old = """ if (!me.onboarded_at) openOnboarding();
 if (typeof window.onGymlyUserLoaded === 'function') {"""
assert old in src, '9: loadMe onboarded marker not found'
new = """ if (!me.onboarded_at) openOnboarding();
 // trainer nav
 const navTrainer = document.getElementById('nav-trainer');
 if (navTrainer) navTrainer.classList.toggle('hidden', me.role !== 'trainer');
 if (typeof window.onGymlyUserLoaded === 'function') {"""
src = src.replace(old, new, 1)
print('9 OK: nav-trainer visibility in loadMe')

# ============ 10. Функции загрузки/рендера клиентов + обработчики ============
old = "// ============ СОБЫТИЯ ============"
assert old in src, '10: СОБЫТИЯ marker not found'
new_block = """// ============ ТРЕНЕР: КЛИЕНТЫ ============
async function loadTrainerClients() {
 const listEl = document.getElementById('trainer-clients-list');
 if (!listEl) return;
 listEl.innerHTML = '<p class="text-muted text-center py-8">Загрузка...</p>';
 try {
 const res = await fetch(`${API_URL}/api/trainer/clients`, { headers: authHeaders() });
 if (!res.ok) throw new Error(`HTTP ${res.status}`);
 const data = await res.json();
 renderTrainerClients(data.clients || []);
 } catch (e) {
 console.error('loadTrainerClients', e);
 listEl.innerHTML = '<p class="text-red-400 text-center py-8">Ошибка загрузки</p>';
 }
}

function renderTrainerClients(clients) {
 const listEl = document.getElementById('trainer-clients-list');
 if (!listEl) return;
 if (!clients || clients.length === 0) {
 listEl.innerHTML = `
 <div class="text-center py-12">
 <div class="inline-flex items-center justify-center w-20 h-20 rounded-4xl bg-surface mb-5 text-muted/40 empty-icon-ring">
 <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
 <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
 <circle cx="9" cy="7" r="4"/>
 <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
 <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
 </svg>
 </div>
 <p class="text-white/90 text-sm font-medium mb-1">Пока никого</p>
 <p class="text-muted2 text-xs">Нажми «Добавить» — получишь ссылку для клиента</p>
 </div>
 `;
 return;
 }
 listEl.innerHTML = clients.map(c => {
 const name = c.first_name || (c.username ? '@' + c.username : 'Клиент');
 let status, statusCls;
 if (c.days_since_last == null) {
 status = 'Ещё не тренировался';
 statusCls = 'text-muted2';
 } else if (c.days_since_last === 0) {
 status = 'Тренировался сегодня';
 statusCls = 'text-emerald-300/90';
 } else if (c.days_since_last === 1) {
 status = 'Тренировался вчера';
 statusCls = 'text-emerald-300/90';
 } else if (c.days_since_last <= 7) {
 status = `${c.days_since_last} дн. назад`;
 statusCls = 'text-muted';
 } else {
 status = `Не тренируется ${c.days_since_last} дн.`;
 statusCls = 'text-amber-300/80';
 }
 const weekText = c.workouts_week ? `${c.workouts_week} трен. за 7 дн.` : '';
 return `
 <div class="bg-surface rounded-3xl p-4 card-shadow">
 <div class="flex items-start justify-between gap-3 mb-1.5">
 <p class="font-semibold break-words min-w-0 flex-1">${name}</p>
 ${weekText ? `<span class="text-xs text-muted2 shrink-0">${weekText}</span>` : ''}
 </div>
 <p class="text-xs ${statusCls}">${status}</p>
 </div>
 `;
 }).join('');
}

async function showAddClientLink() {
 try {
 const me = currentProfile;
 if (!me || !me.id) { tg?.showAlert('Не удалось получить твой ID'); return; }
 const link = `https://t.me/GymlyUp_bot?start=tr_${me.id}`;
 // Пробуем открыть share в Telegram
 if (tg && tg.openTelegramLink) {
 const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Привет! Вот ссылка на мой дневник тренировок в Gymly — открой, я буду видеть твой прогресс.')}`;
 tg.openTelegramLink(shareUrl);
 } else if (navigator.share) {
 await navigator.share({ url: link, title: 'Gymly', text: 'Ссылка для клиента' });
 } else {
 await navigator.clipboard.writeText(link);
 tg?.showAlert('Ссылка скопирована: ' + link);
 }
 } catch (e) {
 console.error('showAddClientLink', e);
 }
}

// ============ СОБЫТИЯ ============"""
src = src.replace(old, new_block, 1)
print('10 OK: trainer clients functions')

# ============ 11. Обработчик nav-trainer ============
old = """document.getElementById('nav-calendar')?.addEventListener('click', () => {"""
assert old in src, '11: nav-calendar handler not found'
new = """document.getElementById('nav-trainer')?.addEventListener('click', () => {
 tg?.HapticFeedback?.impactOccurred('light');
 showScreen('trainer-clients');
 loadTrainerClients();
});

document.getElementById('add-client-btn')?.addEventListener('click', () => {
 tg?.HapticFeedback?.impactOccurred('medium');
 showAddClientLink();
});

document.getElementById('nav-calendar')?.addEventListener('click', () => {"""
src = src.replace(old, new, 1)
print('11 OK: nav-trainer + add-client handlers')

with open('app-v5.js', 'w', encoding='utf-8') as f:
    f.write(src)

print('ALL DONE')