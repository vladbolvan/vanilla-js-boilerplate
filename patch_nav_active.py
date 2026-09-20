with open('app-v5.js', 'r', encoding='utf-8') as f:
    src = f.read()

old = " document.getElementById('nav-' + name)?.classList.add('active');"
assert old in src, 'marker not found'

new = """ const navName = name === 'trainer-clients' ? 'trainer' : name;
 document.getElementById('nav-' + navName)?.classList.add('active');"""

src = src.replace(old, new, 1)

with open('app-v5.js', 'w', encoding='utf-8') as f:
    f.write(src)

print('PATCH OK: nav-trainer active highlight')