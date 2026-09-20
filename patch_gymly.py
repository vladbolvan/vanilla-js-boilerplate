import os

# PATCH 1: remove auto-open programs sheet after onboarding
with open('app-v4.js', 'r', encoding='utf-8') as f:
    js = f.read()

old_line = "setTimeout(function(){ try { openProgramsSheet(); } catch(e) {} }, 400);"
if old_line not in js:
    print("PATCH1: setTimeout line not found!")
    raise SystemExit(1)
js = js.replace(old_line, "")
with open('app-v4.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("PATCH1 OK: auto-open removed")

# PATCH 2-4: index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

def replace_first_svg_after(html, marker, new_html):
    pos = html.find(marker)
    if pos == -1:
        raise ValueError("marker not found: " + marker)
    svg_start = html.find('<svg', pos)
    if svg_start == -1:
        raise ValueError("<svg> not found after " + marker)
    svg_end = html.find('</svg>', svg_start)
    if svg_end == -1:
        raise ValueError("</svg> not found after " + marker)
    svg_end += len('</svg>')
    return html[:svg_start] + new_html + html[svg_end:]

# PATCH 2: weight icon -> scales
new_weight_svg = (
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" '
    'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'
    '<path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/>'
    '<path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/>'
    '<path d="M7 21h10"/>'
    '<path d="M12 3v18"/>'
    '<path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>'
    '</svg>'
)
html = replace_first_svg_after(html, 'id="home-add-weight"', new_weight_svg)
print("PATCH2 OK: weight icon -> scales")

# PATCH 3: nav AI icon -> text AI
new_nav_ai = '<span class="text-[15px] font-bold tracking-tight leading-none">AI</span>'
html = replace_first_svg_after(html, 'id="nav-ai"', new_nav_ai)
print("PATCH3 OK: nav AI -> text")

# PATCH 4: AI screen header icon -> AI badge
new_ai_badge = (
    '<span class="inline-flex items-center justify-center w-8 h-8 rounded-xl '
    'bg-primary/15 text-primary2 text-[13px] font-bold tracking-tight">AI</span>'
)
html = replace_first_svg_after(html, 'id="screen-ai"', new_ai_badge)
print("PATCH4 OK: AI header -> badge")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# PATCH 5: rename app-v4.js -> app-v5.js
if os.path.exists('app-v5.js'):
    print("ERROR: app-v5.js already exists")
    raise SystemExit(1)
os.rename('app-v4.js', 'app-v5.js')
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()
html = html.replace('app-v4.js', 'app-v5.js')
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("PATCH5 OK: renamed app-v4.js -> app-v5.js")

print("ALL DONE")