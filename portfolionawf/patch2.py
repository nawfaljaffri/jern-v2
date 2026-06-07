import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# 1. Update ASCII title in drawCanvas
ascii_old = """    const nameAscii1 = "█▄ █ ▄▀▄ █ █ █ █▀ ▄▀▄ █     █ ▄▀▄ █▀ █▀ █▀▄ █";
    const nameAscii2 = "█ ▀█ █▀█ ▀▄▀▄▀ █▀ █▀█ █▄▄ ▄▄█ █▀█ █▀ █▀ █▀▄ █";
    writeUI(2, 1, nameAscii1, 0);
    writeUI(2, 2, nameAscii2, 0);
    writeUI(2, 4, "[ CREATIVE / ENGINEER ]", 1);"""
ascii_new = """    const nameAscii1 = " _  _  ___  _ _ _ ___ ___ _    _  ___ ___ ___ ___ ___ ";
    const nameAscii2 = "| \\| |/ _ \\| | | | __/ _ \\ |  | |/ _ \\ __| __| _ \\_ _|";
    const nameAscii3 = "| .` |  _  | V V | _|  _  | |__| |  _  | _|| _||   / | |";
    const nameAscii4 = "|_|\\_|_| |_|\\___/|_| |_| |_|____|_| |_|_| |_||_|_\\|___|";
    writeUI(2, 1, nameAscii1, 0);
    writeUI(2, 2, nameAscii2, 0);
    writeUI(2, 3, nameAscii3, 0);
    writeUI(2, 4, nameAscii4, 0);
    writeUI(60, 4, "[ CREATIVE / ENGINEER ]", 1);"""
content = content.replace(ascii_old, ascii_new)

# 2. Update the Node Rendering (Col 2 and Col 3 logic)
node_render_pattern = r"(    if \(node\) \{).*?(        \}\n    \})"
node_render_new = """    if (node) {
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
            const listW = 34;
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
            }
            
            const proj = node.children && node.children[uiState.selectedProjectIdx];
            if (proj) {
                writeUI(detailStartX, 9, `:: ${proj.name} ::`, 0);
                writeUI(detailStartX, 10, '─'.repeat(detailWidth), 0);
                
                const assetH = 10;
                for(let r=0; r<assetH; r++) {
                    if (r === 0 || r === assetH-1) writeUI(detailStartX, 11 + r, '░'.repeat(detailWidth), 0);
                    else writeUI(detailStartX, 11 + r, '░' + ' '.repeat(detailWidth-2) + '░', 0);
                }
                writeUI(detailStartX + Math.floor(detailWidth/2) - 13, 11 + Math.floor(assetH/2), "[ VISUAL ASSET RENDER ZONE ]", 0);
                
                writeUI(detailStartX, 22, '─'.repeat(detailWidth), 0);
                if (proj.desc) writeUI(detailStartX, 23, `${proj.desc.replace(/\\n/g, ' ').substring(0, detailWidth)}`, 0);
                writeUI(detailStartX, 24, `Stack: ${proj.lang}  |  Links: ${proj.links || '[GitHub]'}`, 0);
            }
        }
    }"""
content = re.sub(node_render_pattern, node_render_new, content, flags=re.DOTALL)

# 3. Update handleKeyDown viewingProjectDetail removals
key_old = """    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (uiState.settingsOpen) {
          setUiState(s => ({ ...s, settingsCursorIdx: Math.max(0, s.settingsCursorIdx - 1) }))
      } else {
          setUiState(s => {
              if (s.focusColumn === 1) return { ...s, selectedNavIdx: Math.max(0, s.selectedNavIdx - 1), selectedProjectIdx: 0, viewingProjectDetail: false, scrollOffset: 0 }
              else if (s.focusColumn === 2 && !s.viewingProjectDetail) {
                  return { ...s, selectedProjectIdx: Math.max(0, s.selectedProjectIdx - 1), scrollOffset: 0 }
              } else if (s.focusColumn === 2 && s.viewingProjectDetail) {
                  return { ...s, scrollOffset: Math.max(0, s.scrollOffset - 1) }
              }
              return s
          })
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (uiState.settingsOpen) {
          setUiState(s => ({ ...s, settingsCursorIdx: Math.min(18, s.settingsCursorIdx + 1) }))
      } else {
          setUiState(s => {
              if (s.focusColumn === 1) return { ...s, selectedNavIdx: Math.min(DIRECTORY.length - 1, s.selectedNavIdx + 1), selectedProjectIdx: 0, viewingProjectDetail: false, scrollOffset: 0 }
              else if (s.focusColumn === 2 && !s.viewingProjectDetail) {
                  const node = DIRECTORY[s.selectedNavIdx];
                  const maxIdx = (node && node.children) ? node.children.length - 1 : 0;
                  return { ...s, selectedProjectIdx: Math.min(maxIdx, s.selectedProjectIdx + 1), scrollOffset: 0 }
              } else if (s.focusColumn === 2 && s.viewingProjectDetail) {
                  return { ...s, scrollOffset: s.scrollOffset + 1 }
              }
              return s
          })
      }
    } else if (e.key === 'Escape') {
      setUiState(s => {
          if (s.settingsOpen) return { ...s, settingsOpen: false }
          if (s.viewingProjectDetail) return { ...s, viewingProjectDetail: false, focusColumn: 2 }
          if (s.focusColumn === 2) return { ...s, focusColumn: 1, scrollOffset: 0 }
          return s
      })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (uiState.settingsOpen) {
          if (uiState.settingsCursorIdx < 6) {
              setUiState(s => ({ ...s, themeIdx: s.settingsCursorIdx }))
          } else if (uiState.settingsCursorIdx < 9) {
              setUiState(s => ({ ...s, fontIdx: s.settingsCursorIdx - 6 }))
          } else if (uiState.settingsCursorIdx >= 15 && uiState.settingsCursorIdx < 18) {
              const ratios = ['4:3', '5:4', 'FLUID']
              setUiState(s => ({ ...s, aspectRatio: ratios[s.settingsCursorIdx - 15] }))
          } else if (uiState.settingsCursorIdx === 18) {
              playModalClose();
              setUiState(s => ({ ...s, settingsOpen: false }))
          }
      } else {
          setUiState(s => {
              if (s.focusColumn === 1) {
                  const node = DIRECTORY[s.selectedNavIdx]
                  if (node && node.type === 'folder') return { ...s, focusColumn: 2, selectedProjectIdx: 0, scrollOffset: 0, viewingProjectDetail: false }
              } else if (s.focusColumn === 2 && !s.viewingProjectDetail) {
                  const node = DIRECTORY[s.selectedNavIdx]
                  if (node && node.type === 'folder' && node.children && node.children.length > 0) {
                      return { ...s, viewingProjectDetail: true, scrollOffset: 0 }
                  }
              }
              return s
          })
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      if (uiState.settingsOpen && uiState.settingsCursorIdx >= 9 && uiState.settingsCursorIdx < 15) {
          e.preventDefault()
          const sliderIdx = uiState.settingsCursorIdx - 9
          const delta = e.key === 'ArrowRight' ? 0.05 : -0.05
          const SLIDER_CFG = getSliders(effects, setEffects);
          const cfg = SLIDER_CFG[sliderIdx]
          cfg.set(Math.max(cfg.min, Math.min(cfg.max, cfg.val + delta)))
      } else if (!uiState.settingsOpen) {
          e.preventDefault()
          if (e.key === 'ArrowLeft') {
              setUiState(s => {
                  if (s.viewingProjectDetail) return { ...s, viewingProjectDetail: false, scrollOffset: 0 }
                  if (s.focusColumn === 2) return { ...s, focusColumn: 1, scrollOffset: 0 }
                  return s
              })
          } else if (e.key === 'ArrowRight') {
              setUiState(s => {
                  if (s.focusColumn === 1) {
                      const node = DIRECTORY[s.selectedNavIdx]
                      if (node && node.type === 'folder') return { ...s, focusColumn: 2, selectedProjectIdx: 0, scrollOffset: 0, viewingProjectDetail: false }
                  } else if (s.focusColumn === 2 && !s.viewingProjectDetail) {
                      const node = DIRECTORY[s.selectedNavIdx]
                      if (node && node.type === 'folder' && node.children && node.children.length > 0) {
                          return { ...s, viewingProjectDetail: true, scrollOffset: 0 }
                      }
                  }
                  return s
              })
          }
      }
    }"""
key_new = """    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (uiState.settingsOpen) {
          setUiState(s => ({ ...s, settingsCursorIdx: Math.max(0, s.settingsCursorIdx - 1) }))
      } else {
          setUiState(s => {
              if (s.focusColumn === 1) return { ...s, selectedNavIdx: Math.max(0, s.selectedNavIdx - 1), selectedProjectIdx: 0, scrollOffset: 0 }
              else if (s.focusColumn === 2) {
                  return { ...s, selectedProjectIdx: Math.max(0, s.selectedProjectIdx - 1), scrollOffset: 0 }
              }
              return s
          })
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (uiState.settingsOpen) {
          setUiState(s => ({ ...s, settingsCursorIdx: Math.min(18, s.settingsCursorIdx + 1) }))
      } else {
          setUiState(s => {
              if (s.focusColumn === 1) return { ...s, selectedNavIdx: Math.min(DIRECTORY.length - 1, s.selectedNavIdx + 1), selectedProjectIdx: 0, scrollOffset: 0 }
              else if (s.focusColumn === 2) {
                  const node = DIRECTORY[s.selectedNavIdx];
                  const maxIdx = (node && node.children) ? node.children.length - 1 : 0;
                  return { ...s, selectedProjectIdx: Math.min(maxIdx, s.selectedProjectIdx + 1), scrollOffset: 0 }
              }
              return s
          })
      }
    } else if (e.key === 'Escape') {
      setUiState(s => {
          if (s.settingsOpen) return { ...s, settingsOpen: false }
          if (s.focusColumn === 2) return { ...s, focusColumn: 1, scrollOffset: 0 }
          return s
      })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (uiState.settingsOpen) {
          if (uiState.settingsCursorIdx < 6) {
              setUiState(s => ({ ...s, themeIdx: s.settingsCursorIdx }))
          } else if (uiState.settingsCursorIdx < 9) {
              setUiState(s => ({ ...s, fontIdx: s.settingsCursorIdx - 6 }))
          } else if (uiState.settingsCursorIdx >= 15 && uiState.settingsCursorIdx < 18) {
              const ratios = ['4:3', '5:4', 'FLUID']
              setUiState(s => ({ ...s, aspectRatio: ratios[s.settingsCursorIdx - 15] }))
          } else if (uiState.settingsCursorIdx === 18) {
              playModalClose();
              setUiState(s => ({ ...s, settingsOpen: false }))
          }
      } else {
          setUiState(s => {
              if (s.focusColumn === 1) {
                  const node = DIRECTORY[s.selectedNavIdx]
                  if (node && node.type === 'folder') return { ...s, focusColumn: 2, selectedProjectIdx: 0, scrollOffset: 0 }
              }
              return s
          })
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      if (uiState.settingsOpen && uiState.settingsCursorIdx >= 9 && uiState.settingsCursorIdx < 15) {
          e.preventDefault()
          const sliderIdx = uiState.settingsCursorIdx - 9
          const delta = e.key === 'ArrowRight' ? 0.05 : -0.05
          const SLIDER_CFG = getSliders(effects, setEffects);
          const cfg = SLIDER_CFG[sliderIdx]
          cfg.set(Math.max(cfg.min, Math.min(cfg.max, cfg.val + delta)))
      } else if (!uiState.settingsOpen) {
          e.preventDefault()
          if (e.key === 'ArrowLeft') {
              setUiState(s => {
                  if (s.focusColumn === 2) return { ...s, focusColumn: 1, scrollOffset: 0 }
                  return s
              })
          } else if (e.key === 'ArrowRight') {
              setUiState(s => {
                  if (s.focusColumn === 1) {
                      const node = DIRECTORY[s.selectedNavIdx]
                      if (node && node.type === 'folder') return { ...s, focusColumn: 2, selectedProjectIdx: 0, scrollOffset: 0 }
                  }
                  return s
              })
          }
      }
    }"""
content = content.replace(key_old, key_new)

# 4. Update handlePointerInteraction
pointer_old = """    const navW = 25;
    if (isClick && !uiState.settingsOpen) {
        if (gridY >= 9 && gridY < 26) {
            if (gridX > 0 && gridX < navW) {
                const idx = gridY - 9;
                if (idx >= 0 && idx < DIRECTORY.length) {
                    playTick();
                    setUiState(s => ({ ...s, selectedNavIdx: idx, focusColumn: 1, selectedProjectIdx: 0, viewingProjectDetail: false, scrollOffset: 0 }))
                }
            } else if (gridX >= navW && gridX < COLS) {
                const node = DIRECTORY[uiState.selectedNavIdx];
                if (node && node.type === 'folder' && !uiState.viewingProjectDetail) {
                    const lineDist = 2;
                    const idx = Math.floor((gridY - 12 + uiState.scrollOffset) / lineDist);
                    if (idx >= 0 && idx < node.children.length && (gridY - 12 + uiState.scrollOffset) % lineDist === 0) {
                        playTick();
                        setUiState(s => ({ ...s, selectedProjectIdx: idx, focusColumn: 2, viewingProjectDetail: true, scrollOffset: 0 }))
                    } else {
                        setUiState(s => ({ ...s, focusColumn: 2 }))
                    }
                } else if (node && node.type === 'folder' && uiState.viewingProjectDetail) {
                    const pStartX = navW + 2;
                    if (gridY === 9 && gridX >= pStartX && gridX <= pStartX + 9) {
                        playTick();
                        setUiState(s => ({ ...s, viewingProjectDetail: false, scrollOffset: 0 }))
                    }
                }
            }
        }
    }"""
pointer_new = """    const navW = 25;
    const listW = 34;
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
content = content.replace(pointer_old, pointer_new)

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)

print("Patch 2 applied.")
