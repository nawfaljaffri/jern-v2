import sys

def rebuild():
    path = 'app/coding/page.tsx'
    with open(path, 'r') as f:
        content = f.read()

    # 1. Add discoThemeRef
    old_refs = """  const snowRef = useRef<any[]>([])"""
    new_refs = """  const snowRef = useRef<any[]>([])
  const discoThemeRef = useRef<any>(null)"""
    if old_refs in content:
        content = content.replace(old_refs, new_refs)

    # 2. Fix Disco logic in drawCanvas
    old_disco_draw = """  let activeTheme = THEMES[uiState.themeIdx]
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
    new_disco_draw = """  let activeTheme = THEMES[uiState.themeIdx]
  if (uiState.isDisco && discoThemeRef.current) {
      activeTheme = discoThemeRef.current;
  }"""
    if old_disco_draw in content:
        content = content.replace(old_disco_draw, new_disco_draw)

    # 3. Update useFrame for snake, matrix, and disco effects
    old_useframe_top = """  useFrame((state) => {
    if (uiState.isSnow && gridSizeRef.current.cols > 0) {
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
    
    new_useframe_top = """  useFrame((state) => {
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

    if (uiState.isSnow && gridSizeRef.current.cols > 0) {
        if (Math.random() < 0.6) {
            snowRef.current.push({
                x: Math.floor(Math.random() * gridSizeRef.current.cols),
                y: 0,
                char: String.fromCharCode(33 + Math.floor(Math.random() * 93)),
                speed: Math.random() * 0.5 + 0.3
            });
        }
        snowRef.current.forEach(flake => { 
            flake.y += flake.speed; 
            if (Math.random() < 0.1) flake.char = String.fromCharCode(33 + Math.floor(Math.random() * 93));
        });
        snowRef.current = snowRef.current.filter(flake => flake.y < gridSizeRef.current.rows);
    }
    
    if (!uiState.isBooted || uiState.isSnakePlayable) {"""
    if old_useframe_top in content:
        content = content.replace(old_useframe_top, new_useframe_top)

    # 4. Update effects application in useFrame
    old_effects_apply = """    if (shaderPassRef.current) {
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
    }"""
    
    new_effects_apply = """    if (shaderPassRef.current) {
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
    }"""
    if old_effects_apply in content:
        content = content.replace(old_effects_apply, new_effects_apply)

    # 5. Fix snake rendering and snow rendering in drawCanvas
    old_draw_snake = """    if (!uiState.isBooted) {
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

        if (Date.now() % 1000 < 500) {
            const promptStr = "[ PRESS ANY KEY TO POWER ON ]";
            buffer.writeStr(Math.floor((COLS - promptStr.length) / 2), titleY + 2, promptStr, 1);
        }
        
        persistedBuffer.current = buffer;
        textureRef.current.needsUpdate = true;
        return;
    }"""
    
    new_draw_snake = """    if (!uiState.isBooted || uiState.isSnakePlayable) {
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

        if (Date.now() % 1000 < 500) {
            const promptStr = "[ PRESS ANY KEY TO POWER ON ]";
            buffer.writeStr(Math.floor((COLS - promptStr.length) / 2), titleY + 2, promptStr, 1);
        }
        
        if (uiState.isSnow) {
            snowRef.current.forEach(flake => {
                buffer.writeStr(Math.floor(flake.x), Math.floor(flake.y), flake.char, 0);
                if (flake.y > 1) buffer.writeStr(Math.floor(flake.x), Math.floor(flake.y) - 1, flake.char, 1);
            });
        }
        
        persistedBuffer.current = buffer;
        textureRef.current.needsUpdate = true;
        return;
    }"""
    if old_draw_snake in content:
        content = content.replace(old_draw_snake, new_draw_snake)

    old_draw_snow = """    if (uiState.isSnow) {
        snowRef.current.forEach(flake => {
            buffer.writeStr(Math.floor(flake.x), Math.floor(flake.y), flake.char, 0);
        });
    }"""
    new_draw_snow = """    if (uiState.isSnow) {
        snowRef.current.forEach(flake => {
            buffer.writeStr(Math.floor(flake.x), Math.floor(flake.y), flake.char, 0);
            if (flake.y > 1) buffer.writeStr(Math.floor(flake.x), Math.floor(flake.y) - 1, flake.char, 1);
        });
    }"""
    if old_draw_snow in content:
        content = content.replace(old_draw_snow, new_draw_snow)

    # 6. Change snow to matrix alias
    old_cmd_snow = """          } else if (cmd === 'snow') {
              setUiState(s => ({ ...s, isSnow: !s.isSnow }));"""
    new_cmd_snow = """          } else if (cmd === 'snow' || cmd === 'matrix') {
              setUiState(s => ({ ...s, isSnow: !s.isSnow }));"""
    if old_cmd_snow in content:
        content = content.replace(old_cmd_snow, new_cmd_snow)
        
    with open(path, 'w') as f:
        f.write(content)

rebuild()
print("Done")
