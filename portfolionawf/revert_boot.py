import sys

def rebuild():
    path = 'app/coding/page.tsx'
    with open(path, 'r') as f:
        content = f.read()

    # 1. Replace bootStartRef with floatingLetters
    old_boot = "const bootStartRef = useRef<number>(Date.now());"
    new_float = """  const floatingLetters = useRef([
    { char: 'n', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 4, dy: (Math.random() - 0.5) * 4 },
    { char: 'a', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 4, dy: (Math.random() - 0.5) * 4 },
    { char: 'w', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 4, dy: (Math.random() - 0.5) * 4 },
    { char: 'f', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 4, dy: (Math.random() - 0.5) * 4 },
    { char: 'a', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 4, dy: (Math.random() - 0.5) * 4 },
    { char: 'l', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 4, dy: (Math.random() - 0.5) * 4 }
  ]);"""
    content = content.replace(old_boot, new_float)

    # 2. Update the boot drawing logic
    boot_draw_old = """    if (!uiState.isBooted) {
        const elapsed = bootStartRef.current ? (Date.now() - bootStartRef.current) / 1000 : 0;
        
        const w = 67;
        const h = 18;
        const x = Math.floor((COLS - w) / 2);
        const y = Math.floor((ROWS - h) / 2);
        
        const drawLine = (ly: number, str: string) => {
            buffer.writeStr(x, y + ly, `| ${str.padEnd(w - 4, ' ')} |`, 2);
        };
        
        const topEdge = '+' + '='.repeat(w - 2) + '+';
        buffer.writeStr(x, y, topEdge, 2);
        drawLine(1, ' PORTFOLIO_OS.EXE                                    v. 2.0.26');
        buffer.writeStr(x, y + 2, topEdge, 2);
        
        for (let i = 3; i < 17; i++) {
            buffer.writeStr(x, y + i, '|' + ' '.repeat(w - 2) + '|', 0);
        }
        
        if (elapsed > 0.0) drawLine(4, ' > ALLOCATING MEMORY...              [ OK ]');
        if (elapsed > 0.2) drawLine(6, ' > COMPILING WEBGL SHADERS...        [ OK ]');
        if (elapsed > 0.4) drawLine(8, ' > MOUNTING DATA VOLUMES...          [ OK ]');
        if (elapsed > 0.6) drawLine(10, ' > INITIALIZING INTERFACE...         [ OK ]');
        
        if (elapsed > 0.8) {
            drawLine(12, '   AUTHORIZATION: NAWFAL JAFFRI');
            drawLine(13, '   ROLE:          SOFTWARE ENGINEER');
            drawLine(14, '   SYS_STATE:     READY');
        }
        buffer.writeStr(x, y + 17, topEdge, 2);
        
        buffer.renderToCanvas(ctx, charW, charH, activeFont, activeTheme);
        
        if (elapsed > 0.8) {
            const promptStr = "[ PRESS ANY KEY OR CLICK TO MOUNT ]";
            const px = Math.floor((COLS - promptStr.length) / 2) * charW;
            const py = (y + 16) * charH + activeFont.yOffset;
            
            const hex2rgb = (hex: string) => {
                const v = parseInt(hex.replace('#', ''), 16);
                return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
            };
            const fgRgb = hex2rgb(activeTheme.fg);
            const pulse = Math.abs(Math.sin(Date.now() / 500));
            ctx.fillStyle = `rgb(${Math.floor(fgRgb.r * pulse)}, ${Math.floor(fgRgb.g * pulse)}, ${Math.floor(fgRgb.b * pulse)})`;
            ctx.fillText(promptStr, px, py);
        }
        
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
    content = content.replace(boot_draw_old, boot_draw_new)

    with open(path, 'w') as f:
        f.write(content)

rebuild()
print("Done")
