import io, os, re, shutil

path = 'app.js'
backup = 'app.js.bak_b6'

if not os.path.exists(backup):
    shutil.copy2(path, backup)
    print(f'Backup: {backup}')
else:
    print(f'Backup already exists: {backup}')

with io.open(path, 'r', encoding='utf-8', newline='') as f:
    content = f.read()
orig_len = len(content)

# === 1. Заменяем три фильтра и вставляем блок assigned ===
# Матчим две строки с любыми отступами (пробелы или табы)
pattern = re.compile(
    r'function renderProgramsList\(\) \{\s*\n'
    r'[\t ]*const templates = allPrograms\.filter\(p => p\.is_template\);\s*\n'
    r'[\t ]*const mine = allPrograms\.filter\(p => !p\.is_template\);\s*\n'
    r'[\t ]*let html = \'\';\s*\n'
    r'([\t ]*)if \(templates\.length > 0\) \{'
)

assigned_block = '''function renderProgramsList() {
 const assigned = allPrograms.filter(p => p.is_assigned);
 const templates = allPrograms.filter(p => p.is_template && !p.is_assigned);
 const mine = allPrograms.filter(p => !p.is_template && !p.is_assigned);
 let html = '';

 if (assigned.length > 0) {
 html += '<p class="text-[10px] uppercase tracking-wider text-primary2 mb-2">От тренера</p>';
 for (const p of assigned) {
 const cnt = (p.exercises || []).length;
 html += `
 <button class="program-item w-full rounded-2xl p-4 text-left mb-2
 active:scale-[0.98] transition border border-primary/25"
 style="background: linear-gradient(135deg, rgba(124,108,255,0.14) 0%, rgba(124,108,255,0.05) 100%);"
 data-program-id="${p.id}">
 <div class="flex items-center justify-between gap-2">
 <div class="min-w-0 flex items-center gap-3">
 <span class="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-primary/20 text-primary2 shrink-0">
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
 <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
 <circle cx="9" cy="7" r="4"/>
 <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
 <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
 </svg>
 </span>
 <div class="min-w-0">
 <p class="font-semibold truncate">${p.name}</p>
 <p class="text-xs text-muted mt-0.5">${cnt} упражнений</p>
 </div>
 </div>
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
 </div>
 </button>
 `;
 }
 }

 \\1if (templates.length > 0) {'''

new_content, n = pattern.subn(assigned_block, content, count=1)
if n != 1:
    print('ERROR: pattern did not match (n=%d)' % n)
    print('Покажи первые 10 строк функции вручную.')
    raise SystemExit(1)
content = new_content
print('renderProgramsList updated, assigned section inserted')

# === 2. Проверим что изменения применились ===
if 'const assigned = allPrograms.filter(p => p.is_assigned);' not in content:
    print('ERROR: assigned filter missing')
    raise SystemExit(1)

if len(content) <= orig_len:
    print('ERROR: content did not grow')
    raise SystemExit(1)

with io.open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print('PATCH OK, new size:', len(content))

with open(path, 'rb') as f:
    fb = f.read(4)
    print('First bytes:', fb.hex())
    if fb.startswith(b'\xef\xbb\xbf'):
        print('WARNING: BOM detected!')
    else:
        print('No BOM - OK')