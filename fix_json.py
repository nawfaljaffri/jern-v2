import json
import re

def fix_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    initial_len = len(data)
    # Remove any word whose original contains English alphabet letters
    filtered = [w for w in data if not re.search(r'[a-zA-Z]', w.get('original', ''))]
    
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(filtered, f, ensure_ascii=False, indent=2)
    print(f"{path}: removed {initial_len - len(filtered)} words")

fix_file('public/data/ar.json')
fix_file('public/data/ur.json')
