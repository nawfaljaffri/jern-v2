with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

import re
match = re.search(r'const DIRECTORY: any\[\] = \[.*?\];', content, re.DOTALL)
if match:
    print(match.group(0))
