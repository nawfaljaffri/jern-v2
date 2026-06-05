import sys
import re

def update_audio_engine():
    path = 'utils/audioEngine.ts'
    with open(path, 'r') as f:
        content = f.read()

    # Remove playPower
    content = re.sub(r'export const playPower = \(\) => \{.*?\};', '', content, flags=re.DOTALL)

    new_sounds = """
// The Spin-Up (System Booting)
export const playBootUp = () => {
  playTone('sine', 50, 400, 0.8, 0.4);
  playTone('sawtooth', 100, 300, 0.8, 0.2);
};

// The Snap-Down (System Shutting Down / Exiting)
export const playPowerOff = () => {
  playTone('square', 2000, 100, 0.05, 0.2); 
  playTone('sawtooth', 50, 10, 0.4, 0.3);    
};

// The UI Chirp (Opening a Modal/Settings)
export const playModalOpen = () => {
  playTone('square', 400, 600, 0.04, 0.1);
  setTimeout(() => playTone('square', 600, 800, 0.04, 0.1), 50);
};

// The UI Thud (Closing a Modal/Settings)
export const playModalClose = () => {
  playTone('square', 300, 150, 0.05, 0.1);
};
"""
    content = content.replace("export const playEnter", new_sounds.strip() + "\nexport const playEnter")
    
    with open(path, 'w') as f:
        f.write(content)


def update_page_tsx():
    path = 'app/coding/page.tsx'
    with open(path, 'r') as f:
        content = f.read()

    # 1. Update imports
    content = content.replace(
        "import { initAudio, toggleMute, isMuted, playClack, playTick, playEnter, playPower, startHum }",
        "import { initAudio, toggleMute, isMuted, playClack, playTick, playEnter, playBootUp, playPowerOff, playModalOpen, playModalClose, startHum }"
    )

    # 2. Update drawCanvas !uiState.isBooted logic
    old_boot_logic = """
    if (!uiState.isBooted) {
        const msg1 = "NAWFAL JAFFRI";
        const msg2 = "[ PRESS ENTER TO POWER ON ]";
        writeStr(Math.floor((COLS - msg1.length) / 2), Math.floor(ROWS / 2) - 1, msg1, 0);
        if (cursorVisible.current) {
            writeStr(Math.floor((COLS - msg2.length) / 2), Math.floor(ROWS / 2) + 1, msg2, 2);
        }
        buffer.renderToCanvas(ctx, charW, charH, activeFont, activeTheme);
        textureRef.current.needsUpdate = true
        return;
    }
"""
    new_boot_logic = """
    if (!uiState.isBooted) {
        const logo = [
          "███╗   ██╗ █████╗ ██╗    ██╗███████╗ █████╗ ██╗     ",
          "████╗  ██║██╔══██╗██║    ██║██╔════╝██╔══██╗██║     ",
          "██╔██╗ ██║███████║██║ █╗ ██║█████╗  ███████║██║     ",
          "██║╚██╗██║██╔══██║██║███╗██║██╔══╝  ██╔══██║██║     ",
          "██║ ╚████║██║  ██║╚███╔███╔╝██║     ██║  ██║███████╗",
          "╚═╝  ╚═══╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝     ╚═╝  ╚═╝╚══════╝"
        ];
        const startY = Math.floor(ROWS / 2) - 4 - Math.floor(logo.length / 2);
        logo.forEach((line, i) => {
            writeStr(Math.floor((COLS - line.length) / 2), startY + i, line, 0);
        });
        
        buffer.renderToCanvas(ctx, charW, charH, activeFont, activeTheme);
        
        const promptStr = "[ PRESS ANY KEY TO POWER ON ]";
        const px = Math.floor((COLS - promptStr.length) / 2) * charW;
        const py = (startY + logo.length + 3) * charH + activeFont.yOffset;
        
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
    content = content.replace(old_boot_logic.strip(), new_boot_logic.strip())

    # 3. Add useFrame hook call to redraw canvas continuously when !isBooted
    use_frame_find = """
    if (shaderPassRef.current) {
      shaderPassRef.current.uniforms.u_brightness.value = effects.brightness
"""
    use_frame_replace = """
    if (!uiState.isBooted) {
        if (setRedrawFn.current) setRedrawFn.current();
    }
    if (shaderPassRef.current) {
      shaderPassRef.current.uniforms.u_brightness.value = effects.brightness
"""
    content = content.replace(use_frame_find.strip(), use_frame_replace.strip())

    # 4. Update handleKeyDown triggers
    old_kd_trigger = """
    if (!uiState.isBooted && e.key === 'Enter') {
        initAudio();
        playPower();
        startHum();
        setUiState(s => ({ ...s, isBooted: true }));
        return;
    }
"""
    new_kd_trigger = """
    if (!uiState.isBooted) {
        initAudio();
        playBootUp();
        startHum();
        setUiState(s => ({ ...s, isBooted: true }));
        return;
    }
"""
    content = content.replace(old_kd_trigger.strip(), new_kd_trigger.strip())

    # Update playPower in handleKeyDown
    content = content.replace("} else if (e.key === 'Escape') {\n            playPower();", "} else if (e.key === 'Escape') {\n            playModalClose();")
    content = content.replace("playPower();\n              setUiState(s => ({ ...s, settingsOpen: false }))", "playModalClose();\n              setUiState(s => ({ ...s, settingsOpen: false }))")

    # 5. Update handlePointerInteraction triggers
    old_pi_boot = """
    if (!uiState.isBooted) {
        if (isClick) {
            initAudio();
            playPower();
            startHum();
            setUiState(s => ({ ...s, isBooted: true }));
        }
        return;
    }
"""
    new_pi_boot = """
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
    content = content.replace(old_pi_boot.strip(), new_pi_boot.strip())

    content = content.replace("playPower();\n                 setUiState(s => ({ ...s, settingsOpen: false })); return;", "playModalClose();\n                 setUiState(s => ({ ...s, settingsOpen: false })); return;")
    
    content = content.replace("playPower();\n           setUiState(s => ({ ...s, settingsOpen: true }))", "playModalOpen();\n           setUiState(s => ({ ...s, settingsOpen: true }))")

    with open(path, 'w') as f:
        f.write(content)

update_audio_engine()
update_page_tsx()
print("Updates applied successfully.")
