with open('app/coding/page.tsx', 'r') as f:
    lines = f.readlines()

draw_start = -1
draw_end = -1
page_start = -1
page_end = -1

for i, line in enumerate(lines):
    if "writeUI(COLS / 2 - 4, 0, `┤${timeStr}├`, 0)" in line:
        draw_start = i
    if "writeUI(startX + 14 + soundText.length + 2, 1, '[ ← BACK ]', isHoverBack ? 2 : 0)" in line:
        draw_end = i
    if "if (node.type === 'page') {" in line:
        page_start = i
    if "} else if (node.type === 'folder') {" in line:
        page_end = i

print(f"Draw: {draw_start} to {draw_end}")
print(f"Page: {page_start} to {page_end}")
