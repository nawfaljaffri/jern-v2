import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# 1. Update DIRECTORY
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
        desc: 'Neural architecture search experiments. Explores evolution\\noptimize network topologies for low-power edge devices.',
        links: '[GitHub] [Live Demo]'
      },
      {
        name: 'noter-app',
        type: 'project',
        date: '2024-01-20',
        lang: 'TypeScript / React',
        status: 'DEPRECATED',
        desc: 'A minimal note-taking PWA. Features offline-first sync\\nusing IndexedDB and CRDTs for conflict resolution.',
        links: '[GitHub]'
      },
      {
        name: 'portfolio-site',
        type: 'project',
        date: '2024-06-01',
        lang: 'Next.js / WebGL',
        status: 'ACTIVE',
        desc: 'This very website. Swiss Punk graphic design meets\\nhigh-performance React architecture.',
        links: '[GitHub]'
      },
      {
        name: 'game-engine',
        type: 'project',
        date: '2024-04-10',
        lang: 'C++ / OpenGL',
        status: 'ARCHIVED',
        desc: 'Custom 2D game engine built from scratch. Implements an\\nEntity Component System (ECS) and custom physics solvers.',
        links: '[GitHub]'
      }
    ]
  },
  {
    name: '02. EXPERIENCE',
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
    name: '03. ABOUT',
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
  },
  {
    name: '04. CONTACT',
    type: 'page',
    content: [
      'Email: nawfaljaffri@gmail.com',
      'LinkedIn: linkedin.com/in/nawfaljaffri',
      'GitHub: github.com/nawfaljaffri',
      'Phone: +971 50 4945990',
      '',
      'Available for freelance projects, open source collaboration,',
      'and full-time internships.'
    ]
  }
];"""
dir_match = re.search(r'const DIRECTORY: any\[\] = \[.*?\];', content, re.DOTALL)
content = content[:dir_match.start()] + new_dir + content[dir_match.end():]

# 2. Update the drawCanvas function
draw_start = content.find("drawBoxUI(0, 0, COLS, 8, 'cpu & mem')")
draw_end = content.find("drawBoxUI(0, 26, COLS, 4, 'TERMINAL')")

new_draw = """const nameAscii1 = ".__   __.      ___   ____    __    ____  _______    ___       __      ";
    const nameAscii2 = "|  \\\\ |  |     /   \\\\  \\\\   \\\\  /  \\\\  /   / |   ____|  /   \\\\     |  |     ";
    const nameAscii3 = "|   \\\\|  |    /  ^  \\\\  \\\\   \\\\/    \\\\/   /  |  |__    /  ^  \\\\    |  |     ";
    const nameAscii4 = "|  . `  |   /  /_\\\\  \\\\  \\\\            /   |   __|  /  /_\\\\  \\\\   |  |     ";
    const nameAscii5 = "|  |\\\\   |  /  _____  \\\\  \\\\    /\\\\    /    |  |    /  _____  \\\\  |  `----.";
    const nameAscii6 = "|__| \\\\__| /__/     \\\\__\\\\  \\\\__/  \\\\__/     |__|   /__/     \\\\__\\\\ |_______|";

    writeUI(2, 1, nameAscii1, 0);
    writeUI(2, 2, nameAscii2, 0);
    writeUI(2, 3, nameAscii3, 0);
    writeUI(2, 4, nameAscii4, 0);
    writeUI(2, 5, nameAscii5, 0);
    writeUI(2, 6, nameAscii6, 0);

    writeUI(40, 7, "[ CREATIVE / ENGINEER ]", 1);

    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    writeUI(COLS - 30, 1, "OS: macOS", 0);
    writeUI(COLS - 30, 2, "MEM: 16 GB", 0);
    writeUI(COLS - 30, 3, "CORES: 8", 0);
    writeUI(COLS - 30, 4, `SYS TIME: ${timeStr}`, 0);

    const soundText = uiState.soundOn ? '[ SOUND: ON ]' : '[ SOUND: MUTED ]'
    const topBarRight = `[ SETTINGS ]  ${soundText}  [ ← BACK ]`
    const startXTop = COLS - topBarRight.length - 2
    
    const hx = hoverRef.current.x
    const hy = hoverRef.current.y
    const isHoverSettings = hy === 6 && hx >= startXTop && hx <= startXTop + 11
    const isHoverSound = hy === 6 && hx >= startXTop + 14 && hx < startXTop + 14 + soundText.length
    const isHoverBack = hy === 6 && hx >= startXTop + 14 + soundText.length + 2 && hx < startXTop + 14 + soundText.length + 2 + 10
    
    writeUI(startXTop, 6, '[ SETTINGS ]', isHoverSettings ? 2 : 0)
    writeUI(startXTop + 14, 6, soundText, isHoverSound ? 2 : 0)
    writeUI(startXTop + 14 + soundText.length + 2, 6, '[ ← BACK ]', isHoverBack ? 2 : 0)

    const colW = 30; // wider columns for projects text
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
            
            let color = 1;
            if (isHovered) color = 2;
            else if (isSelected) color = 2;

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
            drawBoxUI(currentX, 9, previewW, 16, 'PREVIEW');
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
    }

    """
content = content[:draw_start] + new_draw + content[draw_end:]


# 3. Update pointer logic and click bounds
ptr_start = content.find("const topBarRightStr = `[ SETTINGS ]  ${soundText}  [ ← BACK ]`")
if ptr_start != -1:
    ptr_start = content.rfind("const soundText =", 0, ptr_start)
ptr_end = content.find("const colW = 20;", ptr_start)

if ptr_start != -1 and ptr_end != -1:
    new_ptr = """const soundText = uiState.soundOn ? '[ SOUND: ON ]' : '[ SOUND: MUTED ]'
    const topBarRight = `[ SETTINGS ]  ${soundText}  [ ← BACK ]`
    const startXTop = COLS - topBarRight.length - 2

    if (gridY === 6 && isClick) {
      if (gridX >= startXTop && gridX <= startXTop + 11) {
        playModalOpen();
        setUiState(prev => ({ ...prev, settingsOpen: true, settingsCursorIdx: 0 }))
        return
      }
      if (gridX >= startXTop + 14 && gridX < startXTop + 14 + soundText.length) {
        playTick();
        initAudio();
        startHum();
        toggleMute();
        setUiState(prev => ({ ...prev, soundOn: !prev.soundOn }))
        return
      }
      if (gridX >= startXTop + 14 + soundText.length + 2) {
        window.location.href = '/'
        return
      }
    }

    """
    content = content[:ptr_start] + new_ptr + content[ptr_end:]

# Fix hardcoded colW and offset in pointer logic loop
content = content.replace("const colW = 20;", "const colW = 30;")
content = content.replace("if (gridY >= 10 && gridY < 28) {", "if (gridY >= 11 && gridY < 26) {")
content = content.replace("const idx = gridY - 10;", "const idx = gridY - 11;")

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)
print("done")
