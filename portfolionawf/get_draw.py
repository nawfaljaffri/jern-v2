with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

draw_start = content.find("const drawCanvas = () => {")
draw_end = content.find("if (isClick && !uiState.settingsOpen) {", draw_start)
if draw_start != -1 and draw_end != -1:
    print(content[draw_start:draw_end])
