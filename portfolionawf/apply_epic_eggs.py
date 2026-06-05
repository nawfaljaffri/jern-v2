import sys

def rebuild():
    path = 'app/coding/page.tsx'
    with open(path, 'r') as f:
        content = f.read()

    # 1. Fix the `activeTheme` declaration to handle disco globally
    old_theme_decl = """  const activeTheme = THEMES[uiState.themeIdx]
  const activeFont = FONTS[uiState.fontIdx]"""
    new_theme_decl = """  let activeTheme = THEMES[uiState.themeIdx]
  if (uiState.isDisco) {
      const hue = (Date.now() / 4000) % 1;
      activeTheme = { 
        ...activeTheme, 
        fg: hslToHex(hue, 1, 0.65), 
        dim: hslToHex(hue, 1, 0.3)
      };
  }
  const activeFont = FONTS[uiState.fontIdx]"""
    if old_theme_decl in content:
        content = content.replace(old_theme_decl, new_theme_decl)

    # Clean up the trapped local disco logic inside isZeroG
    old_trapped_disco = """        // Render it with existing font and theme
        let activeTheme = THEMES[uiState.themeIdx]
        if (uiState.isDisco) {
            const hue = (Date.now() / 4000) % 1;
            activeTheme = { 
              ...activeTheme, 
              fg: hslToHex(hue, 1, 0.65), 
              dim: hslToHex(hue, 1, 0.3)
            };
        }
        const activeFont = FONTS[uiState.fontIdx]"""
    new_trapped_disco = """        // Render it with global font and theme"""
    if old_trapped_disco in content:
        content = content.replace(old_trapped_disco, new_trapped_disco)

    # 2. Add isLife to uiState
    old_uistate = """    isZeroG: false,
    isDisco: false,
    isHack: false
  })"""
    new_uistate = """    isZeroG: false,
    isDisco: false,
    isLife: false
  })"""
    if old_uistate in content:
        content = content.replace(old_uistate, new_uistate)

    # 3. Add `life` to Enter command parser and remove `hack`
    old_hack_cmd = """          } else if (cmd === 'hack') {
              setUiState(s => ({ ...s, isHack: !s.isHack }));
              textRef.current = '';
              playBootUp();"""
    new_hack_cmd = """          } else if (cmd === 'life') {
              setUiState(s => ({ ...s, isLife: true }));
              textRef.current = '';
              playPowerOff();"""
    if old_hack_cmd in content:
        content = content.replace(old_hack_cmd, new_hack_cmd)

    # 4. Remove `hack` drawing logic and clean up devmode
    old_hack_draw = """    if (uiState.isHack) {
        let cy = 10;
        let cx = leftW + 2;
        const maxW = COLS - leftW - 4;
        for (let i = 0; i < 7; i++) {
            let row = '';
            for (let j = 0; j < maxW; j++) row += String.fromCharCode(33 + Math.floor(Math.random() * 93));
            writeUI(cx, cy + i, row, 1);
        }
        writeUI(cx, cy + 8, 'DECRYPTING MAINFRAME...', 0);
        const progress = Math.floor((Date.now() % 2000) / 100);
        writeUI(cx, cy + 10, '[' + '█'.repeat(progress) + ' '.repeat(20 - progress) + ']', 0);
    } else if (uiState.isDevMode) {"""
    new_hack_draw = """    if (uiState.isDevMode) {"""
    if old_hack_draw in content:
        content = content.replace(old_hack_draw, new_hack_draw)

    # 5. Handle `isLife` in drawCanvas alongside `isZeroG`
    old_zerog_block = """    if (uiState.isZeroG && persistedBuffer.current) {
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
        
        // Render it with global font and theme
        
        b.renderToCanvas(ctx, charW, charH, activeFont, activeTheme);
        textureRef.current.needsUpdate = true;
        return;
    }"""
    
    new_physics_block = """    if ((uiState.isZeroG || uiState.isLife) && persistedBuffer.current) {
        const b = persistedBuffer.current;
        
        if (uiState.isZeroG) {
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
            b.renderToCanvas(ctx, charW, charH, activeFont, activeTheme);
        } else if (uiState.isLife) {
            // Conway's Game of Life collapse
            // We need to rate limit it slightly so it's visible
            if (Date.now() - (b.lastLifeUpdate || 0) > 100) {
                const nextBuffer = new TextBuffer(b.cols, b.rows);
                for (let y = 0; y < b.rows; y++) {
                    for (let x = 0; x < b.cols; x++) {
                        let neighbors = 0;
                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                if (dx === 0 && dy === 0) continue;
                                const nx = x + dx, ny = y + dy;
                                if (nx >= 0 && nx < b.cols && ny >= 0 && ny < b.rows) {
                                    if (b.buffer[ny][nx] !== ' ') neighbors++;
                                }
                            }
                        }
                        const isAlive = b.buffer[y][x] !== ' ';
                        if (isAlive && (neighbors === 2 || neighbors === 3)) {
                            nextBuffer.buffer[y][x] = b.buffer[y][x];
                            nextBuffer.colorBuffer[y][x] = b.colorBuffer[y][x];
                        } else if (!isAlive && neighbors === 3) {
                            nextBuffer.buffer[y][x] = '█';
                            nextBuffer.colorBuffer[y][x] = 0;
                        }
                    }
                }
                nextBuffer.lastLifeUpdate = Date.now();
                persistedBuffer.current = nextBuffer;
                nextBuffer.renderToCanvas(ctx, charW, charH, activeFont, activeTheme);
            } else {
                b.renderToCanvas(ctx, charW, charH, activeFont, activeTheme);
            }
        }
        
        textureRef.current.needsUpdate = true;
        return;
    }"""
    if old_zerog_block in content:
        content = content.replace(old_zerog_block, new_physics_block)

    # 6. Make sure `isLife` triggers redrawing in useFrame
    old_redraw = """    } else if (uiState.isZeroG || uiState.isDevMode || uiState.isHack || uiState.isDisco) {"""
    new_redraw = """    } else if (uiState.isZeroG || uiState.isDevMode || uiState.isLife || uiState.isDisco) {"""
    if old_redraw in content:
        content = content.replace(old_redraw, new_redraw)

    # 7. Provide a way to turn off life
    old_grav1 = """          } else if (cmd === 'gravity=1') {
              setUiState(s => ({ ...s, isZeroG: false }));
              textRef.current = '';
              playBootUp();"""
    new_grav1 = """          } else if (cmd === 'gravity=1') {
              setUiState(s => ({ ...s, isZeroG: false, isLife: false }));
              textRef.current = '';
              playBootUp();"""
    if old_grav1 in content:
        content = content.replace(old_grav1, new_grav1)

    with open(path, 'w') as f:
        f.write(content)

rebuild()
print("Done")
