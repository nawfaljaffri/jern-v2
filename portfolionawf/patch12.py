import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# 1. Update DIRECTORY ABOUT page to include NAWFAL ascii
old_about = """    content: [
      'Currently navigating the intersection of machine learning,',
      'data, management, and branding. I build systems that',
      'bridge the gap between algorithmic precision and',
      'human-centric design.',"""
new_about = """    content: [
      "░██  ░█    ░██   ░█       ░█  ░██████    ░██   ░█     ",
      "░███ ░█   ░█░█   ░█   ░█  ░█  ░█        ░█░█   ░█     ",
      "░█░█ ░█  ░█  ░█  ░█  ░█░  ░█  ░█████   ░█  ░█  ░█     ",
      "░█ ░███ ░██████  ░█ ░█ ░█ ░█  ░█      ░██████  ░█     ",
      "░█  ░██ ░█    ░█  ░██   ░██   ░█      ░█    ░█ ░██████",
      "",
      "[ CREATIVE / ENGINEER ]",
      "",
      'Currently navigating the intersection of machine learning,',
      'data, management, and branding. I build systems that',
      'bridge the gap between algorithmic precision and',
      'human-centric design.',"""
content = content.replace(old_about, new_about)

# 2. Remove old [ CREATIVE / ENGINEER ] and set boxY to 3, boxH to 25
old_box_setup = """    writeUI(2, 4, "[ CREATIVE / ENGINEER ]", 1);
    


    const soundText = uiState.soundOn ? '[ SOUND: ON ]' : '[ SOUND: MUTED ]'
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
    writeUI(startXTop + 14 + soundText.length + 2, 1, '[ ← BACK ]', isHoverBack ? 2 : 0)

    const navW = 25;
    const boxY = 6;
    const boxH = 20;"""

new_box_setup = """    const soundText = uiState.soundOn ? '[ SOUND: ON ]' : '[ SOUND: MUTED ]'
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
    writeUI(startXTop + 14 + soundText.length + 2, 1, '[ ← BACK ]', isHoverBack ? 2 : 0)

    const navW = 25;
    const boxY = 3;
    const boxH = 24;"""
content = content.replace(old_box_setup, new_box_setup)

# 3. Fix drawScrollbar parameters and node rendering block
# First, let's grab everything from `const drawScrollbar` up to the end of `if (node)` block
start_idx = content.find("const drawScrollbar =")
end_idx = content.find("const yOffset = Math.max(0, Math.floor((ROWS - 30) / 2));", start_idx)

# Wait, `content.find("    const terminalW")` is right after `if (node)` block
# Let's search for "    const terminalW" to find the end of the node rendering.
terminalW_idx = content.find("const terminalW = 25;")
if terminalW_idx == -1:
    terminalW_idx = content.find("    const terminalW =")

if terminalW_idx > start_idx:
    old_render_block = content[start_idx:terminalW_idx]

    new_render_block = """const drawScrollbar = (x: number, y: number, h: number, contentLines: number, offset: number, viewLines: number) => {
        for(let i=0; i<h; i++) writeUI(x, y+i, '│', 1);
        if (contentLines <= viewLines) {
            writeUI(x, y, '█', 0);
        } else {
            const thumbH = Math.max(1, Math.floor((viewLines / contentLines) * h));
            const maxOffset = contentLines - viewLines;
            const clampedOffset = Math.max(0, Math.min(maxOffset, offset));
            const thumbY = Math.floor((clampedOffset / maxOffset) * (h - thumbH));
            for(let i=0; i<thumbH; i++) writeUI(x, y + thumbY + i, '█', 0);
        }
    };

    if (node) {
        const contentStartY = boxY + 2;
        const contentMaxY = boxY + boxH - 2;
        const viewLines = contentMaxY - contentStartY + 1;
        
        if (node.type === 'page') {
            if (node.content) {
                node.content.forEach((line: string, i: number) => {
                    const y = contentStartY + i - uiState.scrollOffset;
                    if (y >= contentStartY && y <= contentMaxY) {
                        writeUI(pStartX, y, line.substring(0, pWidth), 0);
                    }
                });
                drawScrollbar(COLS - 2, contentStartY, viewLines, node.content.length, uiState.scrollOffset, viewLines);
            }
        } else if (node.type === 'folder') {
            if (node.name.includes('ARTWORKS')) {
                if (node.children) {
                    const itemH = 15;
                    const totalLines = node.children.length * itemH;
                    node.children.forEach((art: any, i: number) => {
                        const startY = contentStartY + i * itemH - uiState.scrollOffset;
                        if (startY + itemH >= contentStartY && startY <= contentMaxY) {
                            if (startY >= contentStartY && startY <= contentMaxY) writeUI(pStartX, startY, `[ ${art.name} ]`, 0);
                            const assetH = 12;
                            for(let r=0; r<assetH; r++) {
                                const yy = startY + 2 + r;
                                if (yy >= contentStartY && yy <= contentMaxY) {
                                    if (r === 0 || r === assetH-1) writeUI(pStartX, yy, '░'.repeat(pWidth), 0);
                                    else writeUI(pStartX, yy, '░' + ' '.repeat(pWidth-2) + '░', 0);
                                    if (r === Math.floor(assetH/2)) {
                                        writeUI(pStartX + Math.floor(pWidth/2) - 13, yy, "[ VISUAL ASSET RENDER ZONE ]", 0);
                                    }
                                }
                            }
                        }
                    });
                    drawScrollbar(COLS - 2, contentStartY, viewLines, totalLines, uiState.scrollOffset, viewLines);
                }
            } else {
                const listW = 24;
                const detailStartX = pStartX + listW;
                const detailWidth = pWidth - listW;
                
                if (node.children) {
                    node.children.forEach((proj: any, i: number) => {
                        const lineDist = 1;
                        const y = contentStartY + i * lineDist - uiState.scrollOffset;
                        if (y >= contentStartY && y <= contentMaxY) {
                            const isHovered = !uiState.settingsOpen && hy === y && hx >= pStartX && hx < pStartX + listW - 2;
                            const isSelected = uiState.selectedProjectIdx === i;
                            let color = 1;
                            if (isHovered || (isSelected && uiState.focusColumn === 2)) color = 2;
                            else if (isSelected) color = 0;
                            writeUI(pStartX, y, `[${isSelected ? '>' : ' '}] ${proj.name.substring(0, listW - 6)}`, color);
                        }
                    });
                    drawScrollbar(pStartX + listW - 2, contentStartY, viewLines, node.children.length, uiState.scrollOffset, viewLines);
                }
                
                const proj = node.children && node.children[uiState.selectedProjectIdx];
                if (proj) {
                    let offsetP = 0;
                    
                    if (proj.asciiArt) {
                        proj.asciiArt.forEach((line: string) => {
                            writeUI(detailStartX + 4, contentStartY + offsetP++, line, 2);
                        });
                        offsetP++;
                    }
                    
                    writeUI(detailStartX, contentStartY + offsetP++, `DATE: ${proj.date}`, 3);
                    writeUI(detailStartX, contentStartY + offsetP++, `TECH: ${proj.lang}`, 3);
                    writeUI(detailStartX, contentStartY + offsetP++, `STAT: ${proj.status}`, 3);
                    offsetP++;
                    
                    const words = proj.desc.split(' ');
                    let currentLine = '';
                    words.forEach((word: string) => {
                        if (currentLine.length + word.length + 1 <= detailWidth) {
                            currentLine += (currentLine.length > 0 ? ' ' : '') + word;
                        } else {
                            writeUI(detailStartX, contentStartY + offsetP++, currentLine, 0);
                            currentLine = word;
                        }
                    });
                    if (currentLine) writeUI(detailStartX, contentStartY + offsetP++, currentLine, 0);
                    
                    offsetP++;
                    writeUI(detailStartX, contentStartY + offsetP++, proj.links, 0);
                }
            }
        }
    }

    """
    content = content.replace(old_render_block, new_render_block)

# 4. Fix event handlers in handlePointerInteraction
old_event_settings = """    if (gridY === 6 && isClick) {"""
new_event_settings = """    if (gridY === 1 && isClick) {"""
content = content.replace(old_event_settings, new_event_settings)

old_event_dir = """    if (isClick && !uiState.settingsOpen) {
        if (gridY >= 9 && gridY < 26) {
            if (gridX > 0 && gridX < navW) {
                const idx = gridY - 9;"""
new_event_dir = """    if (isClick && !uiState.settingsOpen) {
        if (gridY >= 5 && gridY < 27) {
            if (gridX > 0 && gridX < navW) {
                const idx = gridY - 5;"""
content = content.replace(old_event_dir, new_event_dir)

old_event_proj = """                        const idx = Math.floor((gridY - 12 + uiState.scrollOffset) / lineDist);
                        if (idx >= 0 && idx < node.children.length && (gridY - 12 + uiState.scrollOffset) % lineDist === 0) {"""
new_event_proj = """                        const idx = Math.floor((gridY - 5 + uiState.scrollOffset) / lineDist);
                        if (idx >= 0 && idx < node.children.length && (gridY - 5 + uiState.scrollOffset) % lineDist === 0) {"""
content = content.replace(old_event_proj, new_event_proj)

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)

print("Patch 12 applied.")
