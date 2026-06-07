import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# 1. Move SETTINGS and SYS TIME to top right corner (y=0)
old_settings = """    const soundText = uiState.soundOn ? '[ SOUND: ON ]' : '[ SOUND: MUTED ]'
    const topBarRight = `[ SETTINGS ]  ${soundText}  [ ← BACK ]`
    const startXTop = COLS - topBarRight.length - 2
    const hx = hoverRef.current.x
    const hy = hoverRef.current.y
    
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    writeUI(COLS - 14, 5, timeStr, 3);
    
    const isHoverSettings = hy === 6 && hx >= startXTop && hx <= startXTop + 11
    const isHoverSound = hy === 6 && hx >= startXTop + 14 && hx < startXTop + 14 + soundText.length
    const isHoverBack = hy === 6 && hx >= startXTop + 14 + soundText.length + 2 && hx < startXTop + 14 + soundText.length + 2 + 10
    
    writeUI(startXTop, 6, '[ SETTINGS ]', isHoverSettings ? 2 : 0)
    writeUI(startXTop + 14, 6, soundText, isHoverSound ? 2 : 0)
    writeUI(startXTop + 14 + soundText.length + 2, 6, '[ ← BACK ]', isHoverBack ? 2 : 0)"""

new_settings = """    const soundText = uiState.soundOn ? '[ SOUND: ON ]' : '[ SOUND: MUTED ]'
    const topBarRight = `[ SETTINGS ]  ${soundText}  [ ← BACK ]`
    const startXTop = COLS - topBarRight.length - 2
    const hx = hoverRef.current.x
    const hy = hoverRef.current.y
    
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    writeUI(startXTop - 12, 1, timeStr, 3);
    
    const isHoverSettings = hy === 1 && hx >= startXTop && hx <= startXTop + 11
    const isHoverSound = hy === 1 && hx >= startXTop + 14 && hx < startXTop + 14 + soundText.length
    const isHoverBack = hy === 1 && hx >= startXTop + 14 + soundText.length + 2 && hx < startXTop + 14 + soundText.length + 2 + 10
    
    writeUI(startXTop, 1, '[ SETTINGS ]', isHoverSettings ? 2 : 0)
    writeUI(startXTop + 14, 1, soundText, isHoverSound ? 2 : 0)
    writeUI(startXTop + 14 + soundText.length + 2, 1, '[ ← BACK ]', isHoverBack ? 2 : 0)"""
content = content.replace(old_settings, new_settings)

# 2. Expand DIRECTORY and PREVIEW boxes
old_boxes = """    const navW = 25;
    drawBoxUI(0, 7, navW, 19, 'DIRECTORY');
    
    DIRECTORY.forEach((item, i) => {
        const isHovered = !uiState.settingsOpen && hy === 9 + i && hx > 0 && hx < navW;
        const isSelected = uiState.selectedNavIdx === i;
        let color = 0; // Use bright foreground for unselected to make it prominent
        if (isHovered || (isSelected && uiState.focusColumn === 1)) color = 2;
        else if (isSelected) color = 0;
        writeUI(2, 9 + i, `[${isSelected ? '*' : ' '}] ${item.name}`, color);
    });

    const previewW = COLS - navW;
    drawBoxUI(navW, 7, previewW, 19, 'PREVIEW');"""

new_boxes = """    const navW = 25;
    const boxY = 6;
    const boxH = 20;
    drawBoxUI(0, boxY, navW, boxH, 'DIRECTORY');
    
    DIRECTORY.forEach((item, i) => {
        const isHovered = !uiState.settingsOpen && hy === boxY + 2 + i && hx > 0 && hx < navW;
        const isSelected = uiState.selectedNavIdx === i;
        let color = 0; // Use bright foreground for unselected to make it prominent
        if (isHovered || (isSelected && uiState.focusColumn === 1)) color = 2;
        else if (isSelected) color = 0;
        writeUI(2, boxY + 2 + i, `[${isSelected ? '*' : ' '}] ${item.name}`, color);
    });

    const previewW = COLS - navW;
    drawBoxUI(navW, boxY, previewW, boxH, 'PREVIEW');"""
content = content.replace(old_boxes, new_boxes)

# 3. Fix 06. CONTACT -> 05. CONTACT
old_contact = "name: '06. CONTACT'"
new_contact = "name: '05. CONTACT'"
content = content.replace(old_contact, new_contact)

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)

print("Patch 10 applied (Part 1).")
