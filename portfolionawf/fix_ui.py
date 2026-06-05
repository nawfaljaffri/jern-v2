import sys

def fix_page():
    path = 'app/coding/page.tsx'
    with open(path, 'r') as f:
        content = f.read()
    
    # 1. Fix snake initialization to be horizontal
    old_snake = "const snakeState = useRef({ body: [{x: 10, y: 10}, {x: 10, y: 11}, {x: 10, y: 12}], dir: {x: 1, y: 0}, food: {x: 20, y: 15}, lastMove: 0 })"
    new_snake = "const snakeState = useRef({ body: [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}], dir: {x: 1, y: 0}, food: {x: 20, y: 15}, lastMove: 0 })"
    content = content.replace(old_snake, new_snake)

    # 2. Fix Logo to NAWFAL JAFFRI
    old_logo = """        const logoLines = [
          "      ██╗███████╗██████╗ ███╗   ██╗",
          "      ██║██╔════╝██╔══██╗████╗  ██║",
          "      ██║█████╗  ██████╔╝██╔██╗ ██║",
          " ██   ██║██╔══╝  ██╔══██╗██║╚██╗██║",
          " ███████║███████╗██║  ██║██║ ╚████║",
          " ╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝"
        ];"""
    
    new_logo = """        const logoLines = [
            "███╗   ██╗ █████╗ ██╗    ██╗███████╗ █████╗ ██╗         ██╗ █████╗ ███████╗███████╗██████╗ ██╗",
            "████╗  ██║██╔══██╗██║    ██║██╔════╝██╔══██╗██║         ██║██╔══██╗██╔════╝██╔════╝██╔══██╗██║",
            "██╔██╗ ██║███████║██║ █╗ ██║█████╗  ███████║██║         ██║███████║█████╗  █████╗  ██████╔╝██║",
            "██║╚██╗██║██╔══██║██║███╗██║██╔══╝  ██╔══██║██║    ██   ██║██╔══██║██╔══╝  ██╔══╝  ██╔══██╗██║",
            "██║ ╚████║██║  ██║╚███╔███╔╝██║     ██║  ██║███████╗╚█████╔╝██║  ██║██║    ██║     ██║  ██║██║",
            "╚═╝  ╚═══╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝     ╚═╝  ╚═╝╚══════╝ ╚════╝ ╚═╝  ╚═╝╚═╝    ╚═╝     ╚═╝  ╚═╝╚═╝"
        ];"""
    content = content.replace(old_logo, new_logo)

    # 3. Fix the h-screen to h-[100dvh]
    content = content.replace(
        '<div className="w-screen h-screen bg-black flex items-center justify-center overflow-hidden">',
        '<div className="w-screen h-[100dvh] bg-black flex items-center justify-center overflow-hidden">'
    )

    # 4. Fix the input jump issue by absolutely centering it in a fixed position
    content = content.replace(
        'className="absolute opacity-0 pointer-events-none"',
        'className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 pointer-events-none"'
    )

    with open(path, 'w') as f:
        f.write(content)

fix_page()
print("Fixed.")
