import sys

def rebuild():
    path = 'app/coding/page.tsx'
    with open(path, 'r') as f:
        content = f.read()

    # Fix the bootStartRef scope issue
    content = content.replace(
        "const bootStartRef = useRef<number | null>(null);",
        "const bootStartRef = useRef<number>(Date.now());"
    )
    
    # Remove the invalid bootStartRef.current assignment in WebGLTerminalPage
    bad_use_effect = """useEffect(() => {
    bootStartRef.current = Date.now();
    const prev = document.body.style.overflow"""
    good_use_effect = """useEffect(() => {
    const prev = document.body.style.overflow"""
    content = content.replace(bad_use_effect, good_use_effect)

    with open(path, 'w') as f:
        f.write(content)

rebuild()
print("Fixed bootStartRef.")
