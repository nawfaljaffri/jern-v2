import json

transcript_path = '/Users/nawfaljaffri/.gemini/antigravity/brain/d1779a0d-c479-4aab-aa79-94491a2dc842/.system_generated/logs/transcript.jsonl'

last_content = None

with open(transcript_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
        except:
            continue
            
        time_str = data.get('created_at', '')
        if time_str > '2026-06-07T01:56:00Z':
            break
            
        tc = data.get('tool_calls', [])
        if tc:
            for call in tc:
                name = call.get('name')
                args = call.get('args', {})
                if 'page.tsx' in str(args):
                    if name == 'write_to_file' and 'app/coding/page.tsx' in args.get('TargetFile', ''):
                        last_content = args.get('CodeContent', '')
                    elif name == 'replace_file_content' and 'app/coding/page.tsx' in args.get('TargetFile', ''):
                        # Not a full replace, but maybe we can just find a VIEW_FILE response or the last full file write!
                        pass

# Print the last 100 chars to verify we have something
if last_content:
    print("Found a full write_to_file!")
    print(last_content[-100:])
    with open('page_555am.tsx', 'w') as out:
        out.write(last_content)
else:
    print("No full write_to_file found before 01:56Z.")
