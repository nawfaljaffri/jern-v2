import json
import os
import sys
import time
from google import genai
from google.genai import types

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
client = genai.Client(api_key=api_keys[current_key_idx])
print(f"🔑 Loaded {len(api_keys)} API keys. Starting with Key #{current_key_idx + 1}...")

def get_next_client():
    global current_key_idx, client
    current_key_idx = (current_key_idx + 1) % len(api_keys)
    print(f"🔄 Switching to API Key #{current_key_idx + 1}...")
    client = genai.Client(api_key=api_keys[current_key_idx])
    return client

def process_batch(batch: list) -> list:
    global client
    batch_dict = {w["id"]: w for w in batch}
    expected_ids = set(batch_dict.keys())
    
    # Format prompt using lightweight pipe format
    prompt = "Please clean the following dictionary entries according to the system instructions. Output ONLY raw pipe-delimited lines in the format id|original|romanized|definition.\n\n"
    for w in batch:
        prompt += f"{w['id']}|{w['original']}|{w['romanized']}|{w['definition']}\n"
    
    retries = len(api_keys) * 3
    for attempt in range(retries):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=(
                        "You are an expert French linguist and dictionary editor. "
                        "Your task is to take a raw list of pipe-delimited French dictionary entries (id|original|romanized|definition) and clean them. "
                        "Rules:\n"
                        "1. Simplify Phrases: If 'original' is a sentence or phrase, reduce it to the single core French word that matches 'definition'.\n"
                        "2. Fix Orthography: Ensure 'original' and 'romanized' have correct standard French spelling and accents (e.g., 'être', 'écho'). For French, 'romanized' should match 'original' exactly.\n"
                        "3. Align Definitions: Ensure 'definition' is a clean, single primary English meaning.\n"
                        "4. DO NOT change the 'id' field. It must match the input exactly.\n"
                        "5. Output ONLY raw text lines formatted exactly as: id|original|romanized|definition\n"
                        "6. Do NOT include markdown formatting (no ```). Do not include any intro or outro text. Every single line must be a valid pipe-delimited entry."
                    ),
                    temperature=0.1
                )
            )
            
            # Parse response
            lines = response.text.strip().split("\n")
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
                            "language": orig_item.get("language", "fr"),
                            "frequency": orig_item.get("frequency", 0)
                        })
                        seen_ids.add(wid)
            
            missing_ids = expected_ids - seen_ids
            if missing_ids and attempt < retries - 1:
                print(f"Attempt {attempt+1}: Missing {len(missing_ids)} words in output. Retrying...")
                time.sleep(2)
                continue
            
            # If we still have missing ids after retries, keep the original for those missing ids so we never lose data
            for wid in missing_ids:
                cleaned_items.append(batch_dict[wid])
                
            return cleaned_items

        except Exception as e:
            print(f"⚠️ Attempt {attempt+1} failed with Key #{current_key_idx + 1}: {e}")
            if attempt < retries - 1:
                time.sleep(3)
                get_next_client()
            else:
                print("❌ All retry attempts failed across all keys for this batch. Exiting to prevent dirty data saving.")
                sys.exit(1)

def main():
    input_file = "public/data/fr.json"
    output_file = "public/data/fr_cleaned.json"

    if not os.path.exists(input_file):
        print(f"Error: {input_file} does not exist.")
        sys.exit(1)

    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Filter out header row if present
    data = [w for w in data if not (w["original"] == "fr" and w["definition"] == "en")]

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
