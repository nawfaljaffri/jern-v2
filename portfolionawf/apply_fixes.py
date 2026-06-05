import sys

def rebuild():
    path = 'app/coding/page.tsx'
    with open(path, 'r') as f:
        content = f.read()

    # Fix 1: uiState
    old_uistate = """  const [uiState, setUiState] = useState({
    selectedIndex: 0,
    themeIdx: 0,
    fontIdx: 0,
    settingsOpen: false,
    aspectRatio: '4:3',
    settingsCursorIdx: 0,
    isBooted: false,
    soundOn: true
  })"""
    new_uistate = """  const [uiState, setUiState] = useState({
    selectedIndex: 0,
    themeIdx: 0,
    fontIdx: 0,
    settingsOpen: false,
    aspectRatio: '4:3',
    settingsCursorIdx: 0,
    isBooted: false,
    soundOn: true,
    isDevMode: false,
    devModeStart: 0,
    isZeroG: false,
    isDisco: false
  })"""
    content = content.replace(old_uistate, new_uistate)

    # Fix 2: handleKeyDown Enter
    old_enter = """    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (uiState.settingsOpen) {
          if (uiState.settingsCursorIdx < 6) {
              setUiState(s => ({ ...s, themeIdx: s.settingsCursorIdx }))
          } else if (uiState.settingsCursorIdx < 9) {
              setUiState(s => ({ ...s, fontIdx: s.settingsCursorIdx - 6 }))
          } else if (uiState.settingsCursorIdx >= 15 && uiState.settingsCursorIdx < 18) {
              const ratios = ['4:3', '5:4', 'FLUID']
              setUiState(s => ({ ...s, aspectRatio: ratios[s.settingsCursorIdx - 15] }))
          } else if (uiState.settingsCursorIdx === 18) {
              playModalClose();
              setUiState(s => ({ ...s, settingsOpen: false }))
          }
      }
    }"""
    new_enter = """    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (uiState.settingsOpen) {
          if (uiState.settingsCursorIdx < 6) {
              setUiState(s => ({ ...s, themeIdx: s.settingsCursorIdx }))
          } else if (uiState.settingsCursorIdx < 9) {
              setUiState(s => ({ ...s, fontIdx: s.settingsCursorIdx - 6 }))
          } else if (uiState.settingsCursorIdx >= 15 && uiState.settingsCursorIdx < 18) {
              const ratios = ['4:3', '5:4', 'FLUID']
              setUiState(s => ({ ...s, aspectRatio: ratios[s.settingsCursorIdx - 15] }))
          } else if (uiState.settingsCursorIdx === 18) {
              playModalClose();
              setUiState(s => ({ ...s, settingsOpen: false }))
          }
      } else {
          const cmd = textRef.current.trim().toLowerCase();
          if (cmd === 'devmode' || cmd === 'story') {
              setUiState(s => ({ ...s, isDevMode: true, devModeStart: Date.now() }));
              textRef.current = '';
              playBootUp();
          } else if (cmd === 'gravity=0') {
              setUiState(s => ({ ...s, isZeroG: true }));
              textRef.current = '';
              playPowerOff();
          } else if (cmd === 'gravity=1') {
              setUiState(s => ({ ...s, isZeroG: false }));
              textRef.current = '';
              playBootUp();
          } else if (cmd === 'disco') {
              setUiState(s => ({ ...s, isDisco: !s.isDisco }));
              textRef.current = '';
              playBootUp();
          } else {
              playEnter();
              textRef.current = '';
          }
          if (setRedrawFn.current) setRedrawFn.current();
      }
    }"""
    content = content.replace(old_enter, new_enter)

    # Fix 3: Snake Head
    old_snake = """        const s = snakeState.current;
        s.body.forEach((segment: any) => {
            buffer.writeStr(segment.x, segment.y, '█', segment.color || getRandomSnakeColor());
        });"""
    new_snake = """        const s = snakeState.current;
        s.body.forEach((segment: any, index: number) => {
            buffer.writeStr(segment.x, segment.y, '█', index === 0 ? '#ffffff' : (segment.color || getRandomSnakeColor()));
        });"""
    content = content.replace(old_snake, new_snake)

    # Add disco logic to useFrame
    old_useframe = """  useFrame((state) => {
    if (!uiState.isBooted) {"""
    new_useframe = """  useFrame((state) => {
    if (uiState.isDisco) {
        if (Math.random() < 0.05) {
            setUiState((s: any) => ({ ...s, themeIdx: Math.floor(Math.random() * 6) }));
        }
    }
    if (!uiState.isBooted) {"""
    content = content.replace(old_useframe, new_useframe)

    with open(path, 'w') as f:
        f.write(content)

rebuild()
print("Done")
