with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# 1. Fix navPath init
content = content.replace("navPath: [0],", "navPath: [0, 0],")

# 2. Update drawing loop to use wrapping and start at line 12
draw_start = content.find("const colW = 20;")
draw_end = content.find("drawBoxUI(0, 26, COLS, 4, 'TERMINAL')")

new_draw = """const colW = 20;
    
    drawBoxUI(0, 8, colW, 18, 'CONTENTS');
    
    DIRECTORY.forEach((item, idx) => {
        const y = 10 + idx;
        const isSelected = uiState.navPath[0] === idx;
        const isHovered = !uiState.settingsOpen && hy === y && hx >= 1 && hx < colW - 1;
        
        let prefix = '';
        if (item.type === 'folder' && !isSelected) prefix = '+';
        
        const textContent = `${prefix}${item.name}`;
        const str = ` ${textContent}`.padEnd(colW - 1, ' ');
        
        let color = 0;
        if (isSelected) color = 2;
        else if (isHovered) color = 1;

        writeUI(1, y, str, color);
    });

    const previewW = COLS - colW;
    drawBoxUI(colW, 8, previewW, 18, 'PREVIEW');
    
    const wrapText = (text: string, maxLen: number) => {
        const lines: string[] = [];
        const words = text.split(' ');
        let currentLine = '';
        words.forEach(word => {
            if ((currentLine + word).length > maxLen) {
                if (currentLine) lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine += word + ' ';
            }
        });
        if (currentLine) lines.push(currentLine.trim());
        return lines;
    };

    const rootNode = uiState.navPath.length > 0 ? DIRECTORY[uiState.navPath[0]] : null;
    if (rootNode) {
        if (rootNode.type === 'folder') {
            const listW = 24;
            const detailX = colW + listW;
            const detailW = previewW - listW;

            writeUI(colW + 2, 10, `:: ${rootNode.name} ::`, 0);
            writeUI(colW + 2, 11, '─'.repeat(listW - 4), 1);
            
            if (rootNode.children) {
                rootNode.children.forEach((child: any, idx: number) => {
                    const y = 12 + idx; // Reduced gap
                    const isSelected = uiState.navPath.length === 2 && uiState.navPath[1] === idx;
                    const isHovered = !uiState.settingsOpen && hy === y && hx >= colW + 2 && hx < colW + listW - 2;
                    const prefix = isSelected ? '[>]' : '[ ]';
                    let color = 0;
                    if (isSelected) color = 2;
                    else if (isHovered) color = 1;
                    writeUI(colW + 2, y, `${prefix} ${child.name}`, color);
                });
            }

            if (uiState.navPath.length === 2 && rootNode.children) {
                const projectNode = rootNode.children[uiState.navPath[1]];
                if (projectNode) {
                    writeUI(detailX + 2, 10, `:: ${projectNode.name} ::`, 0);
                    writeUI(detailX + 2, 11, '─'.repeat(detailW - 4), 1);
                    
                    const boxH = 7; // Reduced box height to give text more vertical room
                    const bx = detailX + 2;
                    const by = 12; // Start immediately after divider
                    const bw = detailW - 4;
                    // Draw patterned box
                    for (let i = 0; i < bw; i++) {
                        writeUI(bx + i, by, '░', 1);
                        writeUI(bx + i, by + boxH - 1, '░', 1);
                    }
                    for (let j = 0; j < boxH; j++) {
                        writeUI(bx, by + j, '░', 1);
                        writeUI(bx + bw - 1, by + j, '░', 1);
                    }
                    
                    const renderZoneStr = '[ VISUAL ASSET RENDER ZONE ]';
                    writeUI(bx + Math.floor((bw - renderZoneStr.length) / 2), by + Math.floor(boxH / 2), renderZoneStr, 1);

                    writeUI(detailX + 2, 12 + boxH, '─'.repeat(detailW - 4), 1);
                    
                    // Wrap the description text
                    let currentY = 12 + boxH + 1;
                    const rawDescLines = projectNode.desc.split('\\n');
                    rawDescLines.forEach((rawLine: string) => {
                        const wrapped = wrapText(rawLine, detailW - 4);
                        wrapped.forEach(wLine => {
                            writeUI(detailX + 2, currentY++, wLine, 0);
                        });
                    });
                    
                    // Add Stack and Links
                    writeUI(detailX + 2, currentY, `Stack: ${projectNode.lang}  |  Links: ${projectNode.links || ''}`, 0);
                }
            }
        } else if (rootNode.type === 'page') {
            writeUI(colW + 2, 10, `:: ${rootNode.name} ::`, 0);
            writeUI(colW + 2, 11, '─'.repeat(previewW - 4), 1);
            if (rootNode.content) {
                let currentY = 12; // Start immediately after divider
                rootNode.content.forEach((rawLine: string) => {
                    const wrapped = wrapText(rawLine, previewW - 4);
                    wrapped.forEach(wLine => {
                        writeUI(colW + 2, currentY++, wLine, 0);
                    });
                });
            }
        }
    }

    """
if draw_start != -1 and draw_end != -1:
    content = content[:draw_start] + new_draw + content[draw_end:]

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)
print("done")
