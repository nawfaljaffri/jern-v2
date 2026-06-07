import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# Replace the ASCII generation
old_ascii = """    const nameAscii1 = ".__   __.      ___   ____    __    ____  _______    ___       __      ";
    const nameAscii2 = "|  \\ |  |     /   \\  \\   \\  /  \\  /   / |   ____|  /   \\     |  |     ";
    const nameAscii3 = "|   \\|  |    /  ^  \\  \\   \\/    \\/   /  |  |__    /  ^  \\    |  |     ";
    const nameAscii4 = "|  . `  |   /  /_\\  \\  \\            /   |   __|  /  /_\\  \\   |  |     ";
    const nameAscii5 = "|  |\\   |  /  _____  \\  \\    /\\    /    |  |    /  _____  \\  |  `----.";
    const nameAscii6 = "|__| \\__| /__/     \\__\\  \\__/  \\__/     |__|   /__/     \\__\\ |_______|";

    writeUI(2, 1, nameAscii1, 0);
    writeUI(2, 2, nameAscii2, 0);
    writeUI(2, 3, nameAscii3, 0);
    writeUI(2, 4, nameAscii4, 0);
    writeUI(2, 5, nameAscii5, 0);
    writeUI(2, 6, nameAscii6, 0);
    writeUI(66, 6, "[ CREATIVE / ENGINEER ]", 1);"""

new_ascii = """    const nameAscii1 = "░██  ░█    ░██   ░█       ░█  ░██████    ░██   ░█     ";
    const nameAscii2 = "░███ ░█   ░█░█   ░█   ░█  ░█  ░█        ░█░█   ░█     ";
    const nameAscii3 = "░█░██░█  ░█████  ░█ ░████ ░█  ░█████   ░█████  ░█     ";
    const nameAscii4 = "░█ ░███  ░█  ░█  ░███  ░████  ░█       ░█  ░█  ░█     ";
    const nameAscii5 = "░█  ░██  ░█  ░█  ░██    ░███  ░█       ░█  ░█  ░██████";

    writeUI(2, 1, nameAscii1, 0);
    writeUI(2, 2, nameAscii2, 0);
    writeUI(2, 3, nameAscii3, 0);
    writeUI(2, 4, nameAscii4, 0);
    writeUI(2, 5, nameAscii5, 0);
    writeUI(58, 5, "[ CREATIVE / ENGINEER ]", 1);"""

if old_ascii in content:
    content = content.replace(old_ascii, new_ascii)
else:
    print("Could not find old ASCII block.")

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)

print("Patch 5 applied.")
