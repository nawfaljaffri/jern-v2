import re

def update_audio():
    path = 'utils/audioEngine.ts'
    with open(path, 'r') as f:
        content = f.read()

    old_sounds = r"""
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
    new_sounds = r"""
export const playBootUp = () => {
  playTone('square', 100, 40, 0.1, 0.4); // Heavy initial clunk
  playTone('sawtooth', 40, 10, 0.5, 0.3); // Low electrical decay
};

export const playPowerOff = () => {
  playTone('square', 2000, 100, 0.05, 0.2); 
  playTone('sawtooth', 50, 10, 0.4, 0.3);    
};

export const playModalOpen = () => playTone('square', 150, 100, 0.02, 0.1);
export const playModalClose = () => playTone('square', 100, 50, 0.02, 0.1);
"""
    content = content.replace(old_sounds.strip(), new_sounds.strip())
    with open(path, 'w') as f:
        f.write(content)


def update_page():
    path = 'app/coding/page.tsx'
    with open(path, 'r') as f:
        content = f.read()

    # 1. Add logoState useRef
    content = content.replace(
        "const cursorVisible = useRef(true)",
        "const cursorVisible = useRef(true)\n  const logoState = useRef({ x: 10, y: 5, dx: 1, dy: 1 })"
    )

    # 2. Update useFrame for DVD bounce
    old_useframe_boot = r"""
    if (!uiState.isBooted) {
        if (setRedrawFn.current) setRedrawFn.current();
    }
"""
    new_useframe_boot = r"""
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
    content = content.replace(old_useframe_boot.strip(), new_useframe_boot.strip())

    # 3. Update drawCanvas boot screen logic
    old_draw_boot = r"""
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
    new_draw_boot = r"""
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
    content = content.replace(old_draw_boot.strip(), new_draw_boot.strip())
    
    with open(path, 'w') as f:
        f.write(content)

update_audio()
update_page()
print("Applied hotfixes.")
