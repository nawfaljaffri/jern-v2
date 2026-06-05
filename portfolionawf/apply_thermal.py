import sys

def rebuild():
    path = 'app/coding/page.tsx'
    with open(path, 'r') as f:
        content = f.read()

    # 1. Update TextBuffer typing for colorBuffer
    old_color_buffer = "colorBuffer: number[][];"
    new_color_buffer = "colorBuffer: (number | string)[][];"
    content = content.replace(old_color_buffer, new_color_buffer)

    old_write_str = "writeStr(x: number, y: number, str: string, color = 0) {"
    new_write_str = "writeStr(x: number, y: number, str: string, color: number | string = 0) {"
    content = content.replace(old_write_str, new_write_str)

    # 2. Update renderToCanvas to handle string colors
    old_render = """    for (let y = 0; y < this.rows; y++) {
      let currentString = '';
      let currentColor = -1;
      let startX = 0;

      const renderSegment = () => {
        if (currentString.length > 0) {
          if (currentColor === 2) { 
              ctx.shadowBlur = 0;
              ctx.fillStyle = colorInvertedBg;
              ctx.fillRect(startX * charW, y * charH - 2, currentString.length * charW, charH + 4);
              ctx.fillStyle = colorInvertedFg;
          } else if (currentColor === 1) { 
              ctx.fillStyle = colorDim;
          } else { 
              ctx.fillStyle = colorFg;
          }
          ctx.shadowBlur = 0;
          ctx.fillText(currentString, startX * charW, y * charH + activeFont.yOffset);
        }
      }"""
      
    new_render = """    for (let y = 0; y < this.rows; y++) {
      let currentString = '';
      let currentColor: number | string = -1;
      let startX = 0;

      const renderSegment = () => {
        if (currentString.length > 0) {
          if (typeof currentColor === 'string') {
              ctx.fillStyle = currentColor;
              ctx.shadowBlur = 0;
          } else if (currentColor === 2) { 
              ctx.shadowBlur = 0;
              ctx.fillStyle = colorInvertedBg;
              ctx.fillRect(startX * charW, y * charH - 2, currentString.length * charW, charH + 4);
              ctx.fillStyle = colorInvertedFg;
          } else if (currentColor === 1) { 
              ctx.fillStyle = colorDim;
          } else { 
              ctx.fillStyle = colorFg;
          }
          ctx.shadowBlur = 0;
          ctx.fillText(currentString, startX * charW, y * charH + activeFont.yOffset);
        }
      }"""
    content = content.replace(old_render, new_render)

    # 3. Update the snake rendering
    old_snake_draw = """        // Draw Snake
        const s = snakeState.current;
        s.body.forEach((segment: any) => {
            buffer.writeStr(segment.x, segment.y, '█', 0);
        });
        buffer.writeStr(s.food.x, s.food.y, '●', 0);"""
        
    new_snake_draw = """        // Draw Snake
        const thermalRamp = [
          '#ffffff', // Head: Pure White (Maximum Bloom flare)
          '#ffff00', // Body 1: Bright Yellow
          '#ffcc00', // Body 2: Deep Yellow
          '#ff6600', // Body 3: Orange
          '#ff0000', // Body 4: Pure Red
          '#990000', // Body 5: Dark Red
          '#330000'  // Tail: Smoldering Red (Lowest Bloom)
        ];
        
        const s = snakeState.current;
        s.body.forEach((segment: any, index: number) => {
            const colorIndex = Math.min(index, thermalRamp.length - 1);
            buffer.writeStr(segment.x, segment.y, '█', thermalRamp[colorIndex]);
        });
        buffer.writeStr(s.food.x, s.food.y, '●', '#ffffff');"""
    content = content.replace(old_snake_draw, new_snake_draw)

    with open(path, 'w') as f:
        f.write(content)

rebuild()
print("Done")
