import json

transcript_path = '/Users/nawfaljaffri/.gemini/antigravity/brain/d1779a0d-c479-4aab-aa79-94491a2dc842/.system_generated/logs/transcript.jsonl'

versions = []
with open(transcript_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
        except:
            continue
            
        time_str = data.get('created_at', '')
        
        # We look for view_file output, or any output containing "const DIRECTORY: any[] = ["
        content = data.get('content', '')
        if 'const DIRECTORY: any[] = [' in content:
            if '05. CONTACT' in content or 'ARTWORKS' in content:
                versions.append({
                    'time': time_str,
                    'step': data.get('step_index'),
                    'type': data.get('type'),
                    'content_snippet': content[:200].replace('\n', ' ')
                })

print(f"Found {len(versions)} relevant steps.")
for v in versions[-10:]:
    print(f"Step {v['step']} at {v['time']} ({v['type']})")
