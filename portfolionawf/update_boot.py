import sys

def rebuild():
    path = 'app/coding/page.tsx'
    with open(path, 'r') as f:
        content = f.read()

    # 1. Update the floating letters ref
    old_float = """  const floatingLetters = useRef([
    { char: 'n', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 4, dy: (Math.random() - 0.5) * 4 },
    { char: 'a', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 4, dy: (Math.random() - 0.5) * 4 },
    { char: 'w', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 4, dy: (Math.random() - 0.5) * 4 },
    { char: 'f', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 4, dy: (Math.random() - 0.5) * 4 },
    { char: 'a', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 4, dy: (Math.random() - 0.5) * 4 },
    { char: 'l', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 4, dy: (Math.random() - 0.5) * 4 }
  ]);"""
    new_float = """  const floatingLetters = useRef([
    { char: 'N', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 8, dy: (Math.random() - 0.5) * 8 },
    { char: 'A', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 8, dy: (Math.random() - 0.5) * 8 },
    { char: 'W', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 8, dy: (Math.random() - 0.5) * 8 },
    { char: 'F', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 8, dy: (Math.random() - 0.5) * 8 },
    { char: 'A', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 8, dy: (Math.random() - 0.5) * 8 },
    { char: 'L', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 8, dy: (Math.random() - 0.5) * 8 }
  ]);"""
    content = content.replace(old_float, new_float)

    # 2. Update the boot drawing logic
    boot_draw_old = """    if (!uiState.isBooted) {
        ctx.clearRect(0, 0, W, H);
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const hex2rgb = (hex: string) => {
            const v = parseInt(hex.replace('#', ''), 16);
            return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
        };
        const fgRgb = hex2rgb(activeTheme.fg);
        ctx.fillStyle = `rgb(${fgRgb.r}, ${fgRgb.g}, ${fgRgb.b})`;
        
        ctx.font = '100 24px "Helvetica Neue", Helvetica, Arial, sans-serif';
        floatingLetters.current.forEach((letter: any) => {
            letter.x += letter.dx;
            letter.y += letter.dy;
            if (letter.x <= 0 || letter.x >= W) letter.dx *= -1;
            if (letter.y <= 0 || letter.y >= H) letter.dy *= -1;
            ctx.fillText(letter.char, letter.x, letter.y);
        });
        
        ctx.font = '100 60px "Helvetica Neue", Helvetica, Arial, sans-serif';
        ctx.fillText('N A W F A L   J A F F R I', W / 2, H / 2);
        
        ctx.font = '20px monospace';
        const pulse = Math.abs(Math.sin(Date.now() / 500));
        ctx.fillStyle = `rgba(${fgRgb.r}, ${fgRgb.g}, ${fgRgb.b}, ${pulse})`;
        ctx.fillText('> PRESS ANY KEY TO MOUNT WORKSPACE _', W / 2, H - 100);
        
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        textureRef.current.needsUpdate = true;
        return;
    }"""

    boot_draw_new = """    if (!uiState.isBooted) {
        ctx.clearRect(0, 0, W, H);
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const hex2rgb = (hex: string) => {
            const v = parseInt(hex.replace('#', ''), 16);
            return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
        };
        const fgRgb = hex2rgb(activeTheme.fg);
        
        // 1. Brutalist floating screensaver letters
        ctx.font = `bold 280px ${activeFont.family}`;
        ctx.fillStyle = `rgba(${fgRgb.r}, ${fgRgb.g}, ${fgRgb.b}, 0.12)`;
        floatingLetters.current.forEach((letter: any) => {
            letter.x += letter.dx;
            letter.y += letter.dy;
            if (letter.x <= 0 || letter.x >= W) letter.dx *= -1;
            if (letter.y <= 0 || letter.y >= H) letter.dy *= -1;
            ctx.fillText(letter.char, letter.x, letter.y);
        });
        
        // 2. Old-school minimalist title
        ctx.font = `${activeFont.size}px ${activeFont.family}`;
        ctx.fillStyle = activeTheme.fg;
        ctx.fillText('NAWFAL JAFFRI', W / 2, H / 2 - charH * 2);
        
        // 3. Inverted pulsing "PRESS ANY KEY" prompt block
        const promptStr = "[ PRESS ANY KEY TO POWER ON ]";
        const pulse = Math.abs(Math.sin(Date.now() / 500));
        const pWidth = ctx.measureText(promptStr).width;
        
        // Background block
        ctx.fillStyle = `rgba(${fgRgb.r}, ${fgRgb.g}, ${fgRgb.b}, ${pulse})`;
        ctx.fillRect(W / 2 - pWidth / 2 - 16, H / 2 - charH / 2 - 8, pWidth + 32, charH + 16);
        
        // Foreground text (Inverted)
        ctx.fillStyle = activeTheme.bg;
        ctx.fillText(promptStr, W / 2, H / 2);
        
        // Reset ctx
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        textureRef.current.needsUpdate = true;
        return;
    }"""
    content = content.replace(boot_draw_old, boot_draw_new)

    with open(path, 'w') as f:
        f.write(content)

rebuild()
print("Done")
