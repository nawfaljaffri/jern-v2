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

def process_batch(batch: list) -> dict:
    global current_key_idx
    batch_dict = {w["original"].strip(): w for w in batch}
    expected_words = set(batch_dict.keys())
    
    prompt = "Please generate deep dictionary profiles for the following German words. Output ONLY raw pipe-delimited lines in the format original|definition|grammar_tag|syllables|root_letters|root_meaning.\n\n"
    for w in batch:
        prompt += f"{w['original'].strip()}|{w['romanized'].strip()}|{w['definition'].strip()}\n"
    
    retries = 50
    for attempt in range(retries):
        try:
            api_key = api_keys[current_key_idx]
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
            
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "systemInstruction": {
                    "parts": [{"text": (
                        "You are an expert German linguist and master dictionary editor for a premium language learning application. "
                        "Your task is to take a raw list of German words with their short translation (original|romanized|translation) "
                        "and output a deep, elegant, highly concise dictionary profile for each word.\n\n"
                        "Rules for each field:\n"
                        "1. definition: A crisp, professional 1-to-2 sentence encyclopedic definition of the word in English (maximum 20-25 words). Zero fluff.\n"
                        "2. grammar_tag: Strictly the capitalized core part of speech (e.g., Noun, Verb, Adjective, Preposition, Pronoun, Adverb, Conjunction).\n"
                        "3. syllables: A clean, hyphenated phonetic syllable breakdown (e.g., spre - chen, ar - bei - ten).\n"
                        "4. root_letters: The Proto-Germanic, Old High German, or base etymological root word (e.g., P.Gmc: *sprekan, OHG: wizzan). If not applicable, output N/A or the base root.\n"
                        "5. root_meaning: A punchy 3-to-5 word summary of the root's original meaning (e.g., to speak, to know). If root_letters is N/A, output N/A.\n\n"
                        "CRITICAL OUTPUT FORMAT:\n"
                        "Output ONLY raw pipe-delimited lines formatted exactly as: original|definition|grammar_tag|syllables|root_letters|root_meaning\n"
                        "Do NOT include markdown formatting (no ```). Do not include any intro or outro text. Every single line must be a valid pipe-delimited entry matching the exact 'original' word passed in."
                    )}]
                },
                "generationConfig": {
                    "temperature": 0.1
                }
            }
            
            # Use strict 90 second timeout on socket connection and read
            response = requests.post(url, json=payload, headers={'Content-Type': 'application/json'}, timeout=90.0)
            
            if response.status_code != 200:
                raise Exception(f"API Error {response.status_code}: {response.text}")
                
            res_json = response.json()
            try:
                response_text = res_json['candidates'][0]['content']['parts'][0]['text']
            except (KeyError, IndexError):
                raise Exception(f"Unexpected response structure: {res_json}")
            
            lines = response_text.strip().split("\n")
            cleaned_items = {}
            
            for line in lines:
                line = line.strip()
                if not line or line.startswith("```"):
                    continue
                parts = line.split("|")
                if len(parts) >= 6:
                    original = parts[0].strip()
                    definition = parts[1].strip()
                    grammar_tag = parts[2].strip()
                    syllables = parts[3].strip()
                    root_letters = parts[4].strip()
                    root_meaning = "|".join(parts[5:]).strip()
                    
                    if original in batch_dict and original not in cleaned_items:
                        cleaned_items[original] = {
                            "definition": definition,
                            "grammar_tag": grammar_tag,
                            "syllables": syllables,
                            "root_letters": root_letters,
                            "root_meaning": root_meaning
                        }
            
            missing_words = expected_words - set(cleaned_items.keys())
            if missing_words:
                print(f"Batch completed with {len(missing_words)} missing words. Falling back to default profiles.")
            
            for orig in missing_words:
                orig_data = batch_dict[orig]
                cleaned_items[orig] = {
                    "definition": orig_data.get("definition", "Definition not available."),
                    "grammar_tag": "Word",
                    "syllables": orig_data.get("original", orig),
                    "root_letters": "N/A",
                    "root_meaning": "N/A"
                }
                
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
    input_file = "public/data/de_cleaned.json"
    output_file = "public/data/de_dictionary.json"

    if not os.path.exists(input_file):
        print(f"Error: {input_file} does not exist.")
        sys.exit(1)

    with open(input_file, "r", encoding="utf-8") as f:
        cleaned_words = json.load(f)

    print(f"Loaded {len(cleaned_words)} verified words from {input_file}.")
    
    dictionary_data = {}
    if os.path.exists(output_file):
        try:
            with open(output_file, "r", encoding="utf-8") as f:
                dictionary_data = json.load(f)
            print(f"Found existing {output_file} with {len(dictionary_data)} dictionary entries. Resuming...")
        except Exception as e:
            print(f"Error reading existing {output_file}: {e}. Starting fresh.")
            dictionary_data = {}

    remaining_words = [w for w in cleaned_words if w["original"].strip() not in dictionary_data]

    print(f"Already processed: {len(dictionary_data)} words. Remaining to generate: {len(remaining_words)} words.")

    if not remaining_words:
        print("All dictionary profiles have already been generated! Nothing left to do.")
        sys.exit(0)

    batch_size = 50 
    total_batches = (len(remaining_words) + batch_size - 1) // batch_size
    
    print(f"Starting generation in {total_batches} batches (batch size: {batch_size})...")
    
    for i in range(0, len(remaining_words), batch_size):
        batch = remaining_words[i:i+batch_size]
        current_batch_num = i // batch_size + 1
        print(f"Processing batch {current_batch_num}/{total_batches} (Words {i+1} to {min(i+batch_size, len(remaining_words))})...")
        sys.stdout.flush()
        
        new_entries = process_batch(batch)
        dictionary_data.update(new_entries)
        
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(dictionary_data, f, ensure_ascii=False, indent=2)
            
        print(f"Batch {current_batch_num} saved successfully. Total dictionary entries so far: {len(dictionary_data)}")
        sys.stdout.flush()
        time.sleep(4) 

    print(f"Finished generating all dictionary profiles. Saved {len(dictionary_data)} entries to {output_file}.")

if __name__ == "__main__":
    main()
