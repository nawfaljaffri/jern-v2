import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# 1. Add scrollAccRef
if 'const scrollAccRef = useRef(0)' not in content:
    content = content.replace("const hoverRef = useRef({ x: -1, y: -1 })", "const hoverRef = useRef({ x: -1, y: -1 })\n  const scrollAccRef = useRef(0)")

# 2. Fix ASCII title
ascii_old = """    const nameAscii1 = " _  _  ___  _ _ _ ___ ___ _    _  ___ ___ ___ ___ ___ ";
    const nameAscii2 = "| \\| |/ _ \\| | | | __/ _ \\ |  | |/ _ \\ __| __| _ \\_ _|";
    const nameAscii3 = "| .` |  _  | V V | _|  _  | |__| |  _  | _|| _||   / | |";
    const nameAscii4 = "|_|\\_|_| |_|\\___/|_| |_| |_|____|_| |_|_| |_||_|_\\|___|";"""
ascii_new = """    const nameAscii1 = " _  _  ___  _ _ _ ___ ___ _    _  ___ ___ ___ ___ ___ ";
    const nameAscii2 = "| \\\\| |/ _ \\\\| | | | __/ _ \\\\ |  | |/ _ \\\\ __| __| _ \\\\_ _|";
    const nameAscii3 = "| .` |  _  | V V | _|  _  | |__| |  _  | _|| _||   / | |";
    const nameAscii4 = "|_|\\\\_|_| |_|\\\\___/|_| |_| |_|____|_| |_|_| |_||_|_\\\\|___|";"""
content = content.replace(ascii_old, ascii_new)

# 3. Update DIRECTORY coloring
dir_old = """        let color = 0;
        if (isHovered) color = 2;
        else if (isSelected && uiState.focusColumn === 1) color = 2;
        else if (isSelected) color = 1;"""
dir_new = """        let color = 1;
        if (isHovered || (isSelected && uiState.focusColumn === 1)) color = 2;
        else if (isSelected) color = 0;"""
content = content.replace(dir_old, dir_new)

# 4. Update PROJECTS list logic
proj_old = """            const listW = 34;
            const detailStartX = pStartX + listW;
            const detailWidth = pWidth - listW;
            
            writeUI(pStartX, 9, `:: ${node.name.replace(/[0-9.]/g, '').trim()} ::`, 0);
            writeUI(pStartX, 10, '─'.repeat(listW - 2), 0);
            
            if (node.children) {
                node.children.forEach((proj: any, i: number) => {
                    const lineDist = 2;
                    const y = 12 + i * lineDist - uiState.scrollOffset;
                    if (y >= 12 && y <= 24) {
                        const isHovered = !uiState.settingsOpen && hy === y && hx >= pStartX && hx < pStartX + listW - 2;
                        const isSelected = uiState.selectedProjectIdx === i;
                        let color = 0;
                        if (isHovered) color = 2;
                        else if (isSelected && uiState.focusColumn === 2) color = 2;
                        else if (isSelected) color = 1;
                        writeUI(pStartX, y, `[${isSelected ? '>' : ' '}] ${proj.name.substring(0, listW - 6)}`, color);
                        if (y + 1 <= 24) writeUI(pStartX + 4, y + 1, `${proj.lang.substring(0, 10)} | ${proj.status.substring(0, 10)}`, 1);
                    }
                });
                drawScrollbar(pStartX + listW - 2, 8, 17, node.children.length * 2, uiState.scrollOffset, 13);
            }"""
proj_new = """            const listW = 24;
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
            }"""
content = content.replace(proj_old, proj_new)

# 5. Update interaction logic
int_old = """    const listW = 34;
    if (isClick && !uiState.settingsOpen) {
        if (gridY >= 9 && gridY < 26) {
            if (gridX > 0 && gridX < navW) {
                const idx = gridY - 9;
                if (idx >= 0 && idx < DIRECTORY.length) {
                    playTick();
                    setUiState(s => ({ ...s, selectedNavIdx: idx, focusColumn: 1, selectedProjectIdx: 0, scrollOffset: 0 }))
                }
            } else if (gridX >= navW && gridX < navW + listW) {
                const node = DIRECTORY[uiState.selectedNavIdx];
                if (node && node.type === 'folder') {
                    const lineDist = 2;
                    const idx = Math.floor((gridY - 12 + uiState.scrollOffset) / lineDist);
                    if (idx >= 0 && idx < node.children.length && (gridY - 12 + uiState.scrollOffset) % lineDist === 0) {
                        playTick();
                        setUiState(s => ({ ...s, selectedProjectIdx: idx, focusColumn: 2 }))
                    } else {
                        setUiState(s => ({ ...s, focusColumn: 2 }))
                    }
                }
            }
        }
    }"""
int_new = """    const listW = 24;
    if (isClick && !uiState.settingsOpen) {
        if (gridY >= 9 && gridY < 26) {
            if (gridX > 0 && gridX < navW) {
                const idx = gridY - 9;
                if (idx >= 0 && idx < DIRECTORY.length) {
                    playTick();
                    setUiState(s => ({ ...s, selectedNavIdx: idx, focusColumn: 1, selectedProjectIdx: 0, scrollOffset: 0 }))
                }
            } else if (gridX >= navW && gridX < navW + listW) {
                const node = DIRECTORY[uiState.selectedNavIdx];
                if (node && node.type === 'folder') {
                    const lineDist = 1;
                    const idx = Math.floor((gridY - 12 + uiState.scrollOffset) / lineDist);
                    if (idx >= 0 && idx < node.children.length && (gridY - 12 + uiState.scrollOffset) % lineDist === 0) {
                        playTick();
                        setUiState(s => ({ ...s, selectedProjectIdx: idx, focusColumn: 2 }))
                    } else {
                        setUiState(s => ({ ...s, focusColumn: 2 }))
                    }
                }
            }
        }
    }"""
content = content.replace(int_old, int_new)

# 6. Update onWheel
wheel_old = """        onWheel={(e) => {
            setUiState(s => ({ ...s, scrollOffset: Math.max(0, s.scrollOffset + (e.deltaY > 0 ? 1 : -1)) }))
        }}"""
wheel_new = """        onWheel={(e) => {
            scrollAccRef.current += e.deltaY;
            if (Math.abs(scrollAccRef.current) > 30) {
                const dir = Math.sign(scrollAccRef.current);
                scrollAccRef.current = 0;
                setUiState(s => ({ ...s, scrollOffset: Math.max(0, s.scrollOffset + dir) }));
            }
        }}"""
content = content.replace(wheel_old, wheel_new)

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)

print("Patch 3 applied.")
