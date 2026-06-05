import re

def update_page():
    path = 'app/coding/page.tsx'
    with open(path, 'r') as f:
        content = f.read()

    # 1. Add snakeState useRef
    content = content.replace(
        "const logoState = useRef({ x: 10, y: 5, dx: 1, dy: 1 })",
        "const snakeState = useRef({ body: [{x: 10, y: 10}, {x: 10, y: 11}, {x: 10, y: 12}], dir: {x: 1, y: 0}, food: {x: 20, y: 15}, lastMove: 0 })"
    )

    # 2. Update useFrame for snake
    old_useframe_boot = r"""
    if (!uiState.isBooted) {
        const speed = 0.25;
        logoState.current.x += logoState.current.dx * speed;
        logoState.current.y += logoState.current.dy * (speed * 0.5);
        
        const cols = gridSizeRef.current.cols;
        const rows = gridSizeRef.current.rows;
        
        if (logoState.current.x <= 0) {
            logoState.current.x = 0;
            logoState.current.dx *= -1;
        } else if (logoState.current.x + 36 >= cols) {
            logoState.current.x = cols - 36;
            logoState.current.dx *= -1;
        }
        
        if (logoState.current.y <= 0) {
            logoState.current.y = 0;
            logoState.current.dy *= -1;
        } else if (logoState.current.y + 4 >= rows - 5) {
            logoState.current.y = rows - 9;
            logoState.current.dy *= -1;
        }

        if (setRedrawFn.current) setRedrawFn.current();
    }
"""
    new_useframe_boot = r"""
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
    }
"""
    if old_useframe_boot.strip() in content:
        content = content.replace(old_useframe_boot.strip(), new_useframe_boot.strip())

    # 3. Update drawCanvas boot screen logic
    old_draw_boot = r"""
    if (!uiState.isBooted) {
        const logo = [
          " _  _   __   _  _  ____  __    __   ",
          "( \( ) / _\ / )( \(  __)/ _\  (  )  ",
          " )  ( /    \\ /\ / ) _)/    \ / (_/\ ",
          "(_)\_)\_/\_/(_/\_)(__) \_/\_/ \____/"
        ];
        // Fix the backslashes manually
        logo[1] = "( \\( ) / _\\ / )( \\(  __)/ _\\  (  )  ";
        logo[2] = " )  ( /    \\\\ /\\ / ) _)/    \\ / (_/\\";
        logo[3] = "(_)\\_)\\_/\\_/(_/\\_)(__) \\_/\\_/ \\____/";

        const startX = Math.floor(logoState.current.x);
        const startY = Math.floor(logoState.current.y);
        
        logo.forEach((line, i) => {
            writeStr(startX, startY + i, line, 0);
        });
        
        buffer.renderToCanvas(ctx, charW, charH, activeFont, activeTheme);
        
        const promptStr = "[ PRESS ANY KEY TO POWER ON ]";
        const px = Math.floor((COLS - promptStr.length) / 2) * charW;
        const py = Math.floor(ROWS - 5) * charH + activeFont.yOffset;
        
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
    }
"""
    new_draw_boot = r"""
    if (!uiState.isBooted) {
        const s = snakeState.current;
        s.body.forEach(segment => {
            writeStr(segment.x, segment.y, '█', 2);
        });
        writeStr(s.food.x, s.food.y, '◈', 2);
        
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
    }
"""
    if "const logo =" in content:
        # We need a robust regex to replace the entire !uiState.isBooted block up to return; }
        content = re.sub(r'if \(!uiState\.isBooted\) \{.*?return;\n    \}', new_draw_boot.strip(), content, flags=re.DOTALL)

    # 4. Inject global Y offset
    layout_injection = r"""
    const offsetY = Math.max(0, Math.floor((ROWS - 30) / 2));
    const writeUI = (x: number, y: number, str: string, col: number) => writeStr(x, y + offsetY, str, col);
    const drawBoxUI = (x: number, y: number, w: number, h: number, title?: string) => drawBox(x, y + offsetY, w, h, title);

    drawBoxUI(0, 0, COLS, 8, 'cpu & mem')
"""
    content = content.replace("drawBox(0, 0, COLS, 8, 'cpu & mem')", layout_injection.strip())
    
    # Update drawCanvas replacing writeStr with writeUI and drawBox with drawBoxUI (for layout elements)
    replacements = [
        ("writeStr(COLS / 2 - 4, 0, ", "writeUI(COLS / 2 - 4, 0, "),
        ("writeStr(2, 2, ", "writeUI(2, 2, "),
        ("writeStr(36, 2, ", "writeUI(36, 2, "),
        ("writeStr(2, 3, ", "writeUI(2, 3, "),
        ("writeStr(36, 3, ", "writeUI(36, 3, "),
        ("writeStr(2, 4, ", "writeUI(2, 4, "),
        ("writeStr(36, 4, ", "writeUI(36, 4, "),
        ("writeStr(2, 6, ", "writeUI(2, 6, "),
        ("writeStr(startX, 1, ", "writeUI(startX, 1, "),
        ("writeStr(startX + 14, 1, ", "writeUI(startX + 14, 1, "),
        ("writeStr(startX + 14 + soundText.length + 2, 1, ", "writeUI(startX + 14 + soundText.length + 2, 1, "),
        ("drawBox(0, 8, leftW, ROWS - 12, 'PROJECTS')", "drawBoxUI(0, 8, leftW, 18, 'PROJECTS')"),
        ("writeStr(1, y, str, ", "writeUI(1, y, str, "),
        ("drawBox(leftW, 8, COLS - leftW, ROWS - 12, 'PROJECT DETAILS')", "drawBoxUI(leftW, 8, COLS - leftW, 18, 'PROJECT DETAILS')"),
        ("writeStr(leftW + 2, 10, ", "writeUI(leftW + 2, 10, "),
        ("writeStr(leftW + 2, 11, ", "writeUI(leftW + 2, 11, "),
        ("writeStr(leftW + 2, 13, ", "writeUI(leftW + 2, 13, "),
        ("writeStr(leftW + 2, 14, ", "writeUI(leftW + 2, 14, "),
        ("writeStr(leftW + 2, 15, ", "writeUI(leftW + 2, 15, "),
        ("writeStr(leftW + 2, 17, ", "writeUI(leftW + 2, 17, "),
        ("writeStr(leftW + 2, 19 + i, ", "writeUI(leftW + 2, 19 + i, "),
        ("drawBox(0, ROWS - 4, COLS, 4, 'TERMINAL')", "drawBoxUI(0, 26, COLS, 4, 'TERMINAL')"),
        ("writeStr(2, ROWS - 2, prefix + typedText, 0)", "writeUI(2, 28, prefix + typedText, 0)"),
        ("writeStr(2 + prefix.length + cursorRef.current, ROWS - 2, '█', 0)", "writeUI(2 + prefix.length + cursorRef.current, 28, '█', 0)"),
        
        # Settings Modal
        ("const boxY = Math.floor((ROWS - h) / 2);", "const boxY = Math.floor((30 - h) / 2);"),
        ("writeStr(boxX, boxY+i, ", "writeUI(boxX, boxY+i, "),
        ("drawBox(boxX, boxY, w, h, 'SETTINGS');", "drawBoxUI(boxX, boxY, w, h, 'SETTINGS');"),
        ("writeStr(boxX + 4, boxY + 2, ", "writeUI(boxX + 4, boxY + 2, "),
        ("writeStr(boxX + 6, boxY + 3 + i, ", "writeUI(boxX + 6, boxY + 3 + i, "),
        ("writeStr(boxX + 4, boxY + 11, ", "writeUI(boxX + 4, boxY + 11, "),
        ("writeStr(boxX + 6, boxY + 12 + i, ", "writeUI(boxX + 6, boxY + 12 + i, "),
        ("writeStr(col2HdrX, boxY + 2, ", "writeUI(col2HdrX, boxY + 2, "),
        ("writeStr(col2ItmX, boxY + 3 + i, ", "writeUI(col2ItmX, boxY + 3 + i, "),
        ("writeStr(col2HdrX, boxY + 11, ", "writeUI(col2HdrX, boxY + 11, "),
        ("writeStr(col2ItmX, boxY + 12 + i, ", "writeUI(col2ItmX, boxY + 12 + i, "),
        ("writeStr(boxX + 25, boxY + h - 3, ", "writeUI(boxX + 25, boxY + h - 3, ")
    ]
    for old, new in replacements:
        content = content.replace(old, new)

    # 5. Handle Pointer Interaction
    gridY_calc_old = "const gridY = Math.floor(y / charH)"
    gridY_calc_new = "const offsetY = Math.max(0, Math.floor((gridSizeRef.current.rows - 30) / 2));\n    const gridY = Math.floor(y / charH) - offsetY;"
    content = content.replace(gridY_calc_old, gridY_calc_new)

    # Add haptic feedback
    # Settings toggle close
    content = content.replace("setUiState(s => ({ ...s, settingsOpen: false })); return;", "playTick();\n                 setUiState(s => ({ ...s, settingsOpen: false })); return;")
    # Theme click
    content = content.replace("setUiState(s => ({ ...s, themeIdx: i }));", "playTick();\n                 setUiState(s => ({ ...s, themeIdx: i }));")
    # Font click
    content = content.replace("setUiState(s => ({ ...s, fontIdx: i }));", "playTick();\n                 setUiState(s => ({ ...s, fontIdx: i }));")
    # Aspect Ratio click
    content = content.replace("setUiState(s => ({ ...s, aspectRatio: r === 'FIT SCREEN' ? 'FLUID' : r }));", "playTick();\n                 setUiState(s => ({ ...s, aspectRatio: r === 'FIT SCREEN' ? 'FLUID' : r }));")
    # Slider click
    content = content.replace("activeSliderRef.current = gridY - (boxY + 3);", "activeSliderRef.current = gridY - (boxY + 3);\n                 playClack();")
    # Sound toggle
    content = content.replace("setUiState(s => ({ ...s, soundOn: !isMuted }));", "playTick();\n           setUiState(s => ({ ...s, soundOn: !isMuted }));")
    # Project click
    content = content.replace("setUiState(s => ({ ...s, selectedIndex: gridY - 10 }))", "playTick();\n         setUiState(s => ({ ...s, selectedIndex: gridY - 10 }))")

    with open(path, 'w') as f:
        f.write(content)

update_page()
print("Applied UI upgrade successfully.")
