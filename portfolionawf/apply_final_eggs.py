import sys

def rebuild():
    path = 'app/coding/page.tsx'
    with open(path, 'r') as f:
        content = f.read()

    # 1. Add lerpHex at the top
    old_hsl = """const hslToHex = (h: number, s: number, l: number) => {
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1/6) return p + (q - p) * 6 * t;
      if(t < 1/2) return q;
      if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  const toHex = (x: number) => { const hex = Math.round(x * 255).toString(16); return hex.length === 1 ? '0' + hex : hex; };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}"""

    new_lerp = """const lerpHex = (hex1: string, hex2: string, t: number) => {
    const c1 = parseInt(hex1.replace('#', ''), 16);
    const c2 = parseInt(hex2.replace('#', ''), 16);
    const r1 = (c1 >> 16) & 255, g1 = (c1 >> 8) & 255, b1 = c1 & 255;
    const r2 = (c2 >> 16) & 255, g2 = (c2 >> 8) & 255, b2 = c2 & 255;
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    const toHex = (x: number) => { const h = x.toString(16); return h.length === 1 ? '0' + h : h; };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}"""
    if old_hsl in content:
        content = content.replace(old_hsl, new_lerp)

    # 2. Update CRTScreen signature and refs
    old_sig = "function CRTScreen({ uiState, setUiState, effects, textRef, cursorRef, setRedrawFn, gridSizeRef, hoverRef }: any) {"
    new_sig = "function CRTScreen({ uiState, setUiState, effects, textRef, cursorRef, setRedrawFn, gridSizeRef, hoverRef, snakeDirRef }: any) {"
    if old_sig in content:
        content = content.replace(old_sig, new_sig)

    old_refs = """  const afterimageRef = useRef<any>(null)
  const cursorVisible = useRef(true)
  const persistedBuffer = useRef<any>(null)
    const snakeState = useRef({ body: [{x: 10, y: 10, color: getRandomSnakeColor()}, {x: 9, y: 10, color: getRandomSnakeColor()}, {x: 8, y: 10, color: getRandomSnakeColor()}], dir: {x: 1, y: 0}, food: {x: 20, y: 15}, lastMove: 0 });"""
    new_refs = """  const afterimageRef = useRef<any>(null)
  const cursorVisible = useRef(true)
  const persistedBuffer = useRef<any>(null)
  const snowRef = useRef<any[]>([])
  const snakeState = useRef({ body: [{x: 10, y: 10, color: getRandomSnakeColor()}, {x: 9, y: 10, color: getRandomSnakeColor()}, {x: 8, y: 10, color: getRandomSnakeColor()}], dir: {x: 1, y: 0}, food: {x: 20, y: 15}, lastMove: 0 });"""
    if old_refs in content:
        content = content.replace(old_refs, new_refs)

    # 3. Apply Disco slide logic
    old_disco = """  let activeTheme = THEMES[uiState.themeIdx]
  if (uiState.isDisco) {
      const hue = (Date.now() / 4000) % 1;
      activeTheme = { 
        ...activeTheme, 
        fg: hslToHex(hue, 1, 0.65), 
        dim: hslToHex(hue, 1, 0.3)
      };
  }"""
    new_disco = """  let activeTheme = THEMES[uiState.themeIdx]
  if (uiState.isDisco) {
      const speed = 3000;
      const time = Date.now();
      const idx1 = Math.floor(time / speed) % THEMES.length;
      const idx2 = (idx1 + 1) % THEMES.length;
      const t = (time % speed) / speed;
      const t1 = THEMES[idx1];
      const t2 = THEMES[idx2];
      
      activeTheme = {
          ...t1,
          fg: lerpHex(t1.fg, t2.fg, t),
          bg: lerpHex(t1.bg, t2.bg, t),
          dim: lerpHex(t1.dim, t2.dim, t),
          bloom: t1.bloom + (t2.bloom - t1.bloom) * t,
          radius: t1.radius + (t2.radius - t1.radius) * t,
      };
  }"""
    if old_disco in content:
        content = content.replace(old_disco, new_disco)

    # 4. Update snake logic for Playable Snake
    old_snake_ai = """                // Smart AI to seek food
                const dx = s.food.x - head.x;
                const dy = s.food.y - head.y;
                
                let possibleDirs = [
                    {x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}
                ];
                
                // Filter out 180 degree turns and self-collisions
                possibleDirs = possibleDirs.filter(d => {
                    if (d.x === -s.dir.x && d.y === -s.dir.y) return false;
                    const checkX = (head.x + d.x + cols) % cols;
                    const checkY = (head.y + d.y + rows) % rows;
                    return !s.body.some((b: any, i: number) => i !== 0 && b.x === checkX && b.y === checkY);
                });
                
                if (possibleDirs.length > 0) {
                    // Sort by distance to food
                    possibleDirs.sort((a, b) => {
                        const distA = Math.abs(head.x + a.x - s.food.x) + Math.abs(head.y + a.y - s.food.y);
                        const distB = Math.abs(head.x + b.x - s.food.x) + Math.abs(head.y + b.y - s.food.y);
                        return distA - distB;
                    });
                    
                    // 90% chance to pick best path, 10% chance to pick random safe path for erratic movement
                    if (Math.random() > 0.1) {
                        s.dir = possibleDirs[0];
                    } else {
                        s.dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                    }
                }"""
    new_snake_ai = """                if (uiState.isSnakePlayable) {
                    if (snakeDirRef.current.x !== -s.dir.x || snakeDirRef.current.y !== -s.dir.y) {
                        s.dir = snakeDirRef.current;
                    }
                } else {
                    // Smart AI to seek food
                    const dx = s.food.x - head.x;
                    const dy = s.food.y - head.y;
                    
                    let possibleDirs = [
                        {x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}
                    ];
                    
                    // Filter out 180 degree turns and self-collisions
                    possibleDirs = possibleDirs.filter(d => {
                        if (d.x === -s.dir.x && d.y === -s.dir.y) return false;
                        const checkX = (head.x + d.x + cols) % cols;
                        const checkY = (head.y + d.y + rows) % rows;
                        return !s.body.some((b: any, i: number) => i !== 0 && b.x === checkX && b.y === checkY);
                    });
                    
                    if (possibleDirs.length > 0) {
                        possibleDirs.sort((a, b) => {
                            const distA = Math.abs(head.x + a.x - s.food.x) + Math.abs(head.y + a.y - s.food.y);
                            const distB = Math.abs(head.x + b.x - s.food.x) + Math.abs(head.y + b.y - s.food.y);
                            return distA - distB;
                        });
                        
                        if (Math.random() > 0.1) {
                            s.dir = possibleDirs[0];
                        } else {
                            s.dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                        }
                    }
                }"""
    if old_snake_ai in content:
        content = content.replace(old_snake_ai, new_snake_ai)

    # 5. Snow Logic in useFrame
    old_useframe = """    if (!uiState.isBooted) {"""
    new_useframe = """    if (uiState.isSnow && gridSizeRef.current.cols > 0) {
        if (Math.random() < 0.3) {
            snowRef.current.push({
                x: Math.floor(Math.random() * gridSizeRef.current.cols),
                y: 0,
                char: ['*', '.', '+', '•'][Math.floor(Math.random() * 4)],
                speed: Math.random() * 0.4 + 0.2
            });
        }
        snowRef.current.forEach(flake => { flake.y += flake.speed; });
        snowRef.current = snowRef.current.filter(flake => flake.y < gridSizeRef.current.rows);
    }
    
    if (!uiState.isBooted) {"""
    if old_useframe in content:
        content = content.replace(old_useframe, new_useframe)

    old_redraw_life = """    } else if (uiState.isZeroG || uiState.isDevMode || uiState.isLife || uiState.isDisco) {"""
    new_redraw_life = """    } else if (uiState.isZeroG || uiState.isDevMode || uiState.isDisco || uiState.isSnow) {"""
    if old_redraw_life in content:
        content = content.replace(old_redraw_life, new_redraw_life)

    # 6. Remove Life logic and update physics block
    old_physics_block = """    if ((uiState.isZeroG || uiState.isLife) && persistedBuffer.current) {
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
    new_physics_block = """    if (uiState.isZeroG && persistedBuffer.current) {
        const b = persistedBuffer.current;
        let moved = false;
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
        textureRef.current.needsUpdate = true;
        return;
    }"""
    if old_physics_block in content:
        content = content.replace(old_physics_block, new_physics_block)

    # 7. Draw Snowflakes
    old_end_draw = """    persistedBuffer.current = buffer;
    textureRef.current.needsUpdate = true
  }"""
    new_end_draw = """    if (uiState.isSnow) {
        snowRef.current.forEach(flake => {
            buffer.writeStr(Math.floor(flake.x), Math.floor(flake.y), flake.char, 0);
        });
    }

    persistedBuffer.current = buffer;
    textureRef.current.needsUpdate = true
  }"""
    if old_end_draw in content:
        content = content.replace(old_end_draw, new_end_draw)

    # 8. WebGLTerminalPage integration (snakeDirRef, isSnakePlayable, isSnow)
    old_uistate_term = """    devModeStart: 0,
    isZeroG: false,
    isDisco: false,
    isLife: false
  })"""
    new_uistate_term = """    devModeStart: 0,
    isZeroG: false,
    isDisco: false,
    isSnow: false,
    isSnakePlayable: false
  })
  
  const snakeDirRef = useRef({x: 1, y: 0})"""
    if old_uistate_term in content:
        content = content.replace(old_uistate_term, new_uistate_term)

    old_keydown = """  const handleKeyDown = (e: any) => {
    if (!uiState.isBooted) {"""
    new_keydown = """  const handleKeyDown = (e: any) => {
    if (uiState.isSnakePlayable && !uiState.isBooted) {
        if (e.key === 'ArrowUp') { snakeDirRef.current = {x: 0, y: -1}; return; }
        if (e.key === 'ArrowDown') { snakeDirRef.current = {x: 0, y: 1}; return; }
        if (e.key === 'ArrowLeft') { snakeDirRef.current = {x: -1, y: 0}; return; }
        if (e.key === 'ArrowRight') { snakeDirRef.current = {x: 1, y: 0}; return; }
    }
    if (!uiState.isBooted) {"""
    if old_keydown in content:
        content = content.replace(old_keydown, new_keydown)

    old_enter_cmd = """          } else if (cmd === 'life') {
              setUiState(s => ({ ...s, isLife: true }));
              textRef.current = '';
              playPowerOff();
          } else if (cmd === 'gravity=1') {
              setUiState(s => ({ ...s, isZeroG: false, isLife: false }));
              textRef.current = '';
              playBootUp();"""
    new_enter_cmd = """          } else if (cmd === 'play') {
              setUiState(s => ({ ...s, isSnakePlayable: !s.isSnakePlayable }));
              textRef.current = '';
              playBootUp();
          } else if (cmd === 'snow') {
              setUiState(s => ({ ...s, isSnow: !s.isSnow }));
              textRef.current = '';
              playBootUp();
          } else if (cmd === 'gravity=1') {
              setUiState(s => ({ ...s, isZeroG: false }));
              textRef.current = '';
              playBootUp();"""
    if old_enter_cmd in content:
        content = content.replace(old_enter_cmd, new_enter_cmd)

    old_crt_call = """<CRTScreen uiState={uiState} setUiState={setUiState} effects={effects} 
            textRef={textRef} cursorRef={cursorRef} setRedrawFn={setRedrawFn} 
            gridSizeRef={gridSizeRef} hoverRef={hoverRef} />"""
    new_crt_call = """<CRTScreen uiState={uiState} setUiState={setUiState} effects={effects} 
            textRef={textRef} cursorRef={cursorRef} setRedrawFn={setRedrawFn} 
            gridSizeRef={gridSizeRef} hoverRef={hoverRef} snakeDirRef={snakeDirRef} />"""
    if old_crt_call in content:
        content = content.replace(old_crt_call, new_crt_call)

    with open(path, 'w') as f:
        f.write(content)

rebuild()
print("Done")
