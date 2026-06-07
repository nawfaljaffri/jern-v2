import json

file_path = '/Users/nawfaljaffri/.gemini/antigravity/brain/d1779a0d-c479-4aab-aa79-94491a2dc842/.system_generated/logs/transcript.jsonl'

best_content = None

with open(file_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'PLANNER_RESPONSE':
                # Check tool calls
                for tc in data.get('tool_calls', []):
                    if tc.get('name') == 'run_command':
                        args = tc.get('args', {})
                        cmd = args.get('CommandLine', '')
                        if 'EOF' in cmd and 'app/coding/page.tsx' in cmd and 'new_ascii' in cmd:
                            # print(cmd)
                            pass
            elif data.get('type') == 'TOOL_RESPONSE' and 'app/coding/page.tsx' in str(data):
                content = data.get('content', '')
                if 'File Path: `file:///Users/nawfaljaffri/.gemini/antigravity/scratch/jern/portfolionawf/app/coding/page.tsx`' in content:
                    best_content = content
        except:
            pass

# Write the latest full view_file we found just to see what it has
if best_content:
    with open('best_content.txt', 'w') as f:
        f.write(best_content)
    print("Extracted to best_content.txt")
