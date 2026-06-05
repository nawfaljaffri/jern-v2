import sys

with open('app/coding/page.tsx', 'r') as f:
    text = f.read()

lines = text.split('\n')
stack = []
for i, line in enumerate(lines):
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
        if c in ['\"', '\'', '`']:
            if not in_str:
                in_str = True
                str_char = c
            elif c == str_char:
                in_str = False
        if not in_str:
            if c == '{':
                stack.append(i+1)
            elif c == '}':
                if stack:
                    stack.pop()
                else:
                    print(f"EXTRA }} at line {i+1}")
    if i+1 == 715:
        print(f"Stack at 715: {stack}")
print("Final stack:")
print(stack)
