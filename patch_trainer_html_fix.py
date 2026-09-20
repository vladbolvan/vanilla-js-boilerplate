with open('index.html', 'r', encoding='utf-8') as f:
    src = f.read()

# ============ FIX 1: перенести экран trainer-clients ВНУТРЬ wrap ============
# Сейчас: </div></div> <!-- НИЖНЯЯ НАВИГАЦИЯ --> ... <div id="screen-trainer-clients">
# Надо: </div> <div id="screen-trainer-clients">...</div> </div> <!-- НИЖНЯЯ НАВИГАЦИЯ -->

# Найдём блок экрана
scr_start = src.find('<div id="screen-trainer-clients"')
assert scr_start != -1, 'FIX1: trainer-clients screen not found'

# Конец блока — закрывающий </div> после подписи
scr_end_marker = 'Клиенты, которых ты пригласил'
scr_end_idx = src.find(scr_end_marker)
assert scr_end_idx != -1, 'FIX1: end marker not found'
# От scr_end_idx до закрывающего </div>
scr_end = src.find('</div>', scr_end_idx)
assert scr_end != -1
scr_end += len('</div>')

# Сохраняем блок и удаляем его из старого места
block = src[scr_start:scr_end]
# Уберём возможные пустые строки до блока
before_start = scr_start
while before_start > 0 and src[before_start-1] in ' \t':
    before_start -= 1
if before_start > 0 and src[before_start-1] == '\n':
    before_start -= 1

src = src[:before_start] + src[scr_end:]

# Вставим внутрь wrap — перед закрывающим </div> перед <!-- НИЖНЯЯ НАВИГАЦИЯ -->
nav_marker = '<!-- НИЖНЯЯ НАВИГАЦИЯ -->'
nav_idx = src.find(nav_marker)
assert nav_idx != -1, 'FIX1: nav marker not found'

# Перед nav_marker должно быть </div></div> — два закрывающих.
# Первый </div> закрывает max-w-md, второй — wrap.
# Нам надо вставить блок ПЕРЕД вторым </div> (внутри wrap).
# Найдём два </div> подряд перед nav_marker
lookback = src.rfind('</div>', 0, nav_idx)  # первый </div>
lookback2 = src.rfind('</div>', 0, lookback)  # второй </div>
assert lookback2 != -1, 'FIX1: not enough </div> before nav'

# Вставляем блок между двумя </div>: после первого (закрытия max-w-md)
# Проще: вставим ПЕРЕД первым </div> (значит внутрь max-w-md, что тоже нормально)
src = src[:lookback] + block + '\n' + src[lookback:]

print('FIX1 OK: trainer-clients moved inside wrap')

# ============ FIX 2: grid-cols-4 -> grid-cols-5 в bottom-nav ============
old = 'class="fixed bottom-0 left-0 right-0\n max-w-md mx-auto grid grid-cols-4 z-40"'
if old not in src:
    old = 'class="fixed bottom-0 left-0 right-0 max-w-md mx-auto grid grid-cols-4 z-40"'
assert old in src, 'FIX2: bottom-nav grid-cols-4 not found'
new = old.replace('grid-cols-4', 'grid-cols-5')
src = src.replace(old, new, 1)
print('FIX2 OK: bottom-nav grid 4 -> 5 columns')

# ============ FIX 3: опечатка в SVG nav-trainer ============
old = '<path d="M125v14M5 12h14"/>'
if old in src:
    src = src.replace(old, '<path d="M12 5v14M5 12h14"/>', 1)
    print('FIX3 OK: SVG typo fixed')
else:
    print('FIX3 SKIP: already ok')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(src)

print('ALL DONE')