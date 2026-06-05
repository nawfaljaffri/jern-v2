import sys

with open('app/coding/page.tsx', 'r') as f:
    text = f.read()

lines = text.split('\n')
stack = []
for i, line in enumerate(lines):
    if i < 280:
        continue
    # crude brace counter ignoring strings
    in_str = False
    str_char = ''
    esc = False
    for j, c in enumerate(line):
        if esc:
            esc = False
            continue
        if c == '\\\\':
            esc = True
            continue
        if c in ['\"', '\'', '\`']:
            if not in_str:
                in_str = True
                str_char = c
            elif c == str_char:
                in_str = False
        if not in_str:
            if c == '{':
                stack.append((i+1, j+1))
            elif c == '}':
                if stack:
                    stack.pop()
                else:
                    print(f"EXTRA }} AT LINE {i+1}: {line}")
    if i > 710 and i <= 720:
        print(f"{i+1} (depth {len(stack)}): {line}")

print(f"Final depth: {len(stack)}")
if stack:
    print(f"First unclosed at: {stack[0]}")
