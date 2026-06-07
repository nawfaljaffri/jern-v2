with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# 1. Add scrollOffset: 0 to uiState initialization
init_str = """const [uiState, setUiState] = useState({"""
new_init = """const [uiState, setUiState] = useState({
    scrollOffset: 0,"""
content = content.replace(init_str, new_init)

# 2. Add scrollOffset: 0 to all navPath updates where focus depth or navpath changes
content = content.replace("navPath: newPath }", "navPath: newPath, scrollOffset: 0 }")
content = content.replace("navPath: [newPath[0], 0] }", "navPath: [newPath[0], 0], scrollOffset: 0 }")
content = content.replace("navPath: [newPath[0]] }", "navPath: [newPath[0]], scrollOffset: 0 }")
content = content.replace("navPath: [rowIdx, 0], focusDepth: 0 }", "navPath: [rowIdx, 0], focusDepth: 0, scrollOffset: 0 }")
content = content.replace("navPath: [rowIdx], focusDepth: 0 }", "navPath: [rowIdx], focusDepth: 0, scrollOffset: 0 }")

# 3. Add onWheel to the div
wheel_target = """onPointerDown={(e) => handlePointerInteraction(e, true)}"""
wheel_new = """onWheel={(e) => {
          if (!uiState.settingsOpen) {
            setUiState(s => ({ ...s, scrollOffset: Math.max(0, s.scrollOffset + (e.deltaY > 0 ? 1 : -1)) }));
          }
        }}
        onPointerDown={(e) => handlePointerInteraction(e, true)}"""
content = content.replace(wheel_target, wheel_new)

# 4. Update the drawing logic for text to use scrollOffset and draw scrollbar
draw_page_start = content.find("} else if (rootNode.type === 'page') {")
draw_page_end = content.find("}", content.find("})", content.find("if (rootNode.content) {"))) + 1

if draw_page_start != -1 and draw_page_end != -1:
    new_page_draw = """} else if (rootNode.type === 'page') {
            writeUI(colW + 2, 10, `:: ${rootNode.name} ::`, 0);
            writeUI(colW + 2, 11, '─'.repeat(previewW - 4), 1);
            if (rootNode.content) {
                const allLines: string[] = [];
                rootNode.content.forEach((rawLine: string) => {
                    const wrapped = wrapText(rawLine, previewW - 5);
                    allLines.push(...wrapped);
                });
                const maxVisible = 14;
                const maxScroll = Math.max(0, allLines.length - maxVisible);
                const scroll = Math.min(uiState.scrollOffset, maxScroll);
                for (let i = 0; i < maxVisible && i + scroll < allLines.length; i++) {
                    writeUI(colW + 2, 12 + i, allLines[i + scroll], 0);
                }
                if (maxScroll > 0) {
                    const sbH = maxVisible;
                    const sbThumbH = Math.max(1, Math.floor(sbH * (maxVisible / allLines.length)));
                    const sbThumbY = Math.floor((sbH - sbThumbH) * (scroll / maxScroll));
                    for (let i = 0; i < sbH; i++) {
                        const isThumb = i >= sbThumbY && i < sbThumbY + sbThumbH;
                        writeUI(COLS - 2, 12 + i, isThumb ? '█' : '│', 1);
                    }
                }
            }"""
    content = content[:draw_page_start] + new_page_draw + content[draw_page_end:]


# 5. Update the drawing logic for projects
draw_proj_start = content.find("// Wrap the description text")
draw_proj_end = content.find("}", content.find("writeUI(detailX + 2, currentY, `Stack:"))

if draw_proj_start != -1 and draw_proj_end != -1:
    new_proj_draw = """// Wrap the description text
                    const allLines: string[] = [];
                    const rawDescLines = projectNode.desc.split('\\n');
                    rawDescLines.forEach((rawLine: string) => {
                        const wrapped = wrapText(rawLine, detailW - 5);
                        allLines.push(...wrapped);
                    });
                    allLines.push(`Stack: ${projectNode.lang}  |  Links: ${projectNode.links || ''}`);

                    const maxVisible = 26 - (12 + boxH + 1);
                    const maxScroll = Math.max(0, allLines.length - maxVisible);
                    const scroll = Math.min(uiState.scrollOffset, maxScroll);
                    const currentY = 12 + boxH + 1;
                    
                    for (let i = 0; i < maxVisible && i + scroll < allLines.length; i++) {
                        writeUI(detailX + 2, currentY + i, allLines[i + scroll], 0);
                    }
                    if (maxScroll > 0) {
                        const sbH = maxVisible;
                        const sbThumbH = Math.max(1, Math.floor(sbH * (maxVisible / allLines.length)));
                        const sbThumbY = Math.floor((sbH - sbThumbH) * (scroll / maxScroll));
                        for (let i = 0; i < sbH; i++) {
                            const isThumb = i >= sbThumbY && i < sbThumbY + sbThumbH;
                            writeUI(COLS - 2, currentY + i, isThumb ? '█' : '│', 1);
                        }
                    }"""
    content = content[:draw_proj_start] + new_proj_draw + content[draw_proj_end:]

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)
print("done")
