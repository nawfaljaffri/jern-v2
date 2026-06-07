with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

start_str = "drawBoxUI(0, 0, COLS, 8, 'cpu & mem')"
end_str = "writeUI(startX + 14 + soundText.length + 2, 1, '[ ← BACK ]', isHoverBack ? 2 : 0)"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    end_idx += len(end_str)
    
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
    const startX = COLS - topBarRight.length - 2
    
    const hx = hoverRef.current.x
    const hy = hoverRef.current.y
    const isHoverSettings = hy === 6 && hx >= startX && hx <= startX + 11
    const isHoverSound = hy === 6 && hx >= startX + 14 && hx < startX + 14 + soundText.length
    const isHoverBack = hy === 6 && hx >= startX + 14 + soundText.length + 2 && hx < startX + 14 + soundText.length + 2 + 10
    
    writeUI(startX, 6, '[ SETTINGS ]', isHoverSettings ? 2 : 0)
    writeUI(startX + 14, 6, soundText, isHoverSound ? 2 : 0)
    writeUI(startX + 14 + soundText.length + 2, 6, '[ ← BACK ]', isHoverBack ? 2 : 0)"""
    
    content = content[:start_idx] + new_draw + content[end_idx:]
    with open('app/coding/page.tsx', 'w') as f:
        f.write(content)
    print("Step 2 done")
else:
    print("Step 2 failed")
