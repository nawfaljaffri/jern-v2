import json

transcript_path = '/Users/nawfaljaffri/.gemini/antigravity/brain/d1779a0d-c479-4aab-aa79-94491a2dc842/.system_generated/logs/transcript.jsonl'

page_content = None

with open(transcript_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
        except:
            continue
            
        time_str = data.get('created_at', '')
        if time_str > '2026-06-07T01:56:00Z':
            break
            
        # We can also capture full file views from the user or tool outputs!
        if data.get('type') == 'VIEW_FILE' and data.get('source') == 'MODEL' and 'page.tsx' in data.get('content', ''):
            pass # Maybe not reliable if partial
            
        tc = data.get('tool_calls', [])
        if tc:
            for call in tc:
                name = call.get('name')
                args = call.get('args', {})
                if name == 'write_to_file' and 'app/coding/page.tsx' in args.get('TargetFile', ''):
                    page_content = args.get('CodeContent', '')
                elif name == 'run_command':
                    cmd = args.get('CommandLine', '')
                    if "cat << 'EOF' > get_target.py" in cmd:
                        pass
        
        # If the system returned the file content via view_file or grep_search we can't easily reconstruct if it's partial.
        # Let's rely on finding the exact script that did the replacement or the last time we wrote it.

# If we don't have a recent write_to_file, we need to extract from local file backups if possible.
print(f"Content length: {len(page_content) if page_content else 0}")
if page_content:
    with open('page_555am.tsx', 'w') as out:
        out.write(page_content)

