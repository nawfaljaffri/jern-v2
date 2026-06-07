with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

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
        
        let color = 1;
        if (isSelected || isHovered) color = 2; // Bright white

        writeUI(1, y, str, color);
    });

    const previewW = COLS - colW;
    drawBoxUI(colW, 8, previewW, 18, 'PREVIEW');
    
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
                    const y = 13 + idx;
                    const isSelected = uiState.navPath.length === 2 && uiState.navPath[1] === idx;
                    const isHovered = !uiState.settingsOpen && hy === y && hx >= colW + 2 && hx < colW + listW - 2;
                    const prefix = isSelected ? '[>]' : '[ ]';
                    let color = 1;
                    if (isSelected || isHovered) color = 2;
                    writeUI(colW + 2, y, `${prefix} ${child.name}`, color);
                });
            }

            if (uiState.navPath.length === 2 && rootNode.children) {
                const projectNode = rootNode.children[uiState.navPath[1]];
                if (projectNode) {
                    writeUI(detailX + 2, 10, `:: ${projectNode.name} ::`, 0);
                    writeUI(detailX + 2, 11, '─'.repeat(detailW - 4), 1);
                    
                    const boxH = 9;
                    const bx = detailX + 2;
                    const by = 13;
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
                    writeUI(bx + Math.floor((bw - renderZoneStr.length) / 2), by + Math.floor(boxH / 2), renderZoneStr, 2);

                    writeUI(detailX + 2, 13 + boxH + 1, '─'.repeat(detailW - 4), 1);
                    
                    const descLines = projectNode.desc.split('\\n');
                    descLines.forEach((line: string, i: number) => {
                        writeUI(detailX + 2, 13 + boxH + 2 + i, line.substring(0, detailW - 4), 2);
                    });
                    writeUI(detailX + 2, 13 + boxH + 2 + descLines.length, `Stack: ${projectNode.lang}  |  Links: ${projectNode.links || ''}`, 2);
                }
            }
        } else if (rootNode.type === 'page') {
            writeUI(colW + 2, 10, `:: ${rootNode.name} ::`, 0);
            writeUI(colW + 2, 11, '─'.repeat(previewW - 4), 1);
            if (rootNode.content) {
                rootNode.content.forEach((line: string, i: number) => {
                    writeUI(colW + 2, 13 + i, line.substring(0, previewW - 4), 2);
                });
            }
        }
    }

    """
if draw_start != -1 and draw_end != -1:
    content = content[:draw_start] + new_draw + content[draw_end:]

ptr_start = content.find("const colW = 20;", content.find("handlePointerInteraction"))
ptr_end = content.find("if (gridY === 28 && gridX >= 2) {")

new_ptr = """const colW = 20;
    if (isClick && !uiState.settingsOpen) {
        if (gridY >= 10 && gridY < 28) {
            if (gridX >= 1 && gridX < colW) {
                const rowIdx = gridY - 10;
                if (rowIdx >= 0 && rowIdx < DIRECTORY.length) {
                    playTick();
                    setUiState(s => ({ ...s, navPath: [rowIdx], focusDepth: 0 }));
                    if (inputRef.current) inputRef.current.focus();
                }
            } else if (gridX >= colW + 2 && gridX < colW + 24) {
                const rootNode = DIRECTORY[uiState.navPath[0]];
                if (rootNode && rootNode.type === 'folder') {
                    const childIdx = gridY - 13;
                    if (rootNode.children && childIdx >= 0 && childIdx < rootNode.children.length) {
                        playTick();
                        setUiState(s => ({ ...s, navPath: [s.navPath[0], childIdx], focusDepth: 1 }));
                        if (inputRef.current) inputRef.current.focus();
                    }
                }
            }
        }
    }

    """
if ptr_start != -1 and ptr_end != -1:
    content = content[:ptr_start] + new_ptr + content[ptr_end:]

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)
print("done")
