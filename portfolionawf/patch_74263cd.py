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
        desc: 'Neural architecture search experiments.\\nExplores evolutionary algorithms to\\noptimize network topologies for low-power\\nedge devices.',
        links: '[GitHub] [Live Demo]'
      },
      {
        name: 'noter-app',
        type: 'project',
        date: '2024-01-20',
        lang: 'TypeScript / React',
        status: 'DEPRECATED',
        desc: 'A minimal note-taking PWA.\\nFeatures offline-first sync using IndexedDB\\nand CRDTs for conflict resolution.',
        links: '[GitHub]'
      },
      {
        name: 'portfolio-site',
        type: 'project',
        date: '2024-06-01',
        lang: 'Next.js / WebGL',
        status: 'ACTIVE',
        desc: 'This very website. Swiss Punk graphic\\ndesign meets high-performance React\\narchitecture.',
        links: '[GitHub]'
      },
      {
        name: 'game-engine',
        type: 'project',
        date: '2024-04-10',
        lang: 'C++ / OpenGL',
        status: 'ARCHIVED',
        desc: 'Custom 2D game engine built from scratch.\\nImplements an Entity Component System (ECS)\\nand custom physics solvers.',
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
      'University Of Birmingham: BSc. Artificial Intelligence and Computer Science (01/2025-06/2028)',
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

# 2. Update the draw header
draw_start = content.find("drawBoxUI(0, 0, COLS, 8, 'cpu & mem')")
draw_end = content.find("const colW = 20;")

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

    """
content = content[:draw_start] + new_draw + content[draw_end:]

# 3. Update the pointer logic to match the new header Y position (6 instead of 1)
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

# 4. Modify Miller Column box titles and Y offset
# Current Miller column uses `drawBoxUI(currentX, 8, ...)` we want `drawBoxUI(currentX, 9, ...)`
content = content.replace("drawBoxUI(currentX, 8,", "drawBoxUI(currentX, 9,")
# Change `const colTitle = depth === 0 ? 'SYSTEM' : activeNode?.name || ''`
# to `const colTitle = depth === 0 ? 'DIRECTORY' : depth === 1 ? 'PREVIEW' : ''`
content = content.replace("const colTitle = depth === 0 ? 'SYSTEM' : activeNode?.name || ''", 
                          "const colTitle = depth === 0 ? 'DIRECTORY' : depth === 1 ? 'PREVIEW' : ''")
content = content.replace("writeUI(currentX + 1, 8 + 2 + i, textContent, isHovered ? 2 : (isSelected ? 1 : 0))", 
                          "writeUI(currentX + 1, 9 + 2 + i, textContent, isHovered ? 2 : (isSelected ? 2 : 1))")
# Inside `const handlePointerInteraction`, `if (gridY >= 10 && gridY < 28) {` needs to change to `if (gridY >= 11 && gridY < 28)` since boxes moved down.
content = content.replace("if (gridY >= 10 && gridY < 28) {", "if (gridY >= 11 && gridY < 28) {")
content = content.replace("const idx = gridY - 10;", "const idx = gridY - 11;")


with open('app/coding/page.tsx', 'w') as f:
    f.write(content)
print("done")
