import sys

def rebuild():
    path = 'app/coding/page.tsx'
    with open(path, 'r') as f:
        content = f.read()

    # Find the useFrame block
    old_logic = """  useFrame((state) => {
    if (!uiState.isBooted) {
        const now = Date.now();
        if (now - snakeState.current.lastMove > 80) {
            snakeState.current.lastMove = now;
            
            const cols = gridSizeRef.current.cols;
            const rows = gridSizeRef.current.rows;
            const s = snakeState.current;
            const head = s.body[0];
            
            let nx = head.x + s.dir.x;
            let ny = head.y + s.dir.y;
            
            if (nx < 0 || nx >= cols || ny < 0 || ny >= rows || s.body.some((b: any, i: number) => i !== 0 && b.x === nx && b.y === ny)) {
                if (s.dir.x !== 0) { 
                    s.dir.x = 0;
                    s.dir.y = head.y > rows/2 ? -1 : 1; 
                } else {
                    s.dir.y = 0;
                    s.dir.x = head.x > cols/2 ? -1 : 1;
                }
                nx = head.x + s.dir.x;
                ny = head.y + s.dir.y;
            }
            
            s.body.unshift({x: nx, y: ny});
            
            if (nx === s.food.x && ny === s.food.y) {
                s.food = {
                    x: Math.floor(Math.random() * (cols - 2)) + 1,
                    y: Math.floor(Math.random() * (rows - 2)) + 1
                };
            } else {
                s.body.pop();
            }
        }
        if (setRedrawFn.current) setRedrawFn.current();
    }"""

    new_logic = """  useFrame((state) => {
    if (!uiState.isBooted) {
        const now = Date.now();
        if (now - snakeState.current.lastMove > 80) {
            snakeState.current.lastMove = now;
            
            const cols = gridSizeRef.current.cols;
            const rows = gridSizeRef.current.rows;
            if (cols > 0 && rows > 0) {
                const s = snakeState.current;
                const head = s.body[0];
                
                // Smart AI to seek food
                const dx = s.food.x - head.x;
                const dy = s.food.y - head.y;
                
                let possibleDirs = [
                    {x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}
                ];
                
                // Filter out 180 degree turns and self-collisions
                possibleDirs = possibleDirs.filter(d => {
                    if (d.x === -s.dir.x && d.y === -s.dir.y) return false;
                    const checkX = (head.x + d.x + cols) % cols;
                    const checkY = (head.y + d.y + rows) % rows;
                    return !s.body.some((b: any, i: number) => i !== 0 && b.x === checkX && b.y === checkY);
                });
                
                if (possibleDirs.length > 0) {
                    // Sort by distance to food
                    possibleDirs.sort((a, b) => {
                        const distA = Math.abs(head.x + a.x - s.food.x) + Math.abs(head.y + a.y - s.food.y);
                        const distB = Math.abs(head.x + b.x - s.food.x) + Math.abs(head.y + b.y - s.food.y);
                        return distA - distB;
                    });
                    
                    // 90% chance to pick best path, 10% chance to pick random safe path for erratic movement
                    if (Math.random() > 0.1) {
                        s.dir = possibleDirs[0];
                    } else {
                        s.dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                    }
                }
                
                // Execute move with wrap-around
                let nx = (head.x + s.dir.x + cols) % cols;
                let ny = (head.y + s.dir.y + rows) % rows;
                
                s.body.unshift({x: nx, y: ny});
                
                if (nx === s.food.x && ny === s.food.y) {
                    s.food = {
                        x: Math.floor(Math.random() * (cols - 2)) + 1,
                        y: Math.floor(Math.random() * (rows - 2)) + 1
                    };
                } else {
                    s.body.pop();
                }
            }
        }
        if (setRedrawFn.current) setRedrawFn.current();
    }"""
    content = content.replace(old_logic, new_logic)

    with open(path, 'w') as f:
        f.write(content)

rebuild()
print("Done")
