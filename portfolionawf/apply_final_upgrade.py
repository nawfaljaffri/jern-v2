def rebuild():
    path = 'app/coding/page.tsx'
    with open(path, 'r') as f:
        lines = f.readlines()
    
    content = "".join(lines)
    
    # 1. Imports
    content = content.replace(
        "const fontShareTech = Share_Tech_Mono({ weight: '400', subsets: ['latin'] })",
        "const fontShareTech = Share_Tech_Mono({ weight: '400', subsets: ['latin'] })\nimport { initAudio, toggleMute, isMuted, playClack, playTick, playEnter, playBootUp, playPowerOff, playModalOpen, playModalClose, startHum } from '../../utils/audioEngine'"
    )
    
    # 2. Add snakeState
    content = content.replace(
        "const cursorVisible = useRef(true)",
        "const cursorVisible = useRef(true)\n  const snakeState = useRef({ body: [{x: 10, y: 10}, {x: 10, y: 11}, {x: 10, y: 12}], dir: {x: 1, y: 0}, food: {x: 20, y: 15}, lastMove: 0 })"
    )

    # 3. Add uiState properties
    content = content.replace(
        "aspectRatio: '4:3',\n    settingsCursorIdx: 0\n  })",
        "aspectRatio: '4:3',\n    settingsCursorIdx: 0,\n    isBooted: false,\n    soundOn: true\n  })"
    )

    # 4. drawCanvas Setup
    content = content.replace(
        """    const buffer = new TextBuffer(COLS, ROWS);
    const writeStr = buffer.writeStr.bind(buffer);
    const drawBox = buffer.drawBox.bind(buffer);

    drawBox(0, 0, COLS, 8, 'cpu & mem')""",
        """    const buffer = new TextBuffer(COLS, ROWS);
    const offsetY = Math.max(0, Math.floor((ROWS - 30) / 2));
    const writeUI = (x: number, y: number, str: string, col: number) => buffer.writeStr(x, y + offsetY, str, col);
    const drawBoxUI = (x: number, y: number, w: number, h: number, title?: string) => buffer.drawBox(x, y + offsetY, w, h, title);

    if (!uiState.isBooted) {
        const s = snakeState.current;
        s.body.forEach(segment => {
            buffer.writeStr(segment.x, segment.y, '█', 2);
        });
        buffer.writeStr(s.food.x, s.food.y, '◈', 2);
        
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

    drawBoxUI(0, 0, COLS, 8, 'cpu & mem')"""
    )
    
    # 5. UI offsets in drawCanvas
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
        
    # 6. Top Bar soundText logic
    content = content.replace(
        "const topBarRight = '[ SETTINGS ]  [ ← BACK ]'\n    const startX = COLS - topBarRight.length - 2",
        "const soundText = uiState.soundOn ? '[ SOUND: ON ]' : '[ SOUND: MUTED ]'\n    const topBarRight = `[ SETTINGS ]  ${soundText}  [ ← BACK ]`\n    const startX = COLS - topBarRight.length - 2"
    )
    content = content.replace(
        "const isHoverBack = hy === 1 && hx >= startX + 14 && hx <= startX + 23",
        "const isHoverSound = hy === 1 && hx >= startX + 14 && hx < startX + 14 + soundText.length\n    const isHoverBack = hy === 1 && hx >= startX + 14 + soundText.length + 2 && hx < startX + 14 + soundText.length + 2 + 10"
    )
    content = content.replace(
        "writeUI(startX + 14, 1, '[ ← BACK ]', isHoverBack ? 2 : 0)",
        "writeUI(startX + 14, 1, soundText, isHoverSound ? 2 : 0)\n    writeUI(startX + 14 + soundText.length + 2, 1, '[ ← BACK ]', isHoverBack ? 2 : 0)"
    )

    # 7. useFrame Hook updates
    useframe_insert = """
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
    content = content.replace(
        "if (shaderPassRef.current) {\n      shaderPassRef.current.uniforms.uTime.value = state.clock.elapsedTime\n    }",
        useframe_insert.strip() + "\n    if (shaderPassRef.current) {\n      shaderPassRef.current.uniforms.uTime.value = state.clock.elapsedTime\n    }"
    )

    # 8. Keyboard Input
    kd_start = "const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {"
    kd_audio = """
    if (!uiState.isBooted) {
        initAudio();
        playBootUp();
        startHum();
        setUiState(s => ({ ...s, isBooted: true }));
        return;
    }
    if (uiState.isBooted) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            playTick();
        } else if (e.key === 'Enter') {
            playEnter();
        } else if (e.key === 'Escape') {
            playModalClose();
        } else if (e.key.length === 1 || e.key === 'Backspace') {
            playClack();
        }
    }
    """
    content = content.replace(kd_start, kd_start + "\n" + kd_audio.strip() + "\n")
    content = content.replace(
        "} else if (uiState.settingsCursorIdx === 18) {\n              setUiState(s => ({ ...s, settingsOpen: false }))\n          }",
        "} else if (uiState.settingsCursorIdx === 18) {\n              playModalClose();\n              setUiState(s => ({ ...s, settingsOpen: false }))\n          }"
    )

    # 9. Pointer Interaction
    content = content.replace(
        "const gridY = Math.floor(((-ny * mult + 1) / 2) * ROWS)",
        "const offsetY = Math.max(0, Math.floor((ROWS - 30) / 2));\n    const gridY = Math.floor(((-ny * mult + 1) / 2) * ROWS) - offsetY;"
    )

    pi_boot = """
    if (!uiState.isBooted) {
        if (isClick) {
            initAudio();
            playBootUp();
            startHum();
            setUiState(s => ({ ...s, isBooted: true }));
        }
        return;
    }
"""
    # Specifically replace the start of handlePointerInteraction's logic
    content = content.replace(
        "if (setRedrawFn.current) setRedrawFn.current()\n    }\n\n    if (uiState.settingsOpen) {",
        "if (setRedrawFn.current) setRedrawFn.current()\n    }\n\n" + pi_boot.strip() + "\n\n    if (uiState.settingsOpen) {"
    )

    # 10. Pointer Haptics
    content = content.replace("setUiState(s => ({ ...s, themeIdx: i })); return;", "playTick();\n                      setUiState(s => ({ ...s, themeIdx: i })); return;")
    content = content.replace("setUiState(s => ({ ...s, fontIdx: i })); return;", "playTick();\n                      setUiState(s => ({ ...s, fontIdx: i })); return;")
    content = content.replace("activeSliderRef.current = sliderIdx;\n                 let fraction", "activeSliderRef.current = sliderIdx;\n                 playClack();\n                 let fraction")
    content = content.replace("setUiState(s => ({ ...s, settingsOpen: false })); return;", "playModalClose();\n                 setUiState(s => ({ ...s, settingsOpen: false })); return;")
    content = content.replace("setUiState(s => ({ ...s, aspectRatio: ratios[gridY - (boxY + 12)] }));", "playTick();\n                  setUiState(s => ({ ...s, aspectRatio: ratios[gridY - (boxY + 12)] }));")
    
    sound_click_old = """
    const startX = COLS - ('[ SETTINGS ]  [ ← BACK ]'.length) - 2
    if (gridY === 1 && isClick) {
       if (gridX >= startX + 14 && gridX <= startX + 23) {
           window.location.href = '/'
           return
       }
       if (gridX >= startX && gridX <= startX + 11) {
           setUiState(s => ({ ...s, settingsOpen: true }))
           return
       }
    }
"""
    sound_click_new = """
    const soundText = uiState.soundOn ? '[ SOUND: ON ]' : '[ SOUND: MUTED ]'
    const topBarRightStr = `[ SETTINGS ]  ${soundText}  [ ← BACK ]`
    const startX = COLS - topBarRightStr.length - 2
    if (gridY === 1 && isClick) {
       if (gridX >= startX + 14 + soundText.length + 2 && gridX < startX + 14 + soundText.length + 2 + 10) {
           window.location.href = '/'
           return
       }
       if (gridX >= startX + 14 && gridX < startX + 14 + soundText.length) {
           playTick();
           initAudio();
           startHum();
           toggleMute();
           setUiState(s => ({ ...s, soundOn: !isMuted }));
           return;
       }
       if (gridX >= startX && gridX <= startX + 11) {
           playModalOpen();
           setUiState(s => ({ ...s, settingsOpen: true }))
           return
       }
    }
"""
    content = content.replace(sound_click_old.strip(), sound_click_new.strip())
    content = content.replace("setUiState(s => ({ ...s, selectedIndex: gridY - 10 }))\n        if", "playTick();\n        setUiState(s => ({ ...s, selectedIndex: gridY - 10 }))\n        if")

    with open(path, 'w') as f:
        f.write(content)

rebuild()
print("Rebuild complete.")
