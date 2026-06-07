with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

start_str = "const soundText = uiState.soundOn ? '[ SOUND: ON ]' : '[ SOUND: MUTED ]'"
end_str = "if (isClick && !uiState.settingsOpen) {\n        if (gridY >= 10 && gridY < 28) {"

start_idx = content.find(start_str, content.find("handlePointerInteraction"))
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    end_idx += len(end_str)
    
    new_ptr = """const soundText = uiState.soundOn ? '[ SOUND: ON ]' : '[ SOUND: MUTED ]'
    const topBarRightStr = `[ SETTINGS ]  ${soundText}  [ ← BACK ]`
    const startX = COLS - topBarRightStr.length - 2
    if (gridY === 6 && isClick) {
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

    const colW = 28;
    if (isClick && !uiState.settingsOpen) {
        if (gridY >= 11 && gridY < 27) {"""
    
    content = content[:start_idx] + new_ptr + content[end_idx:]
    
    # Let's fix the rowIdx offset
    content = content.replace("const idx = gridY - 10;", "const idx = gridY - 11;")
    
    with open('app/coding/page.tsx', 'w') as f:
        f.write(content)
    print("Step 4 done")
else:
    print("Step 4 failed", start_idx, end_idx)
