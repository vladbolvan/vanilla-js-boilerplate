with open('index.html', 'r', encoding='utf-8') as f:
    src = f.read()

# ============ 1. Шаг "Кто ты?" в онбординге ============
onb_idx = src.find('id="screen-onboarding"')
assert onb_idx != -1, 'HTML1: onboarding not found'
space_idx = src.find('<div class="space-y-5">', onb_idx)
assert space_idx != -1, 'HTML1: space-y-5 not found'
line_start = src.rfind('\n', 0, space_idx) + 1

role_block = ''' <div class="mb-5">
 <p class="text-[10px] uppercase tracking-wider text-muted2 mb-2">Кто ты?</p>
 <div class="grid grid-cols-2 gap-2">
 <button data-ob-role="user" class="py-3.5 rounded-2xl text-sm font-medium transition
 border bg-surface2 text-muted border-white/5">
 Тренируюсь для себя
 </button>
 <button data-ob-role="trainer" class="py-3.5 rounded-2xl text-sm font-medium transition
 border bg-surface2 text-muted border-white/5">
 Я тренер
 </button>
 </div>
 </div>

'''
src = src[:line_start] + role_block + src[line_start:]
print('HTML1 OK: role chooser added to onboarding')

# ============ 2. nav-trainer после nav-calendar ============
nav_cal = '<button id="nav-calendar" class="nav-btn py-2.5">'
nav_cal_idx = src.find(nav_cal)
assert nav_cal_idx != -1, 'HTML2: nav-calendar not found'
nav_close = src.find('</button>', nav_cal_idx)
assert nav_close != -1, 'HTML2: </button> after nav-calendar not found'
nav_close += len('</button>')

trainer_nav = '''

 <button id="nav-trainer" class="nav-btn py-2.5 hidden">
 <div class="nav-icon-bg">
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
 <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
 <circle cx="9" cy="7" r="4"/>
 <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
 <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
 </svg>
 </div>
 <span class="nav-label text-[10px] font-medium">Клиенты</span>
 </button>'''
src = src[:nav_close] + trainer_nav + src[nav_close:]
print('HTML2 OK: nav-trainer added')

# ============ 3. Экран Мои клиенты ============
nav_bottom = '<nav id="bottom-nav"'
nav_bottom_idx = src.find(nav_bottom)
assert nav_bottom_idx != -1, 'HTML3: bottom-nav not found'
line_start = src.rfind('\n', 0, nav_bottom_idx) + 1

clients_screen = ''' <!-- ЭКРАН: МОИ КЛИЕНТЫ (тренер) -->
 <div id="screen-trainer-clients" class="hidden-screen">
 <header class="mb-6 h-9 flex items-center justify-between">
 <h1 class="text-[26px] font-bold tracking-tight">Мои клиенты</h1>
 <button id="add-client-btn" class="inline-flex items-center justify-center gap-1.5
 bg-primary/12 hover:bg-primary/18 text-primary2
 rounded-2xl px-3.5 py-2 text-sm font-medium
 active:scale-95 transition
 border border-primary/20">
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
 Добавить
 </button>
 </header>
 <div id="trainer-clients-list" class="space-y-3">
 <p class="text-muted text-center py-8">Загрузка...</p>
 </div>
 <p class="text-[10px] text-muted2 text-center mt-6 uppercase tracking-wider">
 Клиенты, которых ты пригласил
 </p>
 </div>

'''
src = src[:line_start] + clients_screen + src[line_start:]
print('HTML3 OK: trainer-clients screen added')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(src)
print('ALL DONE')