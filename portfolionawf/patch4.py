import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# 1. Update ASCII Logo
ascii_old = """    const nameAscii1 = " _  _  ___  _ _ _ ___ ___ _    _  ___ ___ ___ ___ ___ ";
    const nameAscii2 = "| \\\\| |/ _ \\\\| | | | __/ _ \\\\ |  | |/ _ \\\\ __| __| _ \\\\_ _|";
    const nameAscii3 = "| .` |  _  | V V | _|  _  | |__| |  _  | _|| _||   / | |";
    const nameAscii4 = "|_|\\\\_|_| |_|\\\\___/|_| |_| |_|____|_| |_|_| |_||_|_\\\\|___|";
    writeUI(2, 1, nameAscii1, 0);
    writeUI(2, 2, nameAscii2, 0);
    writeUI(2, 3, nameAscii3, 0);
    writeUI(2, 4, nameAscii4, 0);
    writeUI(60, 4, "[ CREATIVE / ENGINEER ]", 1);"""
ascii_new = """    const nameAscii1 = "N   N   A   W   W  FFFF   A   L    ";
    const nameAscii2 = "NN  N  A A  W   W  F     A A  L    ";
    const nameAscii3 = "N N N AAAA  W W W  FFF  AAAA  L    ";
    const nameAscii4 = "N  NN A  A  WW WW  F    A  A  L    ";
    const nameAscii5 = "N   N A  A  W   W  F    A  A  LLLL ";
    writeUI(2, 1, nameAscii1, 0);
    writeUI(2, 2, nameAscii2, 0);
    writeUI(2, 3, nameAscii3, 0);
    writeUI(2, 4, nameAscii4, 0);
    writeUI(2, 5, nameAscii5, 0);
    writeUI(44, 5, "[ CREATIVE / ENGINEER ]", 1);"""
content = content.replace(ascii_old, ascii_new)

# 2. Update Keyboard Navigation
key_up_old = """              else if (s.focusColumn === 2) {
                  return { ...s, selectedProjectIdx: Math.max(0, s.selectedProjectIdx - 1), scrollOffset: 0 }
              }"""
key_up_new = """              else if (s.focusColumn === 2) {
                  const node = DIRECTORY[s.selectedNavIdx];
                  if (node && node.type === 'folder' && node.name.includes('ARTWORKS')) {
                      return { ...s, scrollOffset: Math.max(0, s.scrollOffset - 1) }
                  }
                  return { ...s, selectedProjectIdx: Math.max(0, s.selectedProjectIdx - 1), scrollOffset: 0 }
              }"""
content = content.replace(key_up_old, key_up_new)

key_down_old = """              else if (s.focusColumn === 2) {
                  const node = DIRECTORY[s.selectedNavIdx];
                  const maxIdx = (node && node.children) ? node.children.length - 1 : 0;
                  return { ...s, selectedProjectIdx: Math.min(maxIdx, s.selectedProjectIdx + 1), scrollOffset: 0 }
              }"""
key_down_new = """              else if (s.focusColumn === 2) {
                  const node = DIRECTORY[s.selectedNavIdx];
                  if (node && node.type === 'folder' && node.name.includes('ARTWORKS')) {
                      return { ...s, scrollOffset: s.scrollOffset + 1 }
                  }
                  const maxIdx = (node && node.children) ? node.children.length - 1 : 0;
                  return { ...s, selectedProjectIdx: Math.min(maxIdx, s.selectedProjectIdx + 1), scrollOffset: 0 }
              }"""
content = content.replace(key_down_old, key_down_new)

# 3. Update Rendering Logic for ARTWORKS
render_old = """        } else if (node.type === 'folder') {
            const listW = 24;"""
render_new = """        } else if (node.type === 'folder') {
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
            const listW = 24;"""

content = content.replace(render_old, render_new)

# Since we added an open brace, we must close it at the end of node.type === 'folder'
render_end_old = """                writeUI(detailStartX, 24, `Stack: ${proj.lang}  |  Links: ${proj.links || '[GitHub]'}`, 0);
            }
        }
    }"""
render_end_new = """                writeUI(detailStartX, 24, `Stack: ${proj.lang}  |  Links: ${proj.links || '[GitHub]'}`, 0);
            }
            }
        }
    }"""
content = content.replace(render_end_old, render_end_new)

# 4. Update Pointer Interaction
ptr_old = """            } else if (gridX >= navW && gridX < navW + listW) {
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
            }"""
ptr_new = """            } else if (gridX >= navW && gridX < navW + listW) {
                const node = DIRECTORY[uiState.selectedNavIdx];
                if (node && node.type === 'folder') {
                    if (node.name.includes('ARTWORKS')) {
                        setUiState(s => ({ ...s, focusColumn: 2 }));
                    } else {
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
            } else if (gridX >= navW + listW && gridX < COLS) {
                const node = DIRECTORY[uiState.selectedNavIdx];
                if (node && node.type === 'folder' && node.name.includes('ARTWORKS')) {
                    setUiState(s => ({ ...s, focusColumn: 2 }));
                }
            }"""
content = content.replace(ptr_old, ptr_new)

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)

print("Patch 4 applied.")
