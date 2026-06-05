import sys

def rebuild():
    path = 'app/coding/page.tsx'
    with open(path, 'r') as f:
        content = f.read()

    # 1. Replace floatingLetters with snakeState
    old_float = """  const floatingLetters = useRef([
    { char: 'N', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 8, dy: (Math.random() - 0.5) * 8 },
    { char: 'A', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 8, dy: (Math.random() - 0.5) * 8 },
    { char: 'W', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 8, dy: (Math.random() - 0.5) * 8 },
    { char: 'F', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 8, dy: (Math.random() - 0.5) * 8 },
    { char: 'A', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 8, dy: (Math.random() - 0.5) * 8 },
    { char: 'L', x: Math.random() * 2048, y: Math.random() * 1024, dx: (Math.random() - 0.5) * 8, dy: (Math.random() - 0.5) * 8 }
  ]);"""
    new_snake = "  const snakeState = useRef({ body: [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}], dir: {x: 1, y: 0}, food: {x: 20, y: 15}, lastMove: 0 });"
    content = content.replace(old_float, new_snake)

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
        
        // 1. Brutalist wireframe screensaver letters
        ctx.font = `bold 140px ${activeFont.css}`;
        ctx.strokeStyle = `rgba(${fgRgb.r}, ${fgRgb.g}, ${fgRgb.b}, 0.3)`;
        ctx.lineWidth = 4;
        floatingLetters.current.forEach((letter: any) => {
            letter.x += letter.dx * 0.5; // slow them down a bit for eerie feel
            letter.y += letter.dy * 0.5;
            if (letter.x <= 0 || letter.x >= W) letter.dx *= -1;
            if (letter.y <= 0 || letter.y >= H) letter.dy *= -1;
            ctx.strokeText(letter.char, letter.x, letter.y);
        });
        
        // 2. Old-school minimalist title
        ctx.font = `${activeFont.size}px ${activeFont.css}`;
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

    boot_draw_new = """    if (!uiState.isBooted) {
        // Draw Snake
        const s = snakeState.current;
        s.body.forEach((segment: any) => {
            buffer.writeStr(segment.x, segment.y, '█', 2);
        });
        buffer.writeStr(s.food.x, s.food.y, '◈', 2);

        // Draw Title
        const titleStr = "NAWFAL JAFFRI";
        const titleX = Math.floor((COLS - titleStr.length) / 2);
        const titleY = Math.floor(ROWS / 2) - 1;
        buffer.writeStr(titleX, titleY, titleStr, 2);
        
        buffer.renderToCanvas(ctx, charW, charH, activeFont, activeTheme);
        
        // Draw pulsing prompt (text only, no solid background to prevent bloom bleeding)
        const promptStr = "[ PRESS ANY KEY TO POWER ON ]";
        const px = Math.floor((COLS - promptStr.length) / 2) * charW;
        const py = Math.floor(ROWS / 2 + 1) * charH + activeFont.yOffset;
        
        const hex2rgb = (hex: string) => {
            const v = parseInt(hex.replace('#', ''), 16);
            return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
        };
        const fgRgb = hex2rgb(activeTheme.fg);
        const pulse = Math.abs(Math.sin(Date.now() / 500));
        
        ctx.font = `${activeFont.size}px ${activeFont.css}`;
        ctx.fillStyle = `rgba(${fgRgb.r}, ${fgRgb.g}, ${fgRgb.b}, ${pulse})`;
        ctx.fillText(promptStr, px, py);
        
        textureRef.current.needsUpdate = true;
        return;
    }"""
    content = content.replace(boot_draw_old, boot_draw_new)

    # 3. Add back the snake useFrame logic
    use_frame_old = """  useFrame((state) => {
    if (!uiState.isBooted) {
        if (setRedrawFn.current) setRedrawFn.current();
    }"""
    use_frame_new = """  useFrame((state) => {
    if (!uiState.isBooted) {
        const now = Date.now();
        if (now - snakeState.current.lastMove > 80) {
            snakeState.current.lastMove = now;
            
            const cols = gridSizeRef.current.cols;
            const rows = gridSizeRef.current.rows;
            const s = snakeState.current;
            const head = s.body[0];
            
            let nx = head.x + s.dir.x;
            let ny = head.y + s.dir.y;
            
            if (nx < 0 || nx >= cols || ny < 0 || ny >= rows || s.body.some((b: any, i: number) => i !== 0 && b.x === nx && b.y === ny)) {
                if (s.dir.x !== 0) { 
                    s.dir.x = 0;
                    s.dir.y = head.y > rows/2 ? -1 : 1; 
                } else {
                    s.dir.y = 0;
                    s.dir.x = head.x > cols/2 ? -1 : 1;
                }
                nx = head.x + s.dir.x;
                ny = head.y + s.dir.y;
            }
            
            s.body.unshift({x: nx, y: ny});
            
            if (nx === s.food.x && ny === s.food.y) {
                s.food = {
                    x: Math.floor(Math.random() * (cols - 2)) + 1,
                    y: Math.floor(Math.random() * (rows - 2)) + 1
                };
            } else {
                s.body.pop();
            }
        }
        if (setRedrawFn.current) setRedrawFn.current();
    }"""
    content = content.replace(use_frame_old, use_frame_new)

    with open(path, 'w') as f:
        f.write(content)

rebuild()
print("Done")
