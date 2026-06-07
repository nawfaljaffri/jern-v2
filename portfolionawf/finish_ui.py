import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# Replace the ASCII logo
ascii_start = content.find('const nameAscii1 =')
ascii_end = content.find('writeUI(38, 7, "[ CREATIVE / ENGINEER ]", 1);') + len('writeUI(38, 7, "[ CREATIVE / ENGINEER ]", 1);')

if ascii_start != -1 and ascii_end != -1:
    new_ascii = """writeUI(2, 2, "NAWFAL JAFFRI", 0);
    writeUI(2, 3, "[ CREATIVE / ENGINEER ]", 1);"""
    content = content[:ascii_start] + new_ascii + content[ascii_end:]

# Replace boxY = 9 to boxY = 5
content = content.replace('const boxY = 9;', 'const boxY = 5;')

# Replace height 17 with 21 in drawBoxUI and drawScrollbar
content = content.replace("drawBoxUI(0, boxY, navW, 17, 'DIRECTORY');", "drawBoxUI(0, boxY, navW, 21, 'DIRECTORY');")
content = content.replace("drawBoxUI(navW, boxY, previewW, 17, 'PREVIEW');", "drawBoxUI(navW, boxY, previewW, 21, 'PREVIEW');")
content = content.replace("drawScrollbar(COLS - 2, boxY + 1, 15, ", "drawScrollbar(COLS - 2, boxY + 1, 19, ")
content = content.replace("offset, 15);", "offset, 19);")
content = content.replace("if (y >= boxY + 1 && y <= boxY + 15) {", "if (y >= boxY + 1 && y <= boxY + 19) {")
content = content.replace("if (y + 1 <= boxY + 15) writeUI", "if (y + 1 <= boxY + 19) writeUI")
content = content.replace("if (gridY >= boxY && gridY < boxY + 17) {", "if (gridY >= boxY && gridY < boxY + 21) {")

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)

print("UI finalized.")
