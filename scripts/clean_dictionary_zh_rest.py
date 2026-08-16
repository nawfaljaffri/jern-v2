import json
import os
import sys
import time
import requests

# Setup Gemini API Keys
raw_keys = os.environ.get("GEMINI_API_KEY", "")
if not raw_keys:
    print("Error: GEMINI_API_KEY environment variable not set.")
    sys.exit(1)

api_keys = [k.strip() for k in raw_keys.split(",") if k.strip()]
if not api_keys:
    print("Error: No valid API keys found in GEMINI_API_KEY.")
    sys.exit(1)

current_key_idx = 0
print(f"🔑 Loaded {len(api_keys)} API keys. Starting with Key #{current_key_idx + 1}...")

def get_next_key():
    global current_key_idx
    current_key_idx = (current_key_idx + 1) % len(api_keys)
    print(f"🔄 Switching to API Key #{current_key_idx + 1}...")
    return api_keys[current_key_idx]

def process_batch(batch: list) -> list:
    global current_key_idx
    batch_dict = {w["id"]: w for w in batch}
    expected_ids = set(batch_dict.keys())
    
    # Format prompt using lightweight pipe format
    prompt = "Please clean and process the following batch of Chinese vocabulary words. Ensure all orthography (Chinese characters) and definitions are pristine, and romanized is accurate Pinyin. Output ONLY raw pipe-delimited lines in the format id|original|romanized|definition.\n\n"
    for w in batch:
        prompt += f"{w['id']}|{w['original']}|{w['romanized']}|{w['definition']}\n"
    
    retries = 50
    for attempt in range(retries):
        try:
            api_key = api_keys[current_key_idx]
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
            
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "systemInstruction": {
                    "parts": [{"text": (
                        "You are an expert Chinese linguist and dictionary editor. "
                        "Your task is to take a raw, potentially noisy list of Chinese words and output a perfectly clean, deduped, "
                        "and accurate dictionary list.\n\n"
                        "1. Simplify Phrases: If 'original' is a sentence or phrase, reduce it to the single core Chinese word that matches 'definition'.\n"
                        "2. Ensure the 'romanized' field contains the correct Pinyin.\n"
                        "3. Align Definitions: Ensure 'definition' is a clean, single primary English meaning.\n"
                        "4. DO NOT change the 'id' field. It must match the input exactly.\n"
                        "5. Output ONLY raw text lines formatted exactly as: id|original|romanized|definition\n"
                        "6. Do NOT include markdown formatting (no ```). Do not include any intro or outro text. Every single line must be a valid pipe-delimited entry."
                    )}]
                },
                "generationConfig": {
                    "temperature": 0.1
                }
            }
            
            response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'}, timeout=90.0)
            
            if response.status_code != 200:
                raise Exception(f"API Error {response.status_code}: {response.text}")
                
            res_json = response.json()
            try:
                response_text = res_json['candidates'][0]['content']['parts'][0]['text']
            except (KeyError, IndexError):
                raise Exception(f"Unexpected response structure: {res_json}")
            
            # Parse response
            lines = response_text.strip().split("\n")
            cleaned_items = []
            seen_ids = set()
            
            for line in lines:
                line = line.strip()
                if not line or line.startswith("```"):
                    continue
                parts = line.split("|")
                if len(parts) >= 4:
                    wid = parts[0].strip()
                    original = parts[1].strip()
                    romanized = parts[2].strip()
                    definition = "|".join(parts[3:]).strip() # in case definition had a pipe
                    
                    if wid in batch_dict and wid not in seen_ids:
                        orig_item = batch_dict[wid]
                        cleaned_items.append({
                            "id": wid,
                            "original": original,
                            "romanized": romanized,
                            "definition": definition,
                            "language": orig_item.get("language", "zh"),
                            "frequency": orig_item.get("frequency", 0)
                        })
                        seen_ids.add(wid)
            
            missing_ids = expected_ids - seen_ids
            if missing_ids:
                print(f"Batch completed with {len(missing_ids)} missing words. Falling back to original raw data.")
            
            # Keep the original for those missing ids so we never lose data
            for wid in missing_ids:
                orig_item = batch_dict[wid]
                cleaned_items.append({
                    "id": wid,
                    "original": orig_item.get("original", ""),
                    "romanized": orig_item.get("romanized", ""),
                    "definition": orig_item.get("definition", ""),
                    "language": orig_item.get("language", "zh"),
                    "frequency": orig_item.get("frequency", 0)
                })
                
            return cleaned_items

        except Exception as e:
            error_str = str(e)
            print(f"⚠️ Attempt {attempt+1} failed with Key #{current_key_idx + 1}: {error_str[:200]}")
            if attempt < retries - 1:
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "503" in error_str or "timeout" in error_str.lower() or "read timed out" in error_str.lower():
                    print("Rate limit or service unavailable. Sleeping for 30 seconds before switching keys...")
                    time.sleep(30)
                else:
                    time.sleep(5)
                get_next_key()
            else:
                print("❌ All retry attempts failed. Exiting.")
                sys.exit(1)

def main():
    input_file = "public/data/zh.json"
    output_file = "public/data/zh_cleaned.json"

    if not os.path.exists(input_file):
        print(f"Error: {input_file} does not exist.")
        sys.exit(1)

    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Filter out header row if present
    data = [w for w in data if not (w["original"] == "zh" and w["definition"] == "en")]

    print(f"Loaded {len(data)} words from {input_file}. Checking for duplicates...")
    
    # 1. Merge duplicates
    unique_words = {}
    for w in data:
        key = (w["original"].strip().lower(), w["definition"].strip().lower())
        if key in unique_words:
            existing = unique_words[key]
            existing["frequency"] = max(existing.get("frequency", 0), w.get("frequency", 0))
        else:
            unique_words[key] = w
            
    deduped_data = list(unique_words.values())
    print(f"Removed {len(data) - len(deduped_data)} duplicates. Total unique words: {len(deduped_data)}")

    # 2. Check existing progress for seamless resume
    cleaned_data = []
    if os.path.exists(output_file):
        try:
            with open(output_file, "r", encoding="utf-8") as f:
                cleaned_data = json.load(f)
            print(f"Found existing {output_file} with {len(cleaned_data)} words. Resuming...")
        except Exception as e:
            print(f"Error reading existing {output_file}: {e}. Starting fresh.")
            cleaned_data = []

    processed_ids = {w["id"] for w in cleaned_data}
    remaining_words = [w for w in deduped_data if w["id"] not in processed_ids]

    print(f"Already processed: {len(processed_ids)} words. Remaining to process: {len(remaining_words)} words.")

    if not remaining_words:
        print("All words have already been cleaned! Nothing left to do.")
        sys.exit(0)

    batch_size = 200 # Conservative batch size to guarantee 100% full recall
    total_batches = (len(remaining_words) + batch_size - 1) // batch_size
    
    print(f"Starting AI cleanup in {total_batches} batches (batch size: {batch_size})...")
    
    for i in range(0, len(remaining_words), batch_size):
        batch = remaining_words[i:i+batch_size]
        current_batch_num = i // batch_size + 1
        print(f"Processing batch {current_batch_num}/{total_batches} (Words {i+1} to {min(i+batch_size, len(remaining_words))})...")
        sys.stdout.flush()
        
        cleaned_batch = process_batch(batch)
        cleaned_data.extend(cleaned_batch)
        
        # Save progress instantly after every batch so nothing is ever lost
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(cleaned_data, f, ensure_ascii=False, indent=2)
            
        print(f"Batch {current_batch_num} saved successfully. Total cleaned so far: {len(cleaned_data)}")
        sys.stdout.flush()
        time.sleep(4) # Rate limit mitigation

    print(f"Finished cleaning all words. Saved {len(cleaned_data)} words to {output_file}.")

if __name__ == "__main__":
    main()
