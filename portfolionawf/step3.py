with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

start_str = "const colW = 20;"
end_str = "writeUI(currentX + 2, 16, `Use ArrowLeft to collapse`, 1);\n            }\n        }\n    }"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    end_idx += len(end_str)
    
    new_loop = """const colW = 28;
    let currentX = 0;
    let currentLevelData: any = DIRECTORY;
    let activeNode: any = null;

    for (let depth = 0; depth <= uiState.navPath.length; depth++) {
        if (!currentLevelData || !Array.isArray(currentLevelData)) break;
        
        const colTitle = depth === 0 ? 'DIRECTORY' : 'PREVIEW';
        drawBoxUI(currentX, 9, colW, 16, colTitle);
        
        const selIdx = depth < uiState.navPath.length ? uiState.navPath[depth] : -1;
        const isFocusedCol = (depth === uiState.focusDepth) && !uiState.settingsOpen;
        
        currentLevelData.forEach((item: any, idx: number) => {
            const y = 11 + idx;
            const isSelected = idx === selIdx;
            
            let prefix = '[ ] ';
            if (isSelected) {
                if (item.type === 'folder' || item.type === 'project') prefix = '[>] ';
                else prefix = '[*] ';
            }
            if (depth === 0) {
                prefix = isSelected ? '[*] ' : '[ ] ';
            }

            const textContent = `${prefix}${item.name}`;
            const padding = colW - textContent.length - 3;
            const str = ` ${textContent}` + ' '.repeat(Math.max(0, padding));
            
            const isHovered = !uiState.settingsOpen && hy === y && hx >= currentX + 1 && hx < currentX + colW - 1;
            let color = 1; // Default brighter unselected
            if (isHovered) color = 2; // Hover bright
            else if (isSelected) color = 2; // Selected bright

            writeUI(currentX + 1, y, str, color);
        });

        if (selIdx >= 0 && selIdx < currentLevelData.length) {
            activeNode = currentLevelData[selIdx];
            if (activeNode && activeNode.children) {
                currentLevelData = activeNode.children;
            } else {
                currentLevelData = null;
            }
        } else {
            currentLevelData = null;
        }
        
        currentX += colW;
    }

    const previewW = COLS - currentX;
    if (previewW > 10) {
        if (activeNode && (activeNode.type === 'page' || activeNode.type === 'project')) {
            drawBoxUI(currentX, 9, previewW, 16, '');
            writeUI(currentX + 2, 11, `:: ${activeNode.name} ::`, 0);
            writeUI(currentX + 2, 12, '─'.repeat(previewW - 4), 1);
            
            if (activeNode.type === 'page' && activeNode.content) {
                activeNode.content.forEach((line: string, i: number) => {
                    writeUI(currentX + 2, 14 + i, line.substring(0, previewW - 4), 2);
                });
            } else if (activeNode.type === 'project') {
                const boxH = 9;
                drawBoxUI(currentX + 6, 14, previewW - 12, boxH, '');
                const renderZoneStr = '[ VISUAL ASSET RENDER ZONE ]';
                writeUI(currentX + 6 + Math.floor((previewW - 12 - renderZoneStr.length) / 2), 14 + Math.floor(boxH / 2), renderZoneStr, 2);

                writeUI(currentX + 2, 14 + boxH + 1, '─'.repeat(previewW - 4), 1);
                const descLines = activeNode.desc.split('\\n');
                descLines.forEach((line: string, i: number) => {
                    writeUI(currentX + 2, 14 + boxH + 2 + i, line.substring(0, previewW - 4), 2);
                });
                writeUI(currentX + 2, 14 + boxH + 2 + descLines.length, `Stack: ${activeNode.lang}  |  Links: ${activeNode.links || ''}`, 2);
            }
        }
    }"""
    
    content = content[:start_idx] + new_loop + content[end_idx:]
    with open('app/coding/page.tsx', 'w') as f:
        f.write(content)
    print("Step 3 done")
else:
    print("Step 3 failed")
