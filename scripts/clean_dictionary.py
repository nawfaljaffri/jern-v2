import json
import os
import sys
import time
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from typing import List

# Setup Gemini API
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    print("Error: GEMINI_API_KEY environment variable not set.")
    sys.exit(1)

client = genai.Client(api_key=api_key)

class CleanedWord(BaseModel):
    id: str
    original: str = Field(description="The cleaned Arabic word")
    romanized: str = Field(description="The cleaned standard modern English transliteration")
    definition: str = Field(description="The cleaned, simple English definition")
    language: str
    frequency: int

class CleanedWordList(BaseModel):
    words: list[CleanedWord]

def process_batch(batch: list) -> list:
    prompt = "Please clean the following list of dictionary entries:\n\n"
    prompt += json.dumps(batch, ensure_ascii=False, indent=2)
    
    retries = 3
    for attempt in range(retries):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-pro",
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=(
                        "You are an expert Arabic linguist and dictionary editor. "
                        "Your task is to take a list of raw Arabic words, romanizations, and definitions, and clean them. "
                        "Rules:\n"
                        "1. Simplify Phrases: If 'original' is a sentence or phrase, reduce it to the single core Arabic word that matches 'definition'.\n"
                        "2. Fix Transliterations: Ensure 'romanized' reflects the standard modern English phonetic pronunciation (e.g., 'sh' instead of 'š', 'kh' instead of 'x').\n"
                        "3. Align Definitions: Ensure 'definition' is a clean, single primary meaning.\n"
                        "4. DO NOT change the 'id' or 'frequency' fields. They must match the input exactly.\n"
                        "5. Output ONLY valid JSON."
                    ),
                    response_mime_type="application/json",
                    response_schema=CleanedWordList,
                    temperature=0.1
                )
            )
            # Parse the response
            result = json.loads(response.text)
            return result.get("words", [])
        except Exception as e:
            print(f"Attempt {attempt+1} failed: {e}")
            time.sleep(2)
    print("Failed to process batch.")
    return batch # return original if failed

def main():
    input_file = "public/data/ar.json"
    output_file = "public/data/ar_cleaned.json"

    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Loaded {len(data)} words. Checking for duplicates...")
    
    # 1. Merge duplicates
    unique_words = {}
    for w in data:
        key = (w["original"].strip(), w["definition"].strip().lower())
        if key in unique_words:
            # Duplicate found, keep the one with higher frequency or merge
            existing = unique_words[key]
            existing["frequency"] = max(existing.get("frequency", 0), w.get("frequency", 0))
        else:
            unique_words[key] = w
            
    deduped_data = list(unique_words.values())
    print(f"Removed {len(data) - len(deduped_data)} duplicates. Remaining: {len(deduped_data)} words.")

    batch_size = 220
    cleaned_data = []
    
    print("Starting AI cleanup...")
    for i in range(0, len(deduped_data), batch_size):
        batch = deduped_data[i:i+batch_size]
        print(f"Processing batch {i//batch_size + 1}/{(len(deduped_data) + batch_size - 1)//batch_size}...")
        sys.stdout.flush()
        
        cleaned_batch = process_batch(batch)
        cleaned_data.extend(cleaned_batch)
        
        # Save progress incrementally just in case
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(cleaned_data, f, ensure_ascii=False, indent=2)
            
        time.sleep(4) # rate limit mitigation

    print(f"Finished cleaning. Saved {len(cleaned_data)} words to {output_file}.")

if __name__ == "__main__":
    main()
