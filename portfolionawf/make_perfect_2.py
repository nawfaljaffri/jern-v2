import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# 1. Update DIRECTORY
new_dir = """const DIRECTORY: any[] = [
  {
    name: '01. ABOUT',
    type: 'page',
    content: [
      'Currently navigating the intersection of machine learning,',
      'data, management, and branding. I build systems that',
      'bridge the gap between algorithmic precision and',
      'human-centric design.',
      '',
      'I am a 1st-year AI and Computer Science student at the',
      'University of Birmingham Dubai. My work is defined by',
      'a hybrid methodology: the logical rigor of artificial',
      'intelligence and the emotional resonance of graphic design.',
      '',
      'Whether I am leading a team as a Vice President at AIESEC,',
      'leading the Google Developers Group at Uni of Birmingham',
      'Dubai, or teaching people, I am driven by the same goal:'
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
    name: '03. PROJECTS',
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
      }
    ]
  },
  {
    name: '04. ARTWORKS',
    type: 'folder',
    children: [
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
    name: '05. CONTACT',
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
dir_match = re.search(r'const DIRECTORY: any\[\] = \[.*?\];', content, re.DOTALL)
content = content[:dir_match.start()] + new_dir + content[dir_match.end():]

# 2. Update drawCanvas completely from `drawBoxUI(0, 0, COLS, 8, 'cpu & mem')` down to `drawBoxUI(0, 26, COLS, 4, 'TERMINAL')`
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

    writeUI(4, 7, "[ CREATIVE / ENGINEER ]", 1);

    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    const soundText = uiState.soundOn ? '[ SOUND: ON ]' : '[ SOUND: MUTED ]'
    const topBarRight = `[ SETTINGS ]  ${soundText}  [ ← BACK ]`
    const startXTop = COLS - topBarRight.length - 2
    
    writeUI(startXTop - timeStr.length - 3, 6, timeStr, 0);

    const hx = hoverRef.current.x
    const hy = hoverRef.current.y
    const isHoverSettings = hy === 6 && hx >= startXTop && hx <= startXTop + 11
    const isHoverSound = hy === 6 && hx >= startXTop + 14 && hx < startXTop + 14 + soundText.length
    const isHoverBack = hy === 6 && hx >= startXTop + 14 + soundText.length + 2 && hx < startXTop + 14 + soundText.length + 2 + 10
    
    writeUI(startXTop, 6, '[ SETTINGS ]', isHoverSettings ? 2 : 0)
    writeUI(startXTop + 14, 6, soundText, isHoverSound ? 2 : 0)
    writeUI(startXTop + 14 + soundText.length + 2, 6, '[ ← BACK ]', isHoverBack ? 2 : 0)

    const boxY = 9;
    const navW = 20;
    const previewW = COLS - navW;
    drawBoxUI(0, boxY, navW, 17, 'DIRECTORY');
    drawBoxUI(navW, boxY, previewW, 17, 'PREVIEW');

    const selIdx = uiState.navPath.length > 0 ? uiState.navPath[0] : -1;
    let activeNode = null;

    DIRECTORY.forEach((item, idx) => {
        const y = boxY + 2 + idx;
        const isSelected = idx === selIdx;
        const prefix = item.type === 'folder' ? (isSelected ? '[*] ' : '[ ] ') : (isSelected ? '[*] ' : '[ ] ');
        const textContent = `${prefix}${item.name}`;
        
        const isHovered = !uiState.settingsOpen && hy === y && hx >= 1 && hx < navW - 1;
        let color = 0;
        if (isHovered) color = 2;
        else if (isSelected) color = 2;

        writeUI(1, y, textContent, color);
    });

    if (selIdx >= 0 && selIdx < DIRECTORY.length) {
        activeNode = DIRECTORY[selIdx];
    }

    if (activeNode) {
        const pStartX = navW + 2;
        const pWidth = previewW - 4;

        if (activeNode.type === 'page') {
            const cleanName = activeNode.name.replace(/[0-9.]/g, '').trim();
            writeUI(pStartX, boxY + 1, `:: ${cleanName} ::`, 0);
            writeUI(pStartX, boxY + 3, '─'.repeat(pWidth), 1);
            if (activeNode.content) {
                activeNode.content.forEach((line: any, i: any) => {
                    const y = boxY + 5 + i;
                    if (y >= boxY + 5 && y <= boxY + 15) {
                        writeUI(pStartX, y, line.substring(0, pWidth), 1);
                    }
                });
            }
        } else if (activeNode.type === 'folder') {
            if (activeNode.children) {
                activeNode.children.forEach((child: any, i: number) => {
                    writeUI(pStartX, boxY + 1 + i*2, `[>] ${child.name}`, 1);
                    writeUI(pStartX, boxY + 2 + i*2, `    ${child.lang} | ${child.status}`, 0);
                });
            }
        }
    }

    """
content = content[:draw_start] + new_draw + content[draw_end:]

# 3. Update pointer logic (mouse clicking on DIRECTORY items)
# We find exactly where `if (gridY === 1 && isClick) {` starts
# And replace all the way down to the closing brace before `const handlePointerInteraction =` ends!
# Actually, the end of `handlePointerInteraction` is `if (gridY === 28 && gridX >= 2) {` which handles the terminal typing focus!
# Wait, let's find `const soundText = uiState.soundOn` IN `handlePointerInteraction`.
# We know it starts right after `if (uiState.settingsOpen) { ... }` block ends with `return; \n       }\n    }`
# Let's search for `const topBarRightStr =`
ptr_start = content.find("const topBarRightStr = `[ SETTINGS ]  ${soundText}  [ ← BACK ]`")
if ptr_start != -1:
    # Walk backward to grab the preceding `const soundText` line
    ptr_start = content.rfind("const soundText =", 0, ptr_start)
    
ptr_end = content.find("if (gridY === 28 && gridX >= 2) {")

if ptr_start != -1 and ptr_end != -1:
    new_ptr = """const soundText = uiState.soundOn ? '[ SOUND: ON ]' : '[ SOUND: MUTED ]'
    const topBarRight = `[ SETTINGS ]  ${soundText}  [ ← BACK ]`
    const startXTop = COLS - topBarRight.length - 2

    if (gridY === 6 && isClick) {
      if (gridX >= startXTop && gridX <= startXTop + 11) {
        setUiState(prev => ({ ...prev, settingsOpen: true, settingsCursorIdx: 0 }))
        return
      }
      if (gridX >= startXTop + 14 && gridX < startXTop + 14 + soundText.length) {
        setUiState(prev => ({ ...prev, soundOn: !prev.soundOn }))
        return
      }
      if (gridX >= startXTop + 14 + soundText.length + 2) {
        window.location.href = '/'
        return
      }
    }

    const boxY = 9;
    if (gridY >= boxY + 2 && gridY < boxY + 2 + DIRECTORY.length) {
        const rowIdx = gridY - (boxY + 2);
        if (isClick) {
            setUiState(prev => ({
                ...prev,
                navPath: [rowIdx],
                focusDepth: 0,
                scrollOffset: 0
            }))
        }
    }

    """
    content = content[:ptr_start] + new_ptr + content[ptr_end:]

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)
print("done")
