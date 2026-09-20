with open('app-v5.js', 'r', encoding='utf-8') as f:
    src = f.read()

old = """ const navTrainer = document.getElementById('nav-trainer');
 if (navTrainer) navTrainer.classList.toggle('hidden', me.role !== 'trainer');"""

assert old in src, 'marker not found'

new = """ const navTrainer = document.getElementById('nav-trainer');
 const nav = document.getElementById('bottom-nav');
 if (me.role === 'trainer') {
 if (navTrainer) navTrainer.classList.remove('hidden');
 if (nav) nav.className = nav.className.replace('grid-cols-4', 'grid-cols-5');
 } else {
 if (navTrainer) navTrainer.classList.add('hidden');
 if (nav) nav.className = nav.className.replace('grid-cols-5', 'grid-cols-4');
 }"""

src = src.replace(old, new, 1)

with open('app-v5.js', 'w', encoding='utf-8') as f:
    f.write(src)

print('JS OK: dynamic grid')