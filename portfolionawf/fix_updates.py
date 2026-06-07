import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# 1. Update onWheel scroll logic to be slower
content = content.replace("s.scrollOffset + (e.deltaY > 0 ? 1 : -1)", "s.scrollOffset + (e.deltaY > 0 ? 0.3 : -0.3)")

# Make scroll use Math.floor
content = content.replace("const scroll = Math.min(uiState.scrollOffset, maxScroll);", "const scroll = Math.floor(Math.min(uiState.scrollOffset, maxScroll));")

# 2. Update wrapText margins
content = content.replace("wrapText(rawLine, detailW - 5)", "wrapText(rawLine, detailW - 8)")
content = content.replace("wrapText(rawLine, previewW - 5)", "wrapText(rawLine, previewW - 8)")

# 3. Add Stack & Links to wrapping
proj_old = "allLines.push(`Stack: ${projectNode.lang}  |  Links: ${projectNode.links || ''}`);"
proj_new = "const stackWrapped = wrapText(`Stack: ${projectNode.lang}  |  Links: ${projectNode.links || ''}`, detailW - 8);\n                    allLines.push(...stackWrapped);"
content = content.replace(proj_old, proj_new)

# 4. CPU and Mem to Contact info
cpu_pattern = re.compile(r"drawBoxUI\(0, 0, COLS, 8, 'cpu & mem'\).*?writeUI\(2, 6, `Uptime.*?`, 1\)", re.DOTALL)
cpu_new = """drawBoxUI(0, 0, COLS, 8, 'CONTACT')
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false })
    writeUI(COLS / 2 - 4, 0, `┤${timeStr}├`, 0)
    
    writeUI(2, 2, `nawfaljaffri@gmail.com`, 0)
    writeUI(2, 3, `+971 50 4945990`, 0)
    writeUI(2, 4, `linkedin.com/in/nawfaljaffri`, 0)
    writeUI(2, 6, `Location: Dubai, UAE`, 1)"""
content = cpu_pattern.sub(cpu_new, content)

# 5. Fix click mapping
click_pattern = re.compile(r"if \(gridY >= 10 && gridY < 28\) \{.*?for \(let depth = 0; depth <= uiState\.navPath\.length; depth\+\+\) \{.*?if \(gridX > startX && gridX < startX \+ colW\) \{.*?let currentLevel = DIRECTORY;.*?for \(let i = 0; i < depth; i\+\+\) \{.*?currentLevel = currentLevel\[uiState\.navPath\[i\]\]\?\.children;.*?if \(currentLevel\) \{.*?const idx = gridY - 10;.*?if \(idx >= 0 && idx < currentLevel\.length\) \{.*?playTick\(\);.*?setUiState\(s => \{.*?const newPath = \[\.\.\.s\.navPath\.slice\(0, depth\), idx\];.*?return \{ \.\.\.s, focusDepth: depth, navPath: newPath, scrollOffset: 0 \}.*?\}\).*?if \(inputRef\.current\) inputRef\.current\.focus\(\).*?\} \}\}\}\}", re.DOTALL)

click_new = """if (gridY >= 10 && gridY < 28) {
            for (let depth = 0; depth <= uiState.navPath.length; depth++) {
                const isProjectsList = depth === 1;
                const startX = isProjectsList ? colW + 2 : 1;
                const hitW = isProjectsList ? 24 : colW - 1;
                
                if (gridX >= startX && gridX < startX + hitW) {
                    let currentLevel = DIRECTORY;
                    for (let i = 0; i < depth; i++) {
                        currentLevel = currentLevel[uiState.navPath[i]]?.children;
                    }
                    if (currentLevel) {
                        const startY = isProjectsList ? 12 : 10;
                        const idx = gridY - startY;
                        if (idx >= 0 && idx < currentLevel.length) {
                            playTick();
                            setUiState(s => {
                                const newPath = [...s.navPath.slice(0, depth), idx];
                                return { ...s, focusDepth: Math.max(s.focusDepth, depth), navPath: newPath, scrollOffset: 0 }
                            })
                            if (inputRef.current) inputRef.current.focus()
                        }
                    }
                }
            }
        }"""
content = click_pattern.sub(click_new, content)

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)
print("done")
