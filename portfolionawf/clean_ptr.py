with open('app/coding/page.tsx', 'r') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "const soundText = uiState.soundOn ? '[ SOUND: ON ]' : '[ SOUND: MUTED ]'" in line:
        start_idx = i
    if "return (" in line and start_idx != -1 and i > start_idx:
        end_idx = i - 1
        break

if start_idx != -1 and end_idx != -1:
    new_ptr = """    const soundText = uiState.soundOn ? '[ SOUND: ON ]' : '[ SOUND: MUTED ]'
    const topBarRightStr = `[ SETTINGS ]  ${soundText}  [ ← BACK ]`
    const startXTop = COLS - topBarRightStr.length - 2

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
  }
"""
    lines[start_idx:end_idx+1] = [new_ptr]
    
    with open('app/coding/page.tsx', 'w') as f:
        f.writelines(lines)
    print("Cleaned pointer logic!")
else:
    print(f"Failed to find bounds: {start_idx} {end_idx}")
