import sys

def rebuild():
    path = 'app/coding/page.tsx'
    with open(path, 'r') as f:
        content = f.read()

    # 1. Update uiState
    old_uistate = """  const [uiState, setUiState] = useState({
    themeIdx: 0,
    fontIdx: 0,
    isBooted: false,
    settingsOpen: false,
    selectedIndex: 0,
  })"""
    new_uistate = """  const [uiState, setUiState] = useState({
    themeIdx: 0,
    fontIdx: 0,
    isBooted: false,
    settingsOpen: false,
    selectedIndex: 0,
    isDevMode: false,
    devModeStart: 0,
    isZeroG: false,
    isMechanical: false
  })"""
    if old_uistate in content:
        content = content.replace(old_uistate, new_uistate)

    # 2. Update handleKeyDown
    old_enter = """      if (e.key === 'Enter') {
        playEnter();
        setTerminalInput('');
        return;
      }"""
    new_enter = """      if (e.key === 'Enter') {
        const cmd = terminalInput.trim().toLowerCase();
        if (cmd === 'devmode' || cmd === 'story') {
            setUiState(s => ({ ...s, isDevMode: true, devModeStart: Date.now() }));
            setTerminalInput('');
            playBootUp();
        } else if (cmd === 'gravity=0') {
            setUiState(s => ({ ...s, isZeroG: true }));
            setTerminalInput('');
            playPowerOff();
        } else if (cmd === 'gravity=1') {
            setUiState(s => ({ ...s, isZeroG: false }));
            setTerminalInput('');
            playBootUp();
        } else if (cmd === 'mechanical') {
            setUiState(s => ({ ...s, isMechanical: !s.isMechanical }));
            setTerminalInput('');
            playClack();
        } else {
            playEnter();
            setTerminalInput('');
        }
        return;
      }"""
    if old_enter in content:
        content = content.replace(old_enter, new_enter)

    # 3. Update typing sound for mechanical
    old_backspace = """      if (e.key === 'Backspace') {
        playTick();
        setTerminalInput(prev => prev.slice(0, -1));
      } else if (e.key.length === 1) {
        playTick();
        setTerminalInput(prev => prev + e.key);
      }"""
    new_backspace = """      if (e.key === 'Backspace') {
        if (uiState.isMechanical) { playClack(); playTick(); } else playTick();
        setTerminalInput(prev => prev.slice(0, -1));
      } else if (e.key.length === 1) {
        if (uiState.isMechanical) { playClack(); playTick(); } else playTick();
        setTerminalInput(prev => prev + e.key);
      }"""
    if old_backspace in content:
        content = content.replace(old_backspace, new_backspace)

    # 4. CRTScreen refs and zero-G interception
    old_crt_refs = """  const bloomRef = useRef<any>(null)
  const afterimageRef = useRef<any>(null)
  const cursorVisible = useRef(true)"""
    new_crt_refs = """  const bloomRef = useRef<any>(null)
  const afterimageRef = useRef<any>(null)
  const cursorVisible = useRef(true)
  const persistedBuffer = useRef<any>(null)"""
    if old_crt_refs in content:
        content = content.replace(old_crt_refs, new_crt_refs)

    # Intercept zero-G in drawCanvas
    old_draw_start = """  const drawCanvas = () => {
    if (!canvasRef.current || !textureRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return"""
    new_draw_start = """  const drawCanvas = () => {
    if (!canvasRef.current || !textureRef.current) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    if (uiState.isZeroG && persistedBuffer.current) {
        const b = persistedBuffer.current;
        let moved = false;
        // Gravity loop from bottom to top
        for (let y = b.rows - 2; y >= 0; y--) {
            for (let x = 0; x < b.cols; x++) {
                if (b.buffer[y][x] !== ' ' && b.buffer[y+1][x] === ' ') {
                    b.buffer[y+1][x] = b.buffer[y][x];
                    b.colorBuffer[y+1][x] = b.colorBuffer[y][x];
                    b.buffer[y][x] = ' ';
                    b.colorBuffer[y][x] = 0;
                    moved = true;
                }
            }
        }
        
        // Render it with existing font and theme
        const activeTheme = THEMES[uiState.themeIdx]
        const activeFont = FONTS[uiState.fontIdx]
        const W = canvasRef.current.width
        const H = canvasRef.current.height
        const charW = ctx.measureText('M').width
        const charH = 32
        
        b.renderToCanvas(ctx, charW, charH, activeFont, activeTheme);
        textureRef.current.needsUpdate = true;
        return;
    }"""
    if old_draw_start in content:
        content = content.replace(old_draw_start, new_draw_start)

    # 5. Project details devmode override
    old_proj_details = """    const activeProj = PROJECTS[uiState.selectedIndex]
    
    writeUI(leftW + 2, 10, `PROJECT: ${activeProj.name.toUpperCase()}`, 0)
    writeUI(leftW + 2, 11, '─'.repeat(COLS - leftW - 4), 1)

    writeUI(leftW + 2, 13, `Status:  ${activeProj.status}`, 0)
    writeUI(leftW + 2, 14, `Stack:   ${activeProj.lang}`, 0)
    writeUI(leftW + 2, 15, `Date:    ${activeProj.date}`, 0)
    
    writeUI(leftW + 2, 17, '─'.repeat(COLS - leftW - 4), 1)

    const descLines = activeProj.desc.split('\\n')
    descLines.forEach((line: string, i: number) => {
        writeUI(leftW + 2, 19 + i, line, 1)
    })"""
    
    new_proj_details = """    if (uiState.isDevMode) {
        const msg = "AUTHORIZATION OVERRIDE. // Hey. If you are reading this, you found the dev mode. I could have built a standard scrolling website, but I wanted to write my own WebGL CRT shader and Canvas 2D engine from scratch to show what I can do. The screen curvature is math, the audio is synthesized voltage, and I built it all. Let's talk. - Nawfal";
        const charsToShow = Math.floor((Date.now() - uiState.devModeStart) / 50);
        const currentMsg = msg.substring(0, charsToShow);
        
        let cy = 10;
        let cx = leftW + 2;
        const maxW = COLS - leftW - 4;
        
        const words = currentMsg.split(' ');
        let line = '';
        for (let i = 0; i < words.length; i++) {
            if (line.length + words[i].length + 1 > maxW) {
                writeUI(cx, cy, line, 0);
                cy++;
                line = words[i] + ' ';
            } else {
                line += words[i] + ' ';
            }
        }
        writeUI(cx, cy, line, 0);
    } else {
        const activeProj = PROJECTS[uiState.selectedIndex];
        writeUI(leftW + 2, 10, `PROJECT: ${activeProj.name.toUpperCase()}`, 0);
        writeUI(leftW + 2, 11, '─'.repeat(COLS - leftW - 4), 1);
        writeUI(leftW + 2, 13, `Status:  ${activeProj.status}`, 0);
        writeUI(leftW + 2, 14, `Stack:   ${activeProj.lang}`, 0);
        writeUI(leftW + 2, 15, `Date:    ${activeProj.date}`, 0);
        writeUI(leftW + 2, 17, '─'.repeat(COLS - leftW - 4), 1);
        const descLines = activeProj.desc.split('\\n');
        descLines.forEach((line: string, i: number) => {
            writeUI(leftW + 2, 19 + i, line, 1);
        });
    }"""
    if old_proj_details in content:
        content = content.replace(old_proj_details, new_proj_details)

    # 6. Save persistedBuffer and frame loop modifications
    old_end_draw = """    textureRef.current.needsUpdate = true
  }"""
    new_end_draw = """    persistedBuffer.current = buffer;
    textureRef.current.needsUpdate = true
  }"""
    if old_end_draw in content:
        content = content.replace(old_end_draw, new_end_draw)

    old_useframe = """        if (setRedrawFn.current) setRedrawFn.current();
    }
    if (shaderPassRef.current) {"""
    new_useframe = """        if (setRedrawFn.current) setRedrawFn.current();
    } else if (uiState.isZeroG || uiState.isDevMode) {
        if (setRedrawFn.current) setRedrawFn.current();
    }
    
    if (shaderPassRef.current) {"""
    if old_useframe in content:
        content = content.replace(old_useframe, new_useframe)

    with open(path, 'w') as f:
        f.write(content)

rebuild()
print("Done")
