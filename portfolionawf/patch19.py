import re

with open('app/coding/page.tsx', 'r') as f:
    content = f.read()

# 1. We will use string slicing to extract the items.
start_idx = content.find("const DIRECTORY: any[] = [\n") + len("const DIRECTORY: any[] = [\n")
end_idx = content.find("\n];", start_idx)
if end_idx == -1:
    end_idx = content.find("];", start_idx)

directory_inner = content[start_idx:end_idx]

# A very basic parser to split the 5 items
items = []
current_item = ""
brace_count = 0
for char in directory_inner:
    current_item += char
    if char == '{':
        brace_count += 1
    elif char == '}':
        brace_count -= 1
        if brace_count == 0:
            # We found a complete item
            # We might have a trailing comma, but we'll clean it up
            items.append(current_item.strip().rstrip(','))
            current_item = ""

# Identify items
about_item = None
exp_item = None
proj_item = None
art_item = None
contact_item = None

for item in items:
    if "01. ABOUT" in item:
        about_item = item.replace("01. ABOUT", "03. ABOUT")
    elif "02. EXPERIENCE" in item:
        exp_item = item
    elif "03. PROJECTS" in item:
        proj_item = item.replace("03. PROJECTS", "01. PROJECTS")
    elif "04. ARTWORKS" in item:
        art_item = item
    elif "05. CONTACT" in item:
        contact_item = item

new_inner = ",\n".join([proj_item, exp_item, about_item, art_item, contact_item])

content = content[:start_idx] + new_inner + "\n" + content[end_idx:]

with open('app/coding/page.tsx', 'w') as f:
    f.write(content)

print("Patch 19 applied.")
