import sys

def rebuild():
    path = 'app/coding/page.tsx'
    with open(path, 'r') as f:
        content = f.read()

    def do_replace(old, new, name):
        nonlocal content
        if old not in content:
            raise Exception(f"Failed to find block: {name}")
        content = content.replace(old, new)

    # 1. Remove discoThemeRef and old snowRef
    do_replace(
"""  const cursorRef = useRef(0)
  const setRedrawFn = useRef<(() => void) | null>(null)
  const gridSizeRef = useRef({ cols: 142, rows: 32, charW: 14.4, charH: 32 })
  const snowRef = useRef<any[]>([])
  const discoThemeRef = useRef<any>(null)""",
"""  const cursorRef = useRef(0)
  const setRedrawFn = useRef<(() => void) | null>(null)
  const gridSizeRef = useRef({ cols: 142, rows: 32, charW: 14.4, charH: 32 })
  const snowRef = useRef<any[]>([])""",
      "refs"
    )

    # 2. Fix drawCanvas activeTheme and remove disco
    do_replace(
"""  const drawCanvas = () => {
    if (!canvasRef.current || gridSizeRef.current.cols === 0) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    let activeTheme = THEMES[uiState.themeIdx]
    if (uiState.isDisco && discoThemeRef.current) {
        activeTheme = discoThemeRef.current;
    }""",
"""  const drawCanvas = () => {
    if (!canvasRef.current || gridSizeRef.current.cols === 0) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    let activeTheme = THEMES[uiState.themeIdx]""",
      "drawCanvas_theme"
    )

    # 3. Fix drawCanvas screensaver block (remove isSnakePlayable and isSnow)
    do_replace(
"""    if (!uiState.isBooted || uiState.isSnakePlayable) {
        // Draw Snake
        const s = snakeState.current;
        s.body.forEach((segment: any, index: number) => {
            buffer.writeStr(segment.x, segment.y, '█', segment.color || getRandomSnakeColor());
        });
        buffer.writeStr(s.food.x, s.food.y, '●', '#ffffff');
    }

    if (!uiState.isBooted) {
        // Draw Title
        const titleStr = "NAWFAL JAFFRI";
        const titleX = Math.floor((COLS - titleStr.length) / 2);
        const titleY = Math.floor(ROWS / 2) - 1;
        buffer.writeStr(titleX, titleY, titleStr, 0);
        
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
        
        if (uiState.isSnow) {
            snowRef.current.forEach(flake => {
                buffer.writeStr(Math.floor(flake.x), Math.floor(flake.y), flake.char, 0);
                if (flake.y > 1) buffer.writeStr(Math.floor(flake.x), Math.floor(flake.y) - 1, flake.char, 1);
            });
        }
        
        persistedBuffer.current = buffer;
        textureRef.current.needsUpdate = true;
        return;
    }""",
"""    if (!uiState.isBooted) {
        // Draw Snake
        const s = snakeState.current;
        s.body.forEach((segment: any, index: number) => {
            buffer.writeStr(segment.x, segment.y, '█', segment.color || getRandomSnakeColor());
        });
        buffer.writeStr(s.food.x, s.food.y, '●', '#ffffff');

        // Draw Title
        const titleStr = "NAWFAL JAFFRI";
        const titleX = Math.floor((COLS - titleStr.length) / 2);
        const titleY = Math.floor(ROWS / 2) - 1;
        buffer.writeStr(titleX, titleY, titleStr, 0);
        
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
        
        persistedBuffer.current = buffer;
        textureRef.current.needsUpdate = true;
        return;
    }""",
      "screensaver_block"
    )

    # 4. Fix drawCanvas end block (move snow & playable snake BEFORE renderToCanvas)
    do_replace(
"""    buffer.renderToCanvas(ctx, charW, charH, activeFont, activeTheme);
    if (uiState.isSnow) {
        snowRef.current.forEach(flake => {
            buffer.writeStr(Math.floor(flake.x), Math.floor(flake.y), flake.char, 0);
            if (flake.y > 1) buffer.writeStr(Math.floor(flake.x), Math.floor(flake.y) - 1, flake.char, 1);
        });
    }

    persistedBuffer.current = buffer;
    textureRef.current.needsUpdate = true
  }""",
"""    if (uiState.isSnakePlayable) {
        // Draw Playable Snake ON TOP of UI boxes
        const s = snakeState.current;
        s.body.forEach((segment: any, index: number) => {
            buffer.writeStr(segment.x, segment.y, '█', segment.color || getRandomSnakeColor());
        });
        buffer.writeStr(s.food.x, s.food.y, '●', '#ffffff');
    }

    if (uiState.isSnow) {
        snowRef.current.forEach(flake => {
            buffer.writeStr(Math.floor(flake.x), Math.floor(flake.y), flake.char, 0);
            if (flake.y > 1) buffer.writeStr(Math.floor(flake.x), Math.floor(flake.y) - 1, flake.char, 1);
        });
    }

    buffer.renderToCanvas(ctx, charW, charH, activeFont, activeTheme);

    persistedBuffer.current = buffer;
    textureRef.current.needsUpdate = true
  }""",
      "drawCanvas_end"
    )

    # 5. Remove disco from useFrame and restore effects
    do_replace(
"""  useFrame((state) => {
    if (uiState.isDisco) {
      const speed = 3000;
      const time = Date.now();
      const idx1 = Math.floor(time / speed) % THEMES.length;
      const idx2 = (idx1 + 1) % THEMES.length;
      const t = (time % speed) / speed;
      const t1 = THEMES[idx1];
      const t2 = THEMES[idx2];
      discoThemeRef.current = {
          ...t1,
          fg: lerpHex(t1.fg, t2.fg, t),
          bg: lerpHex(t1.bg, t2.bg, t),
          dim: lerpHex(t1.dim, t2.dim, t),
          bloom: t1.bloom + (t2.bloom - t1.bloom) * t,
          radius: t1.radius + (t2.radius - t1.radius) * t,
          thresh: t1.thresh + (t2.thresh - t1.thresh) * t,
          burnIn: t1.burnIn + (t2.burnIn - t1.burnIn) * t,
          bright: t1.bright + (t2.bright - t1.bright) * t,
          satur: t1.satur + (t2.satur - t1.satur) * t,
          curve: t1.curve + (t2.curve - t1.curve) * t,
          crush: t1.crush + (t2.crush - t1.crush) * t,
          grain: t1.grain + (t2.grain - t1.grain) * t,
      };
    }

    if (uiState.isSnow && gridSizeRef.current.cols > 0) {""",
"""  useFrame((state) => {
    if (uiState.isSnow && gridSizeRef.current.cols > 0) {""",
      "useFrame_disco"
    )

    do_replace(
"""    } else if (uiState.isZeroG || uiState.isDevMode || uiState.isDisco || uiState.isSnow) {
        if (setRedrawFn.current) setRedrawFn.current();
    }
    
    if (shaderPassRef.current) {
      shaderPassRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
    if (uiState.isDisco && discoThemeRef.current) {
        if (bloomRef.current) {
          bloomRef.current.strength = discoThemeRef.current.bloom
          bloomRef.current.radius = discoThemeRef.current.radius
          bloomRef.current.threshold = discoThemeRef.current.thresh
        }
        if (afterimageRef.current) {
          afterimageRef.current.uniforms.damp.value = discoThemeRef.current.burnIn
        }
        if (shaderPassRef.current) {
          shaderPassRef.current.uniforms.u_brightness.value = discoThemeRef.current.bright
          shaderPassRef.current.uniforms.u_saturation.value = discoThemeRef.current.satur
          shaderPassRef.current.uniforms.u_curvature.value = discoThemeRef.current.curve
          shaderPassRef.current.uniforms.u_downsample.value = discoThemeRef.current.crush
          shaderPassRef.current.uniforms.u_grain.value = discoThemeRef.current.grain
        }
    } else {
        if (bloomRef.current) {
          bloomRef.current.strength = effects.bloomAmt
          bloomRef.current.radius = effects.bloomRadius
          bloomRef.current.threshold = effects.bloomThresh
        }
        if (afterimageRef.current) {
          afterimageRef.current.uniforms.damp.value = effects.burnIn
        }
        if (shaderPassRef.current) {
          shaderPassRef.current.uniforms.u_brightness.value = effects.brightness
          shaderPassRef.current.uniforms.u_saturation.value = effects.saturation
          shaderPassRef.current.uniforms.u_curvature.value = effects.curvature
          shaderPassRef.current.uniforms.u_downsample.value = effects.downsample
          shaderPassRef.current.uniforms.u_grain.value = effects.grain
        }
    }""",
"""    } else if (uiState.isZeroG || uiState.isDevMode || uiState.isSnow) {
        if (setRedrawFn.current) setRedrawFn.current();
    }
    
    if (shaderPassRef.current) {
      shaderPassRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
    if (bloomRef.current) {
      bloomRef.current.strength = effects.bloomAmt
      bloomRef.current.radius = effects.bloomRadius
      bloomRef.current.threshold = effects.bloomThresh
    }
    if (afterimageRef.current) {
      afterimageRef.current.uniforms.damp.value = effects.burnIn
    }
    if (shaderPassRef.current) {
      shaderPassRef.current.uniforms.u_brightness.value = effects.brightness
      shaderPassRef.current.uniforms.u_saturation.value = effects.saturation
      shaderPassRef.current.uniforms.u_curvature.value = effects.curvature
      shaderPassRef.current.uniforms.u_downsample.value = effects.downsample
      shaderPassRef.current.uniforms.u_grain.value = effects.grain
    }""",
      "useFrame_effects"
    )

    # 6. Clean up uiState
    do_replace(
"""    isZeroG: false,
    isDisco: false,
    isSnow: false,""",
"""    isZeroG: false,
    isSnow: false,""",
      "uiState_disco"
    )

    # 7. Remove disco from terminal commands
    do_replace(
"""          } else if (cmd === 'disco') {
              setUiState(s => ({ ...s, isDisco: !s.isDisco }));
              textRef.current = '';
              playBootUp();""",
"""""",
      "cmd_disco"
    )

    with open(path, 'w') as f:
        f.write(content)

rebuild()
print("All patches applied successfully.")
