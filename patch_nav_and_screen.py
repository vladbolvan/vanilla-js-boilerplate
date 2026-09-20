# ============ HTML: переместить экран внутрь max-w-md ============
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Найти блок экрана
start = html.find('<div id="screen-trainer-clients"')
assert start != -1, 'HTML: trainer-clients not found'

# Конец блока — </div> после подписи "Клиенты, которых ты пригласил"
marker_end = 'Клиенты, которых ты пригласил'
end_idx = html.find(marker_end, start)
assert end_idx != -1, 'HTML: end marker not found'
# </p> потом </div> (закрытие экрана)
p_close = html.find('</p>', end_idx)
assert p_close != -1
scr_end = html.find('</div>', p_close)
assert scr_end != -1
scr_end += len('</div>')

block = html[start:scr_end]

# Удалить блок из старого места (с отступами)
before_start = start
while before_start > 0 and html[before_start-1] in ' \t':
    before_start -= 1
if before_start > 0 and html[before_start-1] == '\n':
    before_start -= 1

html = html[:before_start] + html[scr_end:]

# Очистить блок: убрать лишние классы и inline style
block = block.replace(
    'class="hidden-screen max-w-md mx-auto px-5"',
    'class="hidden-screen"',
    1,
)
# Убрать inline style с padding
import re
block = re.sub(r'\s*style="padding-top:[^"]*"', '', block, count=1)

# Вставить ВНУТРЬ max-w-md — перед <p>Gymly
gymly_marker = '<p class="text-[10px] text-muted2 text-center mt-10 uppercase tracking-wider">Gymly'
gymly_idx = html.find(gymly_marker)
assert gymly_idx != -1, 'HTML: Gymly marker not found'

# Найти начало строки
line_start = html.rfind('\n', 0, gymly_idx) + 1

html = html[:line_start] + block + '\n\n' + html[line_start:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('HTML OK: trainer-clients moved inside max-w-md')

# ============ JS: кэш роли в localStorage ============
with open('app-v5.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. В loadMe после fetch — сохранить роль
old = " if (!me.onboarded_at) openOnboarding();"
assert old in js, 'JS1: onboarded marker not found'
new = " try { localStorage.setItem('gymly_role', me.role || 'user'); } catch (_) {}\n" + old
js = js.replace(old, new, 1)

# 2. При старте приложения — применить роль из кэша мгновенно
# Найдём конец блока после UI-референсов (после `const obSaveBtn = ...`)
old = "const obSaveBtn = document.getElementById('ob-save-btn');"
assert old in js, 'JS2: obSaveBtn marker not found'
new = old + """

// Мгновенно применяем роль из кэша (до fetch /api/me)
(function applyCachedRole() {
 try {
 const cachedRole = localStorage.getItem('gymly_role');
 if (cachedRole === 'trainer') {
 const navTrainer = document.getElementById('nav-trainer');
 const nav = document.getElementById('bottom-nav');
 if (navTrainer) navTrainer.classList.remove('hidden');
 if (nav) nav.className = nav.className.replace('grid-cols-4', 'grid-cols-5');
 }
 } catch (_) {}
})();"""
js = js.replace(old, new, 1)

with open('app-v5.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('JS OK: role cached in localStorage')
print('ALL DONE')