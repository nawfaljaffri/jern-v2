import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# 1. Update THEMES
old_themes = r"const THEMES = \[\n  \{ name: 'WHITE',  fg: '#FFFFFF', bg: '#000000', dim: '#666666', bloom: 0\.46, radius: 1\.80, thresh: 0\.30, burnIn: 0\.80, bright: 1\.115, satur: 1\.24, crush: 0\.30, grain: 0\.15, curve: 0\.20 \},"
new_themes = "const THEMES = [\n  { name: 'WHITE',  fg: '#000000', bg: '#FFFFFF', dim: '#888888', bloom: 0.20, radius: 0.50, thresh: 0.50, burnIn: 0.10, bright: 1.00, satur: 1.00, crush: 0.10, grain: 0.05, curve: 0.05 },"
content = re.sub(old_themes, new_themes, content)

# 2. Update DIRECTORY array
start_dir = content.find('const DIRECTORY: any[] = [')
end_dir = content.find('\n];\n', start_dir) + 3

new_dir = """const DIRECTORY: any[] = [
  {
    name: '01. PROJECTS',
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
        desc: 'Browser-based operating system interface relying solely on canvas rendering. Built with custom shaders and immediate mode GUI concepts.',
        links: '[GitHub]'
      },
      {
        name: 'brand-identity-v2',
        type: 'project',
        date: '2024-01-10',
        lang: 'Figma / Illustrator',
        status: 'ARCHIVED',
        desc: 'Complete visual identity overhaul for a fintech startup, including logo mark, typography system, and component library.',
        links: '[Behance]'
      }
    ]
  },
  {
    name: '02. EXPERIENCE',
    type: 'page',
    content: [
      'PROFESSIONAL EXPERIENCE',
      '',
      'Susty (Dubai, UAE)',
      'Lead Data Scientist | 2023 - Present',
      '- Architected core machine learning pipelines.',
      '- Led the development of predictive models.',
      '',
      'Freelance UI/UX Designer',
      '2021 - 2023',
      '- Designed web and mobile applications for global clients.',
      '- Focused on minimalist, high-performance interfaces.',
    ]
  },
  {
    name: '03. ABOUT',
    type: 'page',
    content: [
      'Currently navigating the intersection of machine learning,',
      'data, management, and branding. I build systems that',
      'bridge the gap between algorithmic precision and',
      'human-centric design.',
      '',
      'Status: Online',
      'Primary Focus: Data Science & AI Engineering,',
      'Brand Architecture, UI/UX Design.'
    ]
  },
  {
    name: '04. CONTACT',
    type: 'page',
    content: [
      'COMMUNICATION CHANNELS',
      '',
      'Email  : hello@nawfaljaffri.com',
      'GitHub : github.com/nawfaljaffri',
      'Twitter: @nawfaljaffri',
      'LinkedIn: linkedin.com/in/nawfaljaffri',
      '',
      'PGP Key: 0x9A8B7C6D5E4F3A2B',
      'Awaiting secure transmission...'
    ]
  }
];"""
content = content[:start_dir] + new_dir + content[end_dir:]

# 3. Update DrawCanvas logic
# We need to replace from `writeUI(COLS - 30, 1,` down to `if (proj.desc)` ... `}`
start_draw = content.find('writeUI(COLS - 30, 1, `OS: ${sysInfo.os}`, 3);')
end_draw = content.find('drawBoxUI(0, 26, COLS, 4, \'TERMINAL\')', start_draw)

new_draw = """    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    writeUI(COLS - 30, 1, `SYS TIME: ${timeStr}`, 3);

    const soundText = uiState.soundOn ? '[ SOUND: ON ]' : '[ SOUND: MUTED ]'
    const topBarRight = `[ SETTINGS ]  ${soundText}  [ ← BACK ]`
    const startXTop = COLS - topBarRight.length - 2
    const hx = hoverRef.current.x
    const hy = hoverRef.current.y
    const isHoverSettings = hy === 2 && hx >= startXTop && hx <= startXTop + 11
    const isHoverSound = hy === 2 && hx >= startXTop + 14 && hx < startXTop + 14 + soundText.length
    const isHoverBack = hy === 2 && hx >= startXTop + 14 + soundText.length + 2 && hx < startXTop + 14 + soundText.length + 2 + 10
    
    writeUI(startXTop, 2, '[ SETTINGS ]', isHoverSettings ? 2 : 0)
    writeUI(startXTop + 14, 2, soundText, isHoverSound ? 2 : 0)
    writeUI(startXTop + 14 + soundText.length + 2, 2, '[ ← BACK ]', isHoverBack ? 2 : 0)

    const navW = 25;
    const boxY = 9; // Box starts at 9
    drawBoxUI(0, boxY, navW, 17, 'DIRECTORY');
    
    DIRECTORY.forEach((item, i) => {
        const itemY = boxY + 2 + i;
        const isHovered = !uiState.settingsOpen && hy === itemY && hx > 0 && hx < navW;
        const isSelected = uiState.selectedNavIdx === i;
        let color = 0;
        if (isHovered) color = 2;
        else if (isSelected && uiState.focusColumn === 1) color = 2;
        else if (isSelected) color = 1;
        writeUI(2, itemY, `[${isSelected ? '*' : ' '}] ${item.name}`, color);
    });

    const previewW = COLS - navW;
    drawBoxUI(navW, boxY, previewW, 17, 'PREVIEW');
    
    const node = DIRECTORY[uiState.selectedNavIdx];
    const pStartX = navW + 2;
    const pWidth = previewW - 6; 
    
    const drawScrollbar = (x, y, h, contentLines, offset, viewLines) => {
        for(let i=0; i<h; i++) writeUI(x, y+i, '│', 1);
        if (contentLines <= viewLines) {
            writeUI(x, y, '█', 0);
        } else {
            const thumbH = Math.max(1, Math.floor((viewLines / contentLines) * h));
            const maxOffset = contentLines - viewLines;
            const clampedOffset = Math.max(0, Math.min(maxOffset, offset));
            const thumbY = Math.floor((clampedOffset / maxOffset) * (h - thumbH));
            for(let i=0; i<thumbH; i++) writeUI(x, y + thumbY + i, '█', 0);
        }
    };

    if (node) {
        if (node.type === 'page') {
            if (node.content) {
                node.content.forEach((line, i) => {
                    const y = boxY + 2 + i - uiState.scrollOffset;
                    if (y >= boxY + 1 && y <= boxY + 15) {
                        writeUI(pStartX, y, line.substring(0, pWidth), 1);
                    }
                });
                drawScrollbar(COLS - 2, boxY + 1, 15, node.content.length, uiState.scrollOffset, 15);
            }
        } else if (node.type === 'folder') {
            if (!uiState.viewingProjectDetail) {
                if (node.children) {
                    node.children.forEach((proj, i) => {
                        const lineDist = 2;
                        const y = boxY + 2 + i * lineDist - uiState.scrollOffset;
                        if (y >= boxY + 1 && y <= boxY + 15) {
                            const isHovered = !uiState.settingsOpen && hy === y && hx >= pStartX && hx < COLS - 3;
                            const isSelected = uiState.selectedProjectIdx === i;
                            let color = 0;
                            if (isHovered) color = 2;
                            else if (isSelected && uiState.focusColumn === 2) color = 2;
                            else if (isSelected) color = 1;
                            writeUI(pStartX, y, `[${isSelected ? '>' : ' '}] ${proj.name}`, color);
                            if (y + 1 <= boxY + 15) writeUI(pStartX + 4, y + 1, `${proj.lang} | ${proj.status}`, 1);
                        }
                    });
                    drawScrollbar(COLS - 2, boxY + 1, 15, node.children.length * 2, uiState.scrollOffset, 15);
                }
            } else {
                const proj = node.children[uiState.selectedProjectIdx];
                const isHoverBackProj = hy === boxY + 1 && hx >= pStartX && hx <= pStartX + 9;
                writeUI(pStartX, boxY + 1, '[ ← BACK ]', isHoverBackProj ? 2 : 1); 
                writeUI(pStartX + 11, boxY + 1, `${proj.name}`, 0);
                
                const assetH = 8;
                for(let r=0; r<assetH; r++) {
                    if (r === 0 || r === assetH-1) writeUI(pStartX, boxY + 3 + r, '░'.repeat(pWidth), 3);
                    else writeUI(pStartX, boxY + 3 + r, '░' + ' '.repeat(pWidth-2) + '░', 3);
                }
                writeUI(pStartX + Math.floor(pWidth/2) - 13, boxY + 3 + Math.floor(assetH/2), "[ VISUAL ASSET RENDER ZONE ]", 1);
                
                if (proj.desc) writeUI(pStartX, boxY + 12, `${proj.desc.replace(/\\n/g, ' ').substring(0, pWidth)}`, 0);
                writeUI(pStartX, boxY + 15, `Stack: ${proj.lang}    |    Links: ${proj.links || '[GitHub]'}`, 0);
            }
        }
    }

    """
content = content[:start_draw] + new_draw + content[end_draw:]

# 4. Update pointer interaction
start_ptr = content.find('if (gridY === 6 && isClick) {')
end_ptr = content.find('  return (\n')
new_ptr = """if (gridY === 2 && isClick) {
       if (gridX >= startXTop + 14 + soundText.length + 2 && gridX < startXTop + 14 + soundText.length + 2 + 10) {
           window.location.href = '/'
           return
       }
       if (gridX >= startXTop + 14 && gridX < startXTop + 14 + soundText.length) {
           playTick();
           initAudio();
           startHum();
           toggleMute();
           setUiState(s => ({ ...s, soundOn: !isMuted }));
           return;
       }
       if (gridX >= startXTop && gridX <= startXTop + 11) {
           playModalOpen();
           setUiState(s => ({ ...s, settingsOpen: true }))
           return
       }
    }

    const navW = 25;
    const boxY = 9;
    if (isClick && !uiState.settingsOpen) {
        if (gridY >= boxY && gridY < boxY + 17) {
            if (gridX > 0 && gridX < navW) {
                const idx = gridY - (boxY + 2);
                if (idx >= 0 && idx < DIRECTORY.length) {
                    playTick();
                    setUiState(s => ({ ...s, selectedNavIdx: idx, focusColumn: 1, selectedProjectIdx: 0, viewingProjectDetail: false, scrollOffset: 0 }))
                }
            } else if (gridX >= navW && gridX < COLS) {
                const node = DIRECTORY[uiState.selectedNavIdx];
                if (node && node.type === 'folder' && !uiState.viewingProjectDetail) {
                    const lineDist = 2;
                    const idx = Math.floor((gridY - (boxY + 2) + uiState.scrollOffset) / lineDist);
                    if (idx >= 0 && idx < node.children.length && (gridY - (boxY + 2) + uiState.scrollOffset) % lineDist === 0) {
                        playTick();
                        setUiState(s => ({ ...s, selectedProjectIdx: idx, focusColumn: 2, viewingProjectDetail: true, scrollOffset: 0 }))
                    } else {
                        setUiState(s => ({ ...s, focusColumn: 2 }))
                    }
                } else if (node && node.type === 'folder' && uiState.viewingProjectDetail) {
                    const pStartX = navW + 2;
                    if (gridY === boxY + 1 && gridX >= pStartX && gridX <= pStartX + 9) {
                        playTick();
                        setUiState(s => ({ ...s, viewingProjectDetail: false, scrollOffset: 0 }))
                    }
                }
            }
        }
    }
  }

"""
content = content[:start_ptr] + new_ptr + content[end_ptr:]

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)

print("Layout updated.")
