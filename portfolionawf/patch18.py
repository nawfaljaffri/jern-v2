import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# 1. Update Default THEME
old_white = "{ name: 'WHITE',  fg: '#FFFFFF', bg: '#000000', dim: '#666666', bloom: 0.46, radius: 1.80, thresh: 0.30, burnIn: 0.80, bright: 1.115, satur: 1.24, crush: 0.30, grain: 0.15, curve: 0.20 }"
new_white = "{ name: 'WHITE',  fg: '#FFFFFF', bg: '#000000', dim: '#666666', bloom: 0.23, radius: 0.65, thresh: 0.55, burnIn: 0.80, bright: 0.31, satur: 0.62, crush: 0.35, grain: 0.15, curve: 0.20 }"
content = content.replace(old_white, new_white)

# 2. Fix top bar Y coords
content = content.replace("writeUI(startXTop - 12, 1, timeStr, 3);", "writeUI(startXTop - 12, 0, timeStr, 3);")
content = content.replace("const isHoverSettings = hy === 1 &&", "const isHoverSettings = hy === 0 &&")
content = content.replace("const isHoverSound = hy === 1 &&", "const isHoverSound = hy === 0 &&")
content = content.replace("const isHoverBack = hy === 1 &&", "const isHoverBack = hy === 0 &&")
content = content.replace("writeUI(startXTop, 1, '[ SETTINGS ]'", "writeUI(startXTop, 0, '[ SETTINGS ]'")
content = content.replace("writeUI(startXTop + 14, 1, soundText", "writeUI(startXTop + 14, 0, soundText")
content = content.replace("writeUI(startXTop + 14 + soundText.length + 2, 1, '[ ← BACK ]'", "writeUI(startXTop + 14 + soundText.length + 2, 0, '[ ← BACK ]'")

# 3. Fix contentStartY
content = content.replace("const contentStartY = boxY + 1;", "const contentStartY = boxY + 2;")

# 4. Fix click handlers
content = content.replace("if (gridY === 1 && isClick) {", "if (gridY === 0 && isClick) {")
content = content.replace("if (gridY >= 5 && gridY < 27) {", "if (gridY >= 4 && gridY < 27) {")
content = content.replace("const idx = gridY - 5;", "const idx = gridY - 4;")
content = content.replace("const idx = Math.floor((gridY - 5 + uiState.scrollOffset) / lineDist);", "const idx = Math.floor((gridY - 4 + uiState.scrollOffset) / lineDist);")
content = content.replace("(gridY - 5 + uiState.scrollOffset) % lineDist === 0", "(gridY - 4 + uiState.scrollOffset) % lineDist === 0")

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)

print("Patch 18 step 1 applied.")
