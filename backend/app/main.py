from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models import ProtoLanguage
from typing import List, Dict

app = FastAPI(title="LinguaEvo API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "alive", "message": "LinguaEvo backend is running!"}

def is_vowel(char: str) -> bool:
    vowels = set("aeiouɑɛɪɔʊə")
    return char.lower() in vowels

def apply_sound_changes(word: str, rules: List[Dict]) -> str:
    result = word
    for rule in rules:
        before = rule.get("before", "")
        after = rule.get("after", "")
        env = rule.get("environment")

        if not before or not after:
            continue

        if not env:
            # Simple replacement
            result = result.replace(before, after)
            continue

        # Environment-aware replacement
        new_result = ""
        i = 0
        while i < len(result):
            if result[i:i + len(before)] == before:
                match = True
                
                if env == "_V":  # before vowel
                    if i + len(before) >= len(result) or not is_vowel(result[i + len(before)]):
                        match = False
                elif env == "V_":  # after vowel
                    if i == 0 or not is_vowel(result[i - 1]):
                        match = False
                
                if match:
                    new_result += after
                    i += len(before)
                    continue
            
            new_result += result[i]
            i += 1
        
        result = new_result
    return result

@app.post("/api/proto/create")
async def create_proto_language(proto: ProtoLanguage):
    # For now we evolve from original every time
    # In next step we'll support evolving from previous state
    evolved_vocab = []
    for word in proto.vocabulary:
        evolved_form = apply_sound_changes(word.form, [r.model_dump() for r in proto.rules])
        evolved_vocab.append({
            "original": word.form,
            "evolved": evolved_form,
            "meaning": word.meaning
        })

    return {
        "status": "success",
        "message": f"Language '{proto.name}' evolved successfully.",
        "proto_name": proto.name,
        "evolved_vocabulary": evolved_vocab,
        "generation": 1   # We'll improve this in next step
    }