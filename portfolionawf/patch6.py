import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# 1. Remove the shaded ASCII block
old_ascii = """    const nameAscii1 = "░██  ░█    ░██   ░█       ░█  ░██████    ░██   ░█     ";
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

new_ascii = """    writeUI(40, 4, "[ CREATIVE / ENGINEER ]", 1);"""

if old_ascii in content:
    content = content.replace(old_ascii, new_ascii)
else:
    print("Could not find old ASCII block.")

# 2. Add the custom scaled render at the end of drawCanvas
old_render = """    buffer.renderToCanvas(ctx, charW, charH, activeFont, activeTheme);
  }"""

new_render = """    buffer.renderToCanvas(ctx, charW, charH, activeFont, activeTheme);

    // Custom scaled render for the slanted ASCII logo
    ctx.save();
    ctx.font = `14px ${activeFont.css}`;
    ctx.fillStyle = activeTheme.colors[0];
    ctx.textBaseline = 'top';
    const logoAscii = [
        ".__   __.      ___   ____    __    ____  _______    ___       __      ",
        "|  \\\\ |  |     /   \\\\  \\\\   \\\\  /  \\\\  /   / |   ____|  /   \\\\     |  |     ",
        "|   \\\\|  |    /  ^  \\\\  \\\\   \\\\/    \\\\/   /  |  |__    /  ^  \\\\    |  |     ",
        "|  . `  |   /  /_\\\\  \\\\  \\\\            /   |   __|  /  /_\\\\  \\\\   |  |     ",
        "|  |\\\\   |  /  _____  \\\\  \\\\    /\\\\    /    |  |    /  _____  \\\\  |  `----.",
        "|__| \\\\__| /__/     \\\\__\\\\  \\\\__/  \\\\__/     |__|   /__/     \\\\__\\\\ |_______|"
    ];
    logoAscii.forEach((line, i) => {
        ctx.fillText(line, 2 * charW, (offsetY + 1) * charH + i * 16);
    });
    ctx.restore();
  }"""

if old_render in content:
    content = content.replace(old_render, new_render)
else:
    print("Could not find render call block.")

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)

print("Patch 6 applied.")
