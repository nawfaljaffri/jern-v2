import json
import os
import subprocess

transcript_path = '/Users/nawfaljaffri/.gemini/antigravity/brain/d1779a0d-c479-4aab-aa79-94491a2dc842/.system_generated/logs/transcript.jsonl'

# 1. Reset file to last commit
subprocess.run(['git', 'checkout', '74263cd', 'app/coding/page.tsx'], check=True)
print("Reset page.tsx to 74263cd")

# 2. Parse transcript and apply edits
with open(transcript_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
        except:
            continue
            
        step = data.get('step_index')
        if step > 3257:
            break
            
        tc = data.get('tool_calls', [])
        if not tc:
            continue
            
        for call in tc:
            name = call.get('name')
            args = call.get('args', {})
            
            if name == 'write_to_file':
                target = args.get('TargetFile', '').strip('"')
                if 'app/coding/page.tsx' in target:
                    content = args.get('CodeContent', '')
                    # Unescape content if needed? No, json.loads handles it.
                    if isinstance(content, str) and content.startswith('"') and content.endswith('"'):
                        content = json.loads(content)
                    with open(target, 'w') as out:
                        out.write(content)
                    print(f"Applied write_to_file at step {step}")
            
            elif name == 'replace_file_content':
                target = args.get('TargetFile', '').strip('"')
                if 'app/coding/page.tsx' in target:
                    old_c = args.get('TargetContent', '')
                    new_c = args.get('ReplacementContent', '')
                    if isinstance(old_c, str) and old_c.startswith('"') and old_c.endswith('"'):
                        try:
                            old_c = json.loads(old_c)
                            new_c = json.loads(new_c)
                        except: pass
                    with open(target, 'r') as inFile:
                        file_data = inFile.read()
                    file_data = file_data.replace(old_c, new_c)
                    with open(target, 'w') as out:
                        out.write(file_data)
                    print(f"Applied replace_file_content at step {step}")
                    
            elif name == 'multi_replace_file_content':
                target = args.get('TargetFile', '').strip('"')
                if 'app/coding/page.tsx' in target:
                    chunks = args.get('ReplacementChunks', [])
                    if isinstance(chunks, str):
                        try: chunks = json.loads(chunks)
                        except: pass
                    with open(target, 'r') as inFile:
                        file_data = inFile.read()
                    for chunk in chunks:
                        old_c = chunk.get('TargetContent', '')
                        new_c = chunk.get('ReplacementContent', '')
                        file_data = file_data.replace(old_c, new_c)
                    with open(target, 'w') as out:
                        out.write(file_data)
                    print(f"Applied multi_replace_file_content at step {step}")
                    
            elif name == 'run_command':
                cmd = args.get('CommandLine', '').strip('"')
                if 'app/coding/page.tsx' in cmd or 'python3 ' in cmd or 'sed ' in cmd or 'EOF' in cmd:
                    cwd = args.get('Cwd', '/Users/nawfaljaffri/.gemini/antigravity/scratch/jern/portfolionawf').strip('"')
                    if 'grep' not in cmd and ('python3' in cmd or 'sed' in cmd or '>' in cmd):
                        print(f"Running command at step {step}")
                        if "\\n" in cmd and not cmd.startswith("cat << 'EOF'"): 
                             cmd = json.loads('"' + cmd + '"') # naive unescape
                        try:
                            subprocess.run(cmd, shell=True, cwd=cwd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                        except Exception as e:
                            print(f"Error running cmd at step {step}: {e}")

print("Rebuild complete!")
