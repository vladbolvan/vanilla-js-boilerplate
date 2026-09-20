with open('app-v5.js', 'r', encoding='utf-8') as f:
    src = f.read()

# PATCH: render last-set hint based on stored we.lastWeight/lastReps
old = '<p class="last-set-hint hidden text-xs text-muted mb-1"></p>'
assert old in src, "marker not found"

new = (
    '${(ex.lastWeight != null && ex.lastReps != null) '
    '? `<p class="last-set-hint text-xs text-muted mb-1">\u041f\u0440\u043e\u0448\u043b\u044b\u0439 \u0440\u0430\u0437: ${ex.lastWeight} \u043a\u0433 \u00d7 ${ex.lastReps}</p>` '
    ': `<p class="last-set-hint hidden text-xs text-muted mb-1"></p>`}'
)

count = src.count(old)
print(f"marker occurrences: {count}")
src = src.replace(old, new)

with open('app-v5.js', 'w', encoding='utf-8') as f:
    f.write(src)

print("PATCH OK: last-set hint rendered from stored we.lastWeight/lastReps")