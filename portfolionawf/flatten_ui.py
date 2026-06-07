import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# 1. Update DIRECTORY
new_dir = """const DIRECTORY: any[] = [
  {
    name: 'PROJECTS',
    type: 'folder',
    children: [
      {
        name: 'neural-net-arch',
        type: 'project',
        date: '2024-03-15',
        lang: 'Python / PyTorch',
        status: 'ONLINE',
        desc: 'Neural architecture search experiments.\\nExplores evolutionary algorithms to\\noptimize network topologies for low-power\\nedge devices.',
        links: '[GitHub] [Live Demo]'
      },
      {
        name: 'spatial-os-web',
        type: 'project',
        date: '2024-02-28',
        lang: 'TypeScript / WebGL',
        status: 'ONLINE',
        desc: 'Browser-based operating system interface relying solely on canvas rendering.\\nBuilt with custom shaders and immediate mode GUI concepts.',
        links: '[GitHub]'
      },
      {
        name: 'poster-series-1',
        type: 'project',
        date: '2024-05-12',
        lang: 'Illustrator / PS',
        status: 'PUBLISHED',
        desc: 'A series of brutalist posters exploring\\nthe dichotomy of brutalism and digital noise.\\nExhibited at Dubai Design Week.'
      }
    ]
  },
  {
    name: 'EXPERIENCE',
    type: 'page',
    content: [
      'IDENTITY',
      'Muhammad Nawfal Aleem Jaffri',
      'nawfaljaffri@gmail.com | linkedin.com/in/nawfaljaffri | +971 50 4945990',
      '',
      'EDUCATION',
      'University Of Birmingham: BSc. Artificial Intelligence and Computer Science (01/20',
      'Language Proficiency: IELTS 8.5/9 Band - C2 CEFR Level (06/2024)',
      '',
      'PROFESSIONAL EXPERIENCE',
      'Susty (Dubai, UAE) | Application Content Developer (05/2025-Present)',
      '- Developed over 70+ interactive sustainability experiences.',
      '- Increased new users by 53% and engagement by 48%.',
      '- Collaborated with 40+ local brands, partners, and universities.'
    ]
  },
  {
    name: 'ABOUT',
    type: 'page',
    content: [
      'I am a 1st-year AI and Computer Science student at the',
      'University of Birmingham Dubai. My work is defined by',
      'a hybrid methodology: the logical rigor of artificial',
      'intelligence and the emotional resonance of graphic design.',
      '',
      'Whether I am leading a team as a Vice President at AIESEC,',
      'leading the google developers group at Uni of Birmingham',
      'Dubai, or Teaching people, I am driven by the same goal:',
      'turning abstract data into meaningful human experiences.'
    ]
  }
];"""
dir_match = re.search(r'const DIRECTORY: any\[\] = \[.*?\];', content, re.DOTALL)
if dir_match:
    content = content[:dir_match.start()] + new_dir + content[dir_match.end():]

# 2. Update the draw loop
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
            if (uiState.navPath.length === 2 && rootNode.children) {
                const projectNode = rootNode.children[uiState.navPath[1]];
                if (projectNode) {
                    writeUI(colW + 2, 10, `:: ${projectNode.name} ::`, 0);
                    writeUI(colW + 2, 11, '─'.repeat(previewW - 4), 1);
                    
                    writeUI(colW + 2, 13, `Status:  ${projectNode.status}`, 0);
                    writeUI(colW + 2, 14, `Stack:   ${projectNode.lang}`, 0);
                    writeUI(colW + 2, 15, `Date:    ${projectNode.date}`, 0);
                    writeUI(colW + 2, 17, '─'.repeat(previewW - 4), 1);
                    const descLines = projectNode.desc.split('\\n');
                    descLines.forEach((line: string, i: number) => {
                        writeUI(colW + 2, 19 + i, line.substring(0, previewW - 4), 1);
                    });
                }
            } else {
                writeUI(colW + 2, 10, `:: ${rootNode.name} ::`, 0);
                writeUI(colW + 2, 11, '─'.repeat(previewW - 4), 1);
                
                if (rootNode.children) {
                    rootNode.children.forEach((child: any, idx: number) => {
                        const y = 13 + idx;
                        const isHovered = !uiState.settingsOpen && hy === y && hx >= colW + 2 && hx < colW + previewW - 2;
                        writeUI(colW + 2, y, `[>] ${child.name}`, isHovered ? 2 : 1);
                    });
                }
            }
        } else if (rootNode.type === 'page') {
            writeUI(colW + 2, 10, `:: ${rootNode.name} ::`, 0);
            writeUI(colW + 2, 11, '─'.repeat(previewW - 4), 1);
            if (rootNode.content) {
                rootNode.content.forEach((line: string, i: number) => {
                    writeUI(colW + 2, 13 + i, line.substring(0, previewW - 4), 1);
                });
            }
        }
    }

    """
if draw_start != -1 and draw_end != -1:
    content = content[:draw_start] + new_draw + content[draw_end:]

# 3. Replace handlePointerInteraction click block
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
            } else if (gridX >= colW + 2 && gridX < COLS - 2) {
                const rootNode = DIRECTORY[uiState.navPath[0]];
                if (rootNode && rootNode.type === 'folder' && uiState.navPath.length === 1) {
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

# 4. Replace keyboard navigation logic for the new 2 column tree
# Instead of replacing, I will just rewrite it since it is tightly bound.
key_start = content.find("} else if (e.key === 'ArrowUp') {")
key_end = content.find("const handlePointerInteraction")

new_keys = """} else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (uiState.settingsOpen) {
          setUiState(s => ({ ...s, settingsCursorIdx: Math.max(0, s.settingsCursorIdx - 1) }))
      } else {
          setUiState(s => {
              const newPath = [...s.navPath];
              newPath[s.focusDepth] = Math.max(0, newPath[s.focusDepth] - 1);
              return { ...s, navPath: newPath }
          })
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (uiState.settingsOpen) {
          setUiState(s => ({ ...s, settingsCursorIdx: Math.min(18, s.settingsCursorIdx + 1) }))
      } else {
          setUiState(s => {
              const newPath = [...s.navPath];
              if (s.focusDepth === 0) {
                  newPath[0] = Math.min(DIRECTORY.length - 1, newPath[0] + 1);
              } else if (s.focusDepth === 1) {
                  const rootNode = DIRECTORY[s.navPath[0]];
                  if (rootNode && rootNode.children) {
                      newPath[1] = Math.min(rootNode.children.length - 1, newPath[1] + 1);
                  }
              }
              return { ...s, navPath: newPath }
          })
      }
    } else if (e.key === 'Escape') {
      setUiState(s => ({ ...s, settingsOpen: false }))
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
              if (s.focusDepth === 0) {
                  const rootNode = DIRECTORY[s.navPath[0]];
                  if (rootNode && rootNode.type === 'folder' && rootNode.children) {
                      return { ...s, focusDepth: 1, navPath: [s.navPath[0], 0] };
                  }
              }
              return s;
          });
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
          e.preventDefault();
          if (e.key === 'ArrowLeft') {
              setUiState(s => {
                  if (s.focusDepth > 0) {
                      return { ...s, focusDepth: 0, navPath: [s.navPath[0]] };
                  }
                  return s;
              });
          } else {
              setUiState(s => {
                  if (s.focusDepth === 0) {
                      const rootNode = DIRECTORY[s.navPath[0]];
                      if (rootNode && rootNode.type === 'folder' && rootNode.children) {
                          return { ...s, focusDepth: 1, navPath: [s.navPath[0], 0] };
                      }
                  }
                  return s;
              });
          }
      }
    }
  }

  """
if key_start != -1 and key_end != -1:
    content = content[:key_start] + new_keys + content[key_end:]

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)
print("done")
