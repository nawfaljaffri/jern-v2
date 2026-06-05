import sys

def rebuild():
    path = 'app/coding/page.tsx'
    with open(path, 'r') as f:
        content = f.read()

    # 1. Add PALETTE before CRTScreen
    old_func_def = "function CRTScreen({ "
    new_func_def = """const SNAKE_PALETTE = [
  '#FFFF00', '#FF6600', '#FF3333', '#FF00FF', '#33FF33', '#00FFFF', '#3333FF', '#9900CC', '#99FF00', '#FFD700', '#87CEEB', '#FF69B4', '#9ACD32', '#00BFFF', '#FF0099', '#00FFCC', '#FFEB00', '#FF9900', '#FF1A1A', '#FF1AFF', '#1AFFFF', '#1A1AFF', '#1AFF1A'
];
const getRandomSnakeColor = () => SNAKE_PALETTE[Math.floor(Math.random() * SNAKE_PALETTE.length)];

function CRTScreen({ """
    content = content.replace(old_func_def, new_func_def)

    # 2. Update snakeState initialization
    old_state = "const snakeState = useRef({ body: [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}], dir: {x: 1, y: 0}, food: {x: 20, y: 15}, lastMove: 0 });"
    new_state = "const snakeState = useRef({ body: [{x: 10, y: 10, color: getRandomSnakeColor()}, {x: 9, y: 10, color: getRandomSnakeColor()}, {x: 8, y: 10, color: getRandomSnakeColor()}], dir: {x: 1, y: 0}, food: {x: 20, y: 15}, lastMove: 0 });"
    content = content.replace(old_state, new_state)

    # 3. Update unshift
    old_unshift = "s.body.unshift({x: nx, y: ny});"
    new_unshift = "s.body.unshift({x: nx, y: ny, color: getRandomSnakeColor()});"
    content = content.replace(old_unshift, new_unshift)

    # 4. Update draw loop
    old_draw = """        // Draw Snake
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

    new_draw = """        // Draw Snake
        const s = snakeState.current;
        s.body.forEach((segment: any) => {
            buffer.writeStr(segment.x, segment.y, '█', segment.color || getRandomSnakeColor());
        });
        buffer.writeStr(s.food.x, s.food.y, '●', '#ffffff');"""
    content = content.replace(old_draw, new_draw)

    with open(path, 'w') as f:
        f.write(content)

rebuild()
print("Done")
