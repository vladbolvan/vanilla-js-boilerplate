import io, os, re, shutil

path = 'app.js'
backup = 'app.js.bak_days'
if not os.path.exists(backup):
    shutil.copy2(path, backup)
    print(f'Backup: {backup}')
else:
    print(f'Backup already exists: {backup}')

with io.open(path, 'r', encoding='utf-8', newline='') as f:
    c = f.read()
orig = len(c)

# === 1. Сигнатура startWorkoutFromProgram ===
old = '''async function startWorkoutFromProgram(programId) {
 tg?.HapticFeedback?.impactOccurred('medium');
 try {
 const res = await fetch(`${API_URL}/api/workouts/from-program/${programId}?tz_offset=${getTzOffset()}`, {
 method: 'POST',
 headers: authHeaders(),
 });'''
new = '''async function startWorkoutFromProgram(programId, dayIndex) {
 tg?.HapticFeedback?.impactOccurred('medium');
 try {
 let _url = `${API_URL}/api/workouts/from-program/${programId}?tz_offset=${getTzOffset()}`;
 if (dayIndex != null) _url += `&day_index=${dayIndex}`;
 const res = await fetch(_url, {
 method: 'POST',
 headers: authHeaders(),
 });'''
assert old in c, 'startWorkoutFromProgram header not found'
c = c.replace(old, new, 1)
print('startWorkoutFromProgram OK')

# === 2. Клик по program-item → day picker ===
old = ''' progListEl.querySelectorAll('.program-item').forEach(btn => {
 btn.addEventListener('click', () => startWorkoutFromProgram(parseInt(btn.dataset.programId)));
 });'''
new = ''' progListEl.querySelectorAll('.program-item').forEach(btn => {
 btn.addEventListener('click', () => {
 const _pid = parseInt(btn.dataset.programId);
 const _p = allPrograms.find(x => x.id === _pid);
 if (!_p) return;
 const _daySet = new Set((_p.exercises || []).map(e => e.day_index ?? 0));
 const _days = [..._daySet].sort((a, b) => a - b);
 if (_days.length > 1 && tg?.showPopup) {
   tg.showPopup({
     title: _p.name || 'Программа',
     message: 'Программа на несколько дней. Какой день тренируем?',
     buttons: [
       ..._days.map(d => ({ id: String(d), type: 'default', text: 'День ' + (d + 1) })),
       { id: 'cancel', type: 'cancel' },
     ],
   }, (id) => {
     if (id === 'cancel' || id == null) return;
     startWorkoutFromProgram(_pid, parseInt(id));
   });
 } else {
   startWorkoutFromProgram(_pid, _days[0] ?? null);
 }
 });
 });'''
assert old in c, 'program-item click handler not found'
c = c.replace(old, new, 1)
print('day picker OK')

assert len(c) > orig, 'no growth'
with io.open(path, 'w', encoding='utf-8', newline='') as f:
    f.write(c)

print('PATCH OK, size:', len(c))
with open(path, 'rb') as f:
    fb = f.read(4)
    print('First bytes:', fb.hex(), '- BOM' if fb.startswith(b'\xef\xbb\xbf') else '- OK')