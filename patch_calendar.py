# ============ PATCH 1: expose clearCalendarCache to window ============
with open('app-v5.js', 'r', encoding='utf-8') as f:
    src = f.read()

old = "const calendarCache = new Map();"
assert old in src, "app-v5.js: calendarCache marker not found"
if "window.clearCalendarCache" not in src:
    src = src.replace(
        old,
        old + "\nwindow.clearCalendarCache = () => calendarCache.clear();",
        1,
    )
    with open('app-v5.js', 'w', encoding='utf-8') as f:
        f.write(src)
    print("PATCH1 OK: window.clearCalendarCache exposed")
else:
    print("PATCH1 SKIP: already exposed")


# ============ PATCH 2: clear cache after saving food via AI ============
with open('js/ai.js', 'r', encoding='utf-8') as f:
    src = f.read()

needle = "API_URL + '/api/nutrition/save'"
idx = src.find(needle)
assert idx != -1, "ai.js: /api/nutrition/save not found"

iok = src.find("if (!res.ok)", idx)
assert iok != -1, "ai.js: if (!res.ok) after save not found"

eol = src.find("\n", iok)
assert eol != -1, "ai.js: end of line not found"

if "clearCalendarCache" not in src[iok:iok+300]:
    insert = "\n      try { if (window.clearCalendarCache) window.clearCalendarCache(); } catch (_) {}"
    src = src[:eol] + insert + src[eol:]
    with open('js/ai.js', 'w', encoding='utf-8') as f:
        f.write(src)
    print("PATCH2 OK: ai.js clears calendar cache after save")
else:
    print("PATCH2 SKIP: already there")


# ============ PATCH 3: clear cache after deleting food entry ============
with open('js/nutrition.js', 'r', encoding='utf-8') as f:
    src = f.read()

needle = "API_URL + '/api/nutrition/' + id"
idx = src.find(needle)
assert idx != -1, "nutrition.js: DELETE endpoint not found"

iok = src.find("if (!res.ok)", idx)
assert iok != -1, "nutrition.js: if (!res.ok) after delete not found"

eol = src.find("\n", iok)
assert eol != -1, "nutrition.js: end of line not found"

if "clearCalendarCache" not in src[iok:iok+300]:
    insert = "\n      try { if (window.clearCalendarCache) window.clearCalendarCache(); } catch (_) {}"
    src = src[:eol] + insert + src[eol:]
    with open('js/nutrition.js', 'w', encoding='utf-8') as f:
        f.write(src)
    print("PATCH3 OK: nutrition.js clears calendar cache after delete")
else:
    print("PATCH3 SKIP: already there")

print("ALL DONE")