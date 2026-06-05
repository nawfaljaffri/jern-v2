import sys

def rebuild():
    path = 'app/coding/page.tsx'
    with open(path, 'r') as f:
        content = f.read()

    # 1. Replace snakeState with bootStartRef
    old_snake = "const snakeState = useRef({ body: [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}], dir: {x: 1, y: 0}, food: {x: 20, y: 15}, lastMove: 0 })"
    new_boot = "const bootStartRef = useRef<number | null>(null);"
    if old_snake in content:
        content = content.replace(old_snake, new_boot)
    else:
        print("Warning: snakeState not found")

    # 2. Initialize bootStartRef in useEffect
    use_effect_old = """useEffect(() => {
    const prev = document.body.style.overflow"""
    use_effect_new = """useEffect(() => {
    bootStartRef.current = Date.now();
    const prev = document.body.style.overflow"""
    content = content.replace(use_effect_old, use_effect_new)

    # 3. Update useFrame
    use_frame_old = """if (!uiState.isBooted) {
        const now = Date.now();
        if (now - snakeState.current.lastMove > 80) {
            snakeState.current.lastMove = now;
            
            const cols = gridSizeRef.current.cols;
            const rows = gridSizeRef.current.rows;
            const s = snakeState.current;
            const head = s.body[0];
            
            let nx = head.x + s.dir.x;
            let ny = head.y + s.dir.y;
            
            if (nx < 0 || nx >= cols || ny < 0 || ny >= rows || s.body.some((b, i) => i !== 0 && b.x === nx && b.y === ny)) {
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
            if (setRedrawFn.current) setRedrawFn.current();
        }
    }"""
    use_frame_new = """if (!uiState.isBooted) {
        // Redraw constantly during boot for the loading cascade
        if (bootStartRef.current && Date.now() - bootStartRef.current < 1500) {
            if (setRedrawFn.current) setRedrawFn.current();
        }
    }"""
    content = content.replace(use_frame_old, use_frame_new)

    # 4. Update the boot drawing logic
    boot_draw_old = """    if (!uiState.isBooted) {
        const s = snakeState.current;
        s.body.forEach((segment: any) => {
            buffer.writeStr(segment.x, segment.y, '█', 2);
        });
        buffer.writeStr(s.food.x, s.food.y, '◈', 2);

        const logoLines = [
            "███╗   ██╗ █████╗ ██╗    ██╗███████╗ █████╗ ██╗         ██╗ █████╗ ███████╗███████╗██████╗ ██╗",
            "████╗  ██║██╔══██╗██║    ██║██╔════╝██╔══██╗██║         ██║██╔══██╗██╔════╝██╔════╝██╔══██╗██║",
            "██╔██╗ ██║███████║██║ █╗ ██║█████╗  ███████║██║         ██║███████║█████╗  █████╗  ██████╔╝██║",
            "██║╚██╗██║██╔══██║██║███╗██║██╔══╝  ██╔══██║██║    ██   ██║██╔══██║██╔══╝  ██╔══╝  ██╔══██╗██║",
            "██║ ╚████║██║  ██║╚███╔███╔╝██║     ██║  ██║███████╗╚█████╔╝██║  ██║██║    ██║     ██║  ██║██║",
            "╚═╝  ╚═══╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝     ╚═╝  ╚═╝╚══════╝ ╚════╝ ╚═╝  ╚═╝╚═╝    ╚═╝     ╚═╝  ╚═╝╚═╝"
        ];
        
        const logoWidth = logoLines[0].length;
        const logoX = Math.floor((COLS - logoWidth) / 2);
        const logoY = Math.floor(ROWS / 2) - 8;
        
        logoLines.forEach((line, i) => {
            buffer.writeStr(logoX, logoY + i, line, 2);
        });
        
        buffer.renderToCanvas(ctx, charW, charH, activeFont, activeTheme);
        
        const promptStr = "[ PRESS ANY KEY TO POWER ON ]";
        const px = Math.floor((COLS - promptStr.length) / 2) * charW;
        const py = Math.floor(ROWS / 2) * charH + activeFont.yOffset;
        
        const hex2rgb = (hex: string) => {
            const v = parseInt(hex.replace('#', ''), 16);
            return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
        };
        const fgRgb = hex2rgb(activeTheme.fg);
        const pulse = Math.abs(Math.sin(Date.now() / 800));
        ctx.fillStyle = `rgb(${Math.floor(fgRgb.r * pulse)}, ${Math.floor(fgRgb.g * pulse)}, ${Math.floor(fgRgb.b * pulse)})`;
        ctx.fillText(promptStr, px, py);
        
        textureRef.current.needsUpdate = true;
        return;
    }"""

    boot_draw_new = """    if (!uiState.isBooted) {
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
        
        // requestAnimationFrame loop to ensure canvas keeps redrawing the pulse after 1.5s
        if (elapsed > 0.8) {
             if (setRedrawFn.current) setTimeout(() => setRedrawFn.current?.(), 50);
        }
        return;
    }"""
    content = content.replace(boot_draw_old, boot_draw_new)

    with open(path, 'w') as f:
        f.write(content)

rebuild()
