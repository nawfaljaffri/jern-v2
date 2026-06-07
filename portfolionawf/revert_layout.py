import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# 1. Restore the DIRECTORY array
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
if dir_match:
    content = content[:dir_match.start()] + new_dir + content[dir_match.end():]
else:
    print("Failed to replace DIRECTORY")

# 2. Re-insert the ASCII logo and update the render logic
draw_start = content.find('writeUI(2, 2, "NAWFAL JAFFRI", 0);')
draw_end = content.find('const isHoverBack = hy === 2 && hx >= startXTop + 14 + soundText.length + 2 && hx < startXTop + 14 + soundText.length + 2 + 10\n')
draw_end = content.find('writeUI(startXTop + 14 + soundText.length + 2, 2, \'[ ← BACK ]\', isHoverBack ? 2 : 0)', draw_end) + 84

if draw_start != -1 and draw_end != -1:
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
    writeUI(startXTop + 14 + soundText.length + 2, 6, '[ ← BACK ]', isHoverBack ? 2 : 0)"""
    content = content[:draw_start] + new_draw + content[draw_end:]
else:
    print("Failed to replace DRAW section")

# 3. Restore BoxY to 9 and height to 17
content = content.replace('const boxY = 5;', 'const boxY = 9;')
content = content.replace('drawBoxUI(0, boxY, navW, 21,', 'drawBoxUI(0, boxY, navW, 17,')
content = content.replace('drawBoxUI(navW, boxY, previewW, 21,', 'drawBoxUI(navW, boxY, previewW, 17,')
content = content.replace('drawScrollbar(COLS - 2, boxY + 1, 19,', 'drawScrollbar(COLS - 2, boxY + 1, 15,')
content = content.replace('offset, 19);', 'offset, 15);')
content = content.replace('y <= boxY + 19', 'y <= boxY + 15')

# 4. Restore the `:: ABOUT ::` headers for pages
page_render_start = content.find("if (node.type === 'page') {")
page_render_end = content.find("} else if (node.type === 'folder') {")

if page_render_start != -1 and page_render_end != -1:
    new_page_render = """if (node.type === 'page') {
            const cleanName = node.name.replace(/[0-9.]/g, '').trim();
            writeUI(pStartX, boxY + 1, `:: ${cleanName} ::`, 0);
            writeUI(pStartX, boxY + 3, '─'.repeat(pWidth), 1);
            if (node.content) {
                node.content.forEach((line: any, i: any) => {
                    const y = boxY + 5 + i - uiState.scrollOffset;
                    if (y >= boxY + 5 && y <= boxY + 15) {
                        writeUI(pStartX, y, line.substring(0, pWidth), 1);
                    }
                });
                drawScrollbar(COLS - 2, boxY + 1, 15, node.content.length + 4, uiState.scrollOffset, 15);
            }
        """
    content = content[:page_render_start] + new_page_render + content[page_render_end:]
else:
    print("Failed to replace PAGE RENDER")

# 5. Fix Pointer Interaction y coordinates
ptr_start = content.find('const soundText = uiState.soundOn ?')
ptr_end = content.find('if (gridY === 2 && isClick) {') + 29
if ptr_start != -1 and ptr_end != -1:
    content = content.replace('if (gridY === 2 && isClick) {', 'if (gridY === 6 && isClick) {')
content = content.replace('if (gridY >= boxY && gridY < boxY + 21) {', 'if (gridY >= boxY && gridY < boxY + 17) {')

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)

print("Reverted to 5:55am layout perfectly.")
