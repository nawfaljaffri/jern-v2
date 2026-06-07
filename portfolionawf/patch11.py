import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# Replace the entire if (node) block
old_block = """    if (node) {
        if (node.type === 'page') {
            writeUI(pStartX, 9, `:: ${node.name.replace(/[0-9.]/g, '').trim()} ::`, 0);
            writeUI(pStartX, 10, '─'.repeat(pWidth), 0);
            if (node.content) {
                node.content.forEach((line: string, i: number) => {
                    const y = 12 + i - uiState.scrollOffset;
                    if (y >= 12 && y <= 24) {
                        writeUI(pStartX, y, line.substring(0, pWidth), 0);
                    }
                });
                drawScrollbar(COLS - 2, 8, 17, node.content.length, uiState.scrollOffset, 13);
            }
        } else if (node.type === 'folder') {
            if (node.name.includes('ARTWORKS')) {
                writeUI(pStartX, 9, `:: ${node.name.replace(/[0-9.]/g, '').trim()} ::`, 0);
                writeUI(pStartX, 10, '─'.repeat(pWidth), 0);
                if (node.children) {
                    const itemH = 15;
                    const totalLines = node.children.length * itemH;
                    node.children.forEach((art: any, i: number) => {
                        const startY = 12 + i * itemH - uiState.scrollOffset;
                        if (startY + itemH >= 12 && startY <= 24) {
                            if (startY >= 12 && startY <= 24) writeUI(pStartX, startY, `[ ${art.name} ]`, 0);
                            const assetH = 12;
                            for(let r=0; r<assetH; r++) {
                                const yy = startY + 2 + r;
                                if (yy >= 12 && yy <= 24) {
                                    if (r === 0 || r === assetH-1) writeUI(pStartX, yy, '░'.repeat(pWidth), 0);
                                    else writeUI(pStartX, yy, '░' + ' '.repeat(pWidth-2) + '░', 0);
                                    if (r === Math.floor(assetH/2)) {
                                        writeUI(pStartX + Math.floor(pWidth/2) - 13, yy, "[ VISUAL ASSET RENDER ZONE ]", 0);
                                    }
                                }
                            }
                        }
                    });
                    drawScrollbar(COLS - 2, 8, 17, totalLines, uiState.scrollOffset, 13);
                }
            } else {
            const listW = 24;
            const detailStartX = pStartX + listW;
            const detailWidth = pWidth - listW;
            
            writeUI(pStartX, 9, `:: ${node.name.replace(/[0-9.]/g, '').trim()} ::`, 0);
            writeUI(pStartX, 10, '─'.repeat(listW - 2), 0);
            
            if (node.children) {
                node.children.forEach((proj: any, i: number) => {
                    const lineDist = 1;
                    const y = 12 + i * lineDist - uiState.scrollOffset;
                    if (y >= 12 && y <= 24) {
                        const isHovered = !uiState.settingsOpen && hy === y && hx >= pStartX && hx < pStartX + listW - 2;
                        const isSelected = uiState.selectedProjectIdx === i;
                        let color = 1;
                        if (isHovered || (isSelected && uiState.focusColumn === 2)) color = 2;
                        else if (isSelected) color = 0;
                        writeUI(pStartX, y, `[${isSelected ? '>' : ' '}] ${proj.name.substring(0, listW - 6)}`, color);
                    }
                });
                drawScrollbar(pStartX + listW - 2, 8, 17, node.children.length, uiState.scrollOffset, 13);
            }
            
            const proj = node.children && node.children[uiState.selectedProjectIdx];
            if (proj) {
                writeUI(detailStartX, 9, `:: ${proj.name} ::`, 0);
                writeUI(detailStartX, 10, '─'.repeat(detailWidth), 0);
                
                let offsetP = 3;
                
                if (proj.asciiArt) {
                    proj.asciiArt.forEach((line: string) => {
                        writeUI(detailStartX + 4, pStartY + offsetP++, line, 2);
                    });
                    offsetP++;
                }
                
                writeUI(detailStartX, pStartY + offsetP++, `DATE: ${proj.date}`, 3);
                writeUI(detailStartX, pStartY + offsetP++, `TECH: ${proj.lang}`, 3);
                writeUI(detailStartX, pStartY + offsetP++, `STAT: ${proj.status}`, 3);
                offsetP++;
                
                const words = proj.desc.split(' ');
                let currentLine = '';
                words.forEach((word: string) => {
                    if (currentLine.length + word.length + 1 <= detailWidth) {
                        currentLine += (currentLine.length > 0 ? ' ' : '') + word;
                    } else {
                        writeUI(detailStartX, pStartY + offsetP++, currentLine, 0);
                        currentLine = word;
                    }
                });
                if (currentLine) writeUI(detailStartX, pStartY + offsetP++, currentLine, 0);
                
                offsetP++;
                writeUI(detailStartX, pStartY + offsetP++, proj.links, 0);
            }
            }
        }
    }"""

new_block = """    if (node) {
        if (node.type === 'page') {
            if (node.content) {
                node.content.forEach((line: string, i: number) => {
                    const y = 8 + i - uiState.scrollOffset;
                    if (y >= 8 && y <= 24) {
                        writeUI(pStartX, y, line.substring(0, pWidth), 0);
                    }
                });
                drawScrollbar(COLS - 2, 8, 17, node.content.length, uiState.scrollOffset, 17);
            }
        } else if (node.type === 'folder') {
            if (node.name.includes('ARTWORKS')) {
                if (node.children) {
                    const itemH = 15;
                    const totalLines = node.children.length * itemH;
                    node.children.forEach((art: any, i: number) => {
                        const startY = 8 + i * itemH - uiState.scrollOffset;
                        if (startY + itemH >= 8 && startY <= 24) {
                            if (startY >= 8 && startY <= 24) writeUI(pStartX, startY, `[ ${art.name} ]`, 0);
                            const assetH = 12;
                            for(let r=0; r<assetH; r++) {
                                const yy = startY + 2 + r;
                                if (yy >= 8 && yy <= 24) {
                                    if (r === 0 || r === assetH-1) writeUI(pStartX, yy, '░'.repeat(pWidth), 0);
                                    else writeUI(pStartX, yy, '░' + ' '.repeat(pWidth-2) + '░', 0);
                                    if (r === Math.floor(assetH/2)) {
                                        writeUI(pStartX + Math.floor(pWidth/2) - 13, yy, "[ VISUAL ASSET RENDER ZONE ]", 0);
                                    }
                                }
                            }
                        }
                    });
                    drawScrollbar(COLS - 2, 8, 17, totalLines, uiState.scrollOffset, 17);
                }
            } else {
            const listW = 24;
            const detailStartX = pStartX + listW;
            const detailWidth = pWidth - listW;
            
            if (node.children) {
                node.children.forEach((proj: any, i: number) => {
                    const lineDist = 1;
                    const y = 8 + i * lineDist - uiState.scrollOffset;
                    if (y >= 8 && y <= 24) {
                        const isHovered = !uiState.settingsOpen && hy === y && hx >= pStartX && hx < pStartX + listW - 2;
                        const isSelected = uiState.selectedProjectIdx === i;
                        let color = 1;
                        if (isHovered || (isSelected && uiState.focusColumn === 2)) color = 2;
                        else if (isSelected) color = 0;
                        writeUI(pStartX, y, `[${isSelected ? '>' : ' '}] ${proj.name.substring(0, listW - 6)}`, color);
                    }
                });
                drawScrollbar(pStartX + listW - 2, 8, 17, node.children.length, uiState.scrollOffset, 17);
            }
            
            const proj = node.children && node.children[uiState.selectedProjectIdx];
            if (proj) {
                let offsetP = 0;
                
                if (proj.asciiArt) {
                    proj.asciiArt.forEach((line: string) => {
                        writeUI(detailStartX + 4, 8 + offsetP++, line, 2);
                    });
                    offsetP++;
                }
                
                writeUI(detailStartX, 8 + offsetP++, `DATE: ${proj.date}`, 3);
                writeUI(detailStartX, 8 + offsetP++, `TECH: ${proj.lang}`, 3);
                writeUI(detailStartX, 8 + offsetP++, `STAT: ${proj.status}`, 3);
                offsetP++;
                
                const words = proj.desc.split(' ');
                let currentLine = '';
                words.forEach((word: string) => {
                    if (currentLine.length + word.length + 1 <= detailWidth) {
                        currentLine += (currentLine.length > 0 ? ' ' : '') + word;
                    } else {
                        writeUI(detailStartX, 8 + offsetP++, currentLine, 0);
                        currentLine = word;
                    }
                });
                if (currentLine) writeUI(detailStartX, 8 + offsetP++, currentLine, 0);
                
                offsetP++;
                writeUI(detailStartX, 8 + offsetP++, proj.links, 0);
            }
            }
        }
    }"""
content = content.replace(old_block, new_block)

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)

print("Patch 11 applied.")
