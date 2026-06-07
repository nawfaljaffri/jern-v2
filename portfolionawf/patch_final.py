import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# 1. Add scrollAccRef if missing
if 'const scrollAccRef = useRef(0)' not in content:
    content = content.replace("const hoverRef = useRef({ x: -1, y: -1 })", "const hoverRef = useRef({ x: -1, y: -1 })\n  const scrollAccRef = useRef(0)")

# 2. Replace ASCII block
old_block = """    const nameAscii1 = "█▄ █ ▄▀▄ █ █ █ █▀ ▄▀▄ █     █ ▄▀▄ █▀ █▀ █▀▄ █";
    const nameAscii2 = "█ ▀█ █▀█ ▀▄▀▄▀ █▀ █▀█ █▄▄ ▄▄█ █▀█ █▀ █▀ █▀▄ █";
    writeUI(2, 1, nameAscii1, 0);
    writeUI(2, 2, nameAscii2, 0);
    writeUI(2, 4, "[ CREATIVE / ENGINEER ]", 1);"""

new_block = """    const nameAscii1 = ".__   __.      ___   ____    __    ____  _______    ___       __      ";
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
    writeUI(38, 7, "[ CREATIVE / ENGINEER ]", 1);"""

content = content.replace(old_block, new_block)

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)

print("Final patch applied.")
