import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# Fix offsetY in drawCanvas
content = re.sub(
    r'const offsetY = Math\.max\(0, Math\.floor\(\(ROWS - 30\) / 2\)\);',
    r'const offsetY = 2;',
    content
)

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)

print("Patch 17 applied.")
