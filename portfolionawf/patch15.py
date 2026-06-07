import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# 1. Remove NAWFAL from ABOUT
old_about = """    content: [
      "░██  ░█    ░██   ░█       ░█  ░██████    ░██   ░█     ",
      "░███ ░█   ░█░█   ░█   ░█  ░█  ░█        ░█░█   ░█     ",
      "░█░█ ░█  ░█  ░█  ░█  ░█░  ░█  ░█████   ░█  ░█  ░█     ",
      "░█ ░███ ░██████  ░█ ░█ ░█ ░█  ░█      ░██████  ░█     ",
      "░█  ░██ ░█    ░█  ░██   ░██   ░█      ░█    ░█ ░██████",
      "",
      "[ CREATIVE / ENGINEER ]",
      "",
      'Currently navigating the intersection of machine learning,',"""
new_about = """    content: [
      "[ CREATIVE / ENGINEER ]",
      "",
      'Currently navigating the intersection of machine learning,',"""

if old_about in content:
    content = content.replace(old_about, new_about)

# 2. Fix if (node) block. We know it starts at line 640.
start_idx = content.find("    if (node) {")
end_idx = content.find("    const yOffset = Math.max(0, Math.floor((ROWS - 30) / 2));", start_idx)

if start_idx != -1 and end_idx != -1:
    old_block = content[start_idx:end_idx]
    new_block = """    if (node) {
        const contentStartY = boxY + 1;
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
    content = content.replace(old_block, new_block)

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)

print("Patch 15 applied.")
