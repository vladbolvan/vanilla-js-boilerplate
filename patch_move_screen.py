with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Найти начало блока screen-trainer-clients
start_marker = '<div id="screen-trainer-clients"'
start = html.find(start_marker)
assert start != -1, 'start not found'

# 2. Найти конец блока
footer = 'Клиенты, которых ты пригласил'
footer_idx = html.find(footer, start)
assert footer_idx != -1, 'footer not found'
p_close = html.find('</p>', footer_idx)
assert p_close != -1, 'p_close not found'
scr_end = html.find('</div>', p_close)
assert scr_end != -1, 'scr_end not found'
scr_end += len('</div>')

block = html[start:scr_end]

# 3. Удалить блок из старого места (с отступами)
before_start = start
while before_start > 0 and html[before_start-1] in ' \t':
    before_start -= 1
if before_start > 0 and html[before_start-1] == '\n':
    before_start -= 1

html = html[:before_start] + html[scr_end:]

# 4. Найти конец screen-profile (после <p>Gymly)
gymly_marker = 'Gymly · v0.5'
gymly_idx = html.find(gymly_marker)
assert gymly_idx != -1, 'Gymly not found'
p_gymly_close = html.find('</p>', gymly_idx)
assert p_gymly_close != -1, 'p_gymly_close not found'
profile_close = html.find('</div>', p_gymly_close)
assert profile_close != -1, 'profile_close not found'
profile_close += len('</div>')

# 5. Вставить блок ПОСЛЕ закрытия screen-profile
html = html[:profile_close] + '\n\n' + block + html[profile_close:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('OK: screen-trainer-clients moved outside screen-profile')