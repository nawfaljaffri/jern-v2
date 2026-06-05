import sys

with open('app/coding/page.tsx', 'r') as f:
    text = f.read()

text = text.replace(r'\`', '`')
text = text.replace(r'\${', '${')

with open('app/coding/page.tsx', 'w') as f:
    f.write(text)
