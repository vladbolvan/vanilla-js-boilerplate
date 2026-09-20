import io
import os
import shutil

path = 'index.html'
backup = 'index.html.bak1'

# Бэкап
if not os.path.exists(backup):
    shutil.copy2(path, backup)
    print(f'Backup created: {backup}')
else:
    print(f'Backup already exists: {backup}')

# Чтение с сохранением переводов строк
with io.open(path, 'r', encoding='utf-8', newline='') as f:
    content = f.read()

old = '<div class="px-5 pb-5 pt-3 border-t border-white/5" style="padding-bottom: calc(env(safe-area-inset-bottom, 0) + 20px);">'
new = '<div class="px-5 pb-5 pt-3 border-t border-white/5" style="padding-bottom: calc(env(safe-area-inset-bottom, 0) + 100px);">'

if old not in content:
    print('ERROR: old string not found!')
    print('Проверь файл вручную.')
    exit(1)

content = content.replace(old, new)

if new not in content:
    print('ERROR: replacement failed!')
    exit(1)

with io.open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print('Patch applied successfully.')
print(f'Lines: {content.count(chr(10)) + 1}')

# Проверка на BOM
with open(path, 'rb') as f:
    first_bytes = f.read(4)
    print('First bytes:', first_bytes.hex())
    if first_bytes.startswith(b'\xef\xbb\xbf'):
        print('WARNING: BOM detected!')
    else:
        print('No BOM - OK')