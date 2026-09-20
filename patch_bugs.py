with open('app-v5.js', 'r', encoding='utf-8') as f:
    src = f.read()

# ============ PATCH 1a (idempotent): detailBackScreen var ============
if 'let detailBackScreen' not in src:
    marker = "let currentDetailWorkoutId = null;"
    assert marker in src, "1a: marker not found"
    src = src.replace(marker, marker + "\nlet detailBackScreen = 'history';", 1)
    print("PATCH1a OK: detailBackScreen var added")
else:
    print("PATCH1a SKIP: already there")

# ============ PATCH 1b: openWorkoutDetail signature ============
old = "function openWorkoutDetail(workoutId) {"
if old in src:
    src = src.replace(old, "function openWorkoutDetail(workoutId, backScreen = 'history') {", 1)
    print("PATCH1b OK: openWorkoutDetail signature")
else:
    print("PATCH1b SKIP: already changed")

# ============ PATCH 1c: set detailBackScreen on open ============
old = "currentDetailWorkoutId = workoutId;"
assert old in src, "1c: currentDetailWorkoutId = workoutId not found"
if "detailBackScreen = backScreen;" not in src:
    src = src.replace(
        old,
        "currentDetailWorkoutId = workoutId;\ndetailBackScreen = backScreen;",
        1,
    )
    print("PATCH1c OK: detailBackScreen set")
else:
    print("PATCH1c SKIP: already there")

# ============ PATCH 1d: recent-open -> back home ============
# unique: "openWorkoutDetail(wid);" appears twice (recent + calendar day list).
# For recent (home) handler we want 'home'; for calendar one — 'calendar'.
# Disambiguate by looking at surrounding context.
if "openWorkoutDetail(wid, 'home');" not in src:
    # recent uses await ensureWorkoutsLoaded(); openWorkoutDetail(wid);
    # calendar uses await ensureWorkoutsLoaded(); openWorkoutDetail(wid);
    # BUT recent is inside recentListEl handler, calendar inside calendarDayListEl.
    # Use index-based replace: first occurrence = recent, second = calendar.
    needle = "openWorkoutDetail(wid);"
    idx1 = src.find(needle)
    assert idx1 != -1, "1d: first occurrence not found"
    idx2 = src.find(needle, idx1 + len(needle))
    assert idx2 != -1, "1d: second occurrence not found"
    # replace second first (higher index) to keep idx1 valid
    src = src[:idx2] + "openWorkoutDetail(wid, 'calendar');" + src[idx2 + len(needle):]
    src = src[:idx1] + "openWorkoutDetail(wid, 'home');" + src[idx1 + len(needle):]
    print("PATCH1d OK: recent -> home, calendar-list -> calendar")
else:
    print("PATCH1d SKIP")

# ============ PATCH 1e: calendar single-workout -> back to calendar ============
old = "openWorkoutDetail(info.workouts[0].workout_id);"
if old in src:
    src = src.replace(old, "openWorkoutDetail(info.workouts[0].workout_id, 'calendar');", 1)
    print("PATCH1e OK: calendar single -> calendar")
else:
    print("PATCH1e SKIP")

# ============ PATCH 1g: back-to-history button uses detailBackScreen ============
old = """document.getElementById('back-to-history')?.addEventListener('click', () => {
 showScreen('history');
});"""
if old in src:
    new = """document.getElementById('back-to-history')?.addEventListener('click', () => {
 if (detailBackScreen === 'calendar') {
 showScreen('calendar');
 renderCalendar(calYear, calMonth);
 } else if (detailBackScreen === 'home') {
 showScreen('home');
 } else {
 showScreen('history');
 }
});"""
    src = src.replace(old, new, 1)
    print("PATCH1g OK: back button uses detailBackScreen")
else:
    print("PATCH1g SKIP: not found")

# ============ PATCH 3: fillLastSet always on load ============
old = """for (const we of workoutExercises) {
 if (we.sets.length === 0) {
 fillLastSet(we.id);
 }
 }"""
if old in src:
    new = """for (const we of workoutExercises) {
 fillLastSet(we.id);
 }"""
    src = src.replace(old, new, 1)
    print("PATCH3 OK: fillLastSet for all exercises on load")
else:
    print("PATCH3 SKIP: pattern not found (check manually)")

with open('app-v5.js', 'w', encoding='utf-8') as f:
    f.write(src)

print("ALL DONE")