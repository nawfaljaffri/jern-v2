with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'const drawScrollbar = (x, y, h, contentLines, offset, viewLines) => {',
    'const drawScrollbar = (x: any, y: any, h: any, contentLines: any, offset: any, viewLines: any) => {'
)
content = content.replace(
    'node.content.forEach((line, i) => {',
    'node.content.forEach((line: any, i: any) => {'
)
content = content.replace(
    'node.children.forEach((proj, i) => {',
    'node.children.forEach((proj: any, i: any) => {'
)

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)

print("TS fixed.")
