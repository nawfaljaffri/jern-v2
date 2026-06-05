import sys

def rebuild():
    path = 'app/coding/page.tsx'
    with open(path, 'r') as f:
        content = f.read()

    # 1. Revert Snake Head
    old_snake = "buffer.writeStr(segment.x, segment.y, '█', index === 0 ? '#ffffff' : (segment.color || getRandomSnakeColor()));"
    new_snake = "buffer.writeStr(segment.x, segment.y, '█', segment.color || getRandomSnakeColor());"
    content = content.replace(old_snake, new_snake)

    # 2. Add hslToHex before THEMES
    if "const hslToHex" not in content:
        old_themes = "const THEMES ="
        new_themes = """const hslToHex = (h: number, s: number, l: number) => {
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
}

const THEMES ="""
        content = content.replace(old_themes, new_themes)

    # 3. Remove disco tick logic
    old_useframe = """  useFrame((state) => {
    if (uiState.isDisco) {
        if (Math.random() < 0.05) {
            setUiState((s: any) => ({ ...s, themeIdx: Math.floor(Math.random() * 6) }));
        }
    }
    if (!uiState.isBooted) {"""
    new_useframe = """  useFrame((state) => {
    if (!uiState.isBooted) {"""
    content = content.replace(old_useframe, new_useframe)

    # Update useframe redraw hook
    old_redraw_hook = """    } else if (uiState.isZeroG || uiState.isDevMode) {
        if (setRedrawFn.current) setRedrawFn.current();
    }"""
    new_redraw_hook = """    } else if (uiState.isZeroG || uiState.isDevMode || uiState.isHack || uiState.isDisco) {
        if (setRedrawFn.current) setRedrawFn.current();
    }"""
    content = content.replace(old_redraw_hook, new_redraw_hook)

    # 4. Handle hack in uiState
    old_uistate = """    devModeStart: 0,
    isZeroG: false,
    isDisco: false
  })"""
    new_uistate = """    devModeStart: 0,
    isZeroG: false,
    isDisco: false,
    isHack: false
  })"""
    content = content.replace(old_uistate, new_uistate)

    # 5. Handle hack in Enter
    old_disco_cmd = """          } else if (cmd === 'disco') {
              setUiState(s => ({ ...s, isDisco: !s.isDisco }));
              textRef.current = '';
              playBootUp();"""
    new_disco_cmd = """          } else if (cmd === 'disco') {
              setUiState(s => ({ ...s, isDisco: !s.isDisco }));
              textRef.current = '';
              playBootUp();
          } else if (cmd === 'hack') {
              setUiState(s => ({ ...s, isHack: !s.isHack }));
              textRef.current = '';
              playBootUp();"""
    content = content.replace(old_disco_cmd, new_disco_cmd)

    # 6. Apply DevMode newline and Hack mode
    old_devmode = """    if (uiState.isDevMode) {
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
    } else {"""
    
    new_devmode = """    if (uiState.isHack) {
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
    } else if (uiState.isDevMode) {
        const msg = "AUTHORIZATION OVERRIDE. // Hey. If you are reading this, you found the dev mode. I could have built a standard scrolling website, but I wanted to write my own WebGL CRT shader and Canvas 2D engine from scratch to show what I can do. The screen curvature is math, the audio is synthesized voltage, and I built it all. Let's talk. \\n - Nawfal";
        const charsToShow = Math.floor((Date.now() - uiState.devModeStart) / 50);
        const currentMsg = msg.substring(0, charsToShow);
        
        let cy = 10;
        let cx = leftW + 2;
        const maxW = COLS - leftW - 4;
        
        const words = currentMsg.split(' ');
        let line = '';
        for (let i = 0; i < words.length; i++) {
            if (words[i] === '\\n') {
                writeUI(cx, cy, line, 0);
                cy += 2;
                line = '';
            } else if (line.length + words[i].length + 1 > maxW) {
                writeUI(cx, cy, line, 0);
                cy++;
                line = words[i] + ' ';
            } else {
                line += words[i] + ' ';
            }
        }
        writeUI(cx, cy, line, 0);
    } else {"""
    content = content.replace(old_devmode, new_devmode)

    # 7. Apply dynamic theme for disco
    old_active_theme = "const activeTheme = THEMES[uiState.themeIdx]"
    new_active_theme = """let activeTheme = THEMES[uiState.themeIdx]
        if (uiState.isDisco) {
            const hue = (Date.now() / 4000) % 1;
            activeTheme = { 
              ...activeTheme, 
              fg: hslToHex(hue, 1, 0.65), 
              dim: hslToHex(hue, 1, 0.3)
            };
        }"""
    
    # We only want to replace it in the rendering block, wait, let's find the exact string in drawCanvas
    old_theme_render = """        const activeTheme = THEMES[uiState.themeIdx]
        const activeFont = FONTS[uiState.fontIdx]"""
    new_theme_render = """        let activeTheme = THEMES[uiState.themeIdx]
        if (uiState.isDisco) {
            const hue = (Date.now() / 4000) % 1;
            activeTheme = { 
              ...activeTheme, 
              fg: hslToHex(hue, 1, 0.65), 
              dim: hslToHex(hue, 1, 0.3)
            };
        }
        const activeFont = FONTS[uiState.fontIdx]"""
    content = content.replace(old_theme_render, new_theme_render)

    with open(path, 'w') as f:
        f.write(content)

rebuild()
print("Done")
