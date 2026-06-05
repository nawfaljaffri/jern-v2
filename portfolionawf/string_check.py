import sys

with open('app/coding/page.tsx', 'r') as f:
    text = f.read()

lines = text.split('\n')
for i in range(350, 600):
    if '`' in lines[i]:
        print(f"{i+1}: {lines[i]}")
