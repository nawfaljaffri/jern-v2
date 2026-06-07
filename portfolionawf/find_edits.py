import json
import re

transcript_path = '/Users/nawfaljaffri/.gemini/antigravity/brain/d1779a0d-c479-4aab-aa79-94491a2dc842/.system_generated/logs/transcript.jsonl'

edits = []
with open(transcript_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
        except:
            continue
            
        time_str = data.get('created_at', '')
        if not time_str.startswith('2026-06-07T'):
            continue
            
        # Extract hours
        try:
            hour = int(time_str[11:13])
        except:
            continue
            
        if hour in [1, 2]:
            content = data.get('content', '')
            if 'page.tsx' in content and data.get('source') == 'MODEL' and data.get('type') == 'REPLACE_FILE_CONTENT':
                 edits.append({
                    'time': time_str,
                    'step': data.get('step_index'),
                    'type': data.get('type')
                 })
            if data.get('source') == 'MODEL' and data.get('type') == 'RUN_COMMAND' and 'page.tsx' in content:
                 edits.append({
                    'time': time_str,
                    'step': data.get('step_index'),
                    'type': 'RUN_COMMAND'
                 })

print(f"Found {len(edits)} relevant edit steps between 01:00Z and 02:59Z.")
for e in edits:
    print(f"Step {e['step']} at {e['time']} ({e['type']})")
