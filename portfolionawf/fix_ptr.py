import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

ptr_start = content.find("const soundText = uiState.soundOn ? '[ SOUND: ON ]' : '[ SOUND: MUTED ]'")
ptr_end = content.find("if (gridY === 28 && gridX >= 2) {")

if ptr_start != -1 and ptr_end != -1:
    new_ptr = """const soundText = uiState.soundOn ? '[ SOUND: ON ]' : '[ SOUND: MUTED ]'
    const topBarRight = `[ SETTINGS ]  ${soundText}  [ ← BACK ]`
    const startXTop = COLS - topBarRight.length - 2

    if (gridY === 6 && isClick) {
      if (gridX >= startXTop && gridX <= startXTop + 11) {
        setUiState(prev => ({ ...prev, settingsOpen: true, settingsCursorIdx: 0 }))
        return
      }
      if (gridX >= startXTop + 14 && gridX < startXTop + 14 + soundText.length) {
        setUiState(prev => ({ ...prev, soundOn: !prev.soundOn }))
        return
      }
      if (gridX >= startXTop + 14 + soundText.length + 2) {
        window.location.href = '/'
        return
      }
    }

    const boxY = 9;
    if (gridY >= boxY + 2 && gridY < boxY + 2 + DIRECTORY.length) {
        const rowIdx = gridY - (boxY + 2);
        if (isClick) {
            setUiState(prev => ({
                ...prev,
                navPath: [rowIdx],
                focusDepth: 0,
                scrollOffset: 0
            }))
        }
    }

    """
    content = content[:ptr_start] + new_ptr + content[ptr_end:]
    
    with open('app/coding/page.tsx', 'w') as f:
        f.write(content)
    print("Fixed ptr logic!")
else:
    print("Failed to find bounds")
