import json
import os
import subprocess

transcript = '/Users/nawfaljaffri/.gemini/antigravity/brain/d1779a0d-c479-4aab-aa79-94491a2dc842/.system_generated/logs/transcript.jsonl'

subprocess.run(['git', 'checkout', '74263cd', 'app/coding/page.tsx'], check=True)

def apply_edit(old, new):
    with open('app/coding/page.tsx', 'r') as f:
        content = f.read()
    if old in content:
        content = content.replace(old, new)
        with open('app/coding/page.tsx', 'w') as f:
            f.write(content)
        return True
    return False

with open(transcript, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
        except:
            continue
            
        step = data.get('step_index')
        if step > 3257:
            break
            
        tc = data.get('tool_calls', [])
        for call in tc:
            name = call.get('name')
            args = call.get('args', {})
            
            if name == 'replace_file_content':
                target = args.get('TargetFile', '')
                if 'app/coding/page.tsx' in target:
                    old = args.get('TargetContent', '')
                    new = args.get('ReplacementContent', '')
                    if apply_edit(old, new):
                        print(f"Applied replace {step}")
                    else:
                        print(f"FAILED replace {step}")
                        
            elif name == 'multi_replace_file_content':
                target = args.get('TargetFile', '')
                if 'app/coding/page.tsx' in target:
                    chunks = args.get('ReplacementChunks', [])
                    for chunk in chunks:
                        old = chunk.get('TargetContent', '')
                        new = chunk.get('ReplacementContent', '')
                        if apply_edit(old, new):
                            print(f"Applied multi_replace {step}")
                        else:
                            print(f"FAILED multi_replace {step}")

            elif name == 'run_command':
                cmd = args.get('CommandLine', '')
                if 'app/coding/page.tsx' in cmd and ('sed' in cmd or 'python3' in cmd or '>' in cmd):
                    print(f"Running command {step}")
                    cwd = args.get('Cwd', '/Users/nawfaljaffri/.gemini/antigravity/scratch/jern/portfolionawf')
                    # Run the command exactly as it was!
                    subprocess.run(cmd, shell=True, cwd=cwd)

print("Replay finished")
