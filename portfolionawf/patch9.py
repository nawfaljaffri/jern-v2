import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# 1. Remove OS, MEM, CORES, CPU and move SYS TIME above settings
old_stats = """    writeUI(COLS - 30, 1, `OS: ${sysInfo.os}`, 3);
    writeUI(COLS - 30, 2, `MEM: ${sysInfo.mem} GB`, 3);
    writeUI(COLS - 30, 3, `CORES: ${sysInfo.cores}`, 3);
    
    const nowSec = Date.now() / 1000;
    const noise = Math.sin(nowSec * 1.5) * 0.5 + Math.sin(nowSec * 4.2) * 0.3 + Math.sin(nowSec * 12.1) * 0.2;
    const cpuVal = Math.min(100, Math.max(0, Math.floor(Math.abs(noise) * 100)));
    const cpuBars = Math.floor(cpuVal / 10);
    let barStr = '';
    for(let i=0; i<10; i++) barStr += i < cpuBars ? '█' : ' ';
    writeUI(COLS - 30, 4, `CPU: [${barStr}] ${cpuVal.toString().padStart(2, '0')}%`, 3);

    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    writeUI(COLS - 30, 5, `SYS TIME: ${timeStr}`, 3);"""

content = content.replace(old_stats, "")

# 2. Add SYS TIME above settings
old_settings = """    const soundText = uiState.soundOn ? '[ SOUND: ON ]' : '[ SOUND: MUTED ]'
    const topBarRight = `[ SETTINGS ]  ${soundText}  [ ← BACK ]`
    const startXTop = COLS - topBarRight.length - 2
    const hx = hoverRef.current.x
    const hy = hoverRef.current.y
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
    writeUI(COLS - 14, 5, timeStr, 3);
    
    const isHoverSettings = hy === 6 && hx >= startXTop && hx <= startXTop + 11
    const isHoverSound = hy === 6 && hx >= startXTop + 14 && hx < startXTop + 14 + soundText.length
    const isHoverBack = hy === 6 && hx >= startXTop + 14 + soundText.length + 2 && hx < startXTop + 14 + soundText.length + 2 + 10
    
    writeUI(startXTop, 6, '[ SETTINGS ]', isHoverSettings ? 2 : 0)
    writeUI(startXTop + 14, 6, soundText, isHoverSound ? 2 : 0)
    writeUI(startXTop + 14 + soundText.length + 2, 6, '[ ← BACK ]', isHoverBack ? 2 : 0)"""

content = content.replace(old_settings, new_settings)

# 3. Move [ CREATIVE / ENGINEER ] from row 6 to row 4
old_subtitle = """writeUI(2, 6, "[ CREATIVE / ENGINEER ]", 1);"""
new_subtitle = """writeUI(2, 4, "[ CREATIVE / ENGINEER ]", 1);"""
content = content.replace(old_subtitle, new_subtitle)

# 4. Remove subtitle in PREVIEW for Page
old_preview_page = """            if (node.type === 'page') {
                writeUI(pStartX, pStartY, `:: ${node.name.replace(/[0-9.]/g, '').trim()} ::`, 0);
                writeUI(pStartX, pStartY+1, ''.padEnd(pWidth, '─'), 1);
                
                node.content.forEach((line: string, i: number) => {
                    writeUI(pStartX, pStartY + 3 + i, line, 0);
                });
            }"""

new_preview_page = """            if (node.type === 'page') {
                node.content.forEach((line: string, i: number) => {
                    writeUI(pStartX, pStartY + i, line, 0);
                });
            }"""
content = content.replace(old_preview_page, new_preview_page)

# 5. Remove subtitle in PREVIEW for Folder
old_preview_folder = """            } else if (node.type === 'folder') {
                writeUI(pStartX, pStartY, `:: ${node.name.replace(/[0-9.]/g, '').trim()} ::`, 0);
                writeUI(pStartX, pStartY+1, ''.padEnd(pWidth, '─'), 1);
                
                const child = node.children[uiState.selectedSubIdx];
                let offsetP = 3;"""

new_preview_folder = """            } else if (node.type === 'folder') {
                const child = node.children[uiState.selectedSubIdx];
                let offsetP = 0;"""
content = content.replace(old_preview_folder, new_preview_folder)

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)

print("Patch 9 applied.")
