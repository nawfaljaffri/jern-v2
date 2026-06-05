import sys

# Read the task file
with open('/Users/nawfaljaffri/.gemini/antigravity/brain/d1779a0d-c479-4aab-aa79-94491a2dc842/task.md', 'r') as f:
    task_content = f.read()

# Replace [/] with [x]
task_content = task_content.replace('[/] Fix Matrix/Snow rendering order', '[x] Fix Matrix/Snow rendering order')
task_content = task_content.replace('[/] Fix Playable Snake rendering order', '[x] Fix Playable Snake rendering order')
task_content = task_content.replace('[/] Fully remove Disco easter egg', '[x] Fully remove Disco easter egg')

with open('/Users/nawfaljaffri/.gemini/antigravity/brain/d1779a0d-c479-4aab-aa79-94491a2dc842/task.md', 'w') as f:
    f.write(task_content)

