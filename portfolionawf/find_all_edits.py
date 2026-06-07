import json

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
            
        content = data.get('content', '')
        tc = data.get('tool_calls', [])
        
        has_edit = False
        if tc:
            for call in tc:
                name = call.get('name')
                if name in ['replace_file_content', 'multi_replace_file_content', 'write_to_file', 'run_command']:
                    args = call.get('args', {})
                    if 'page.tsx' in str(args):
                        has_edit = True
        
        if has_edit:
             edits.append({
                'time': time_str,
                'step': data.get('step_index'),
                'type': 'TOOL_CALL_EDIT_OR_CMD'
             })

print(f"Found {len(edits)} relevant edit steps today.")
for e in edits:
    print(f"Step {e['step']} at {e['time']}")
