with open('index.html', 'r', encoding='utf-8') as f:
    src = f.read()

# ============ FIX3b: опечатка в SVG (ищем по подстроке без пробела) ============
if 'M125v14' in src:
    src = src.replace('M125v14', 'M12 5v14', 1)
    print('FIX3b OK: SVG typo fixed')
else:
    print('FIX3b SKIP: M125v14 not found')

# ============ FIX1b: экран trainer-clients сам центрируется ============
# Добавляем max-w-md mx-auto px-5 + safe-top прямо в класс экрана.
# Так экран корректен, даже если лежит вне основного wrap.
old = '<div id="screen-trainer-clients" class="hidden-screen">'
assert old in src, 'FIX1b: screen-trainer-clients not found'
new = ('<div id="screen-trainer-clients" class="hidden-screen max-w-md mx-auto px-5" '
       'style="padding-top: calc(env(safe-area-inset-top, 0) + var(--safe-top-offset, 56px)); '
       'padding-bottom: 100px;">')
src = src.replace(old, new, 1)
print('FIX1b OK: trainer-clients self-centered')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(src)
print('ALL DONE')