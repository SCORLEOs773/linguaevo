from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models import ProtoLanguage
from typing import List, Dict
import os

app = FastAPI(title="LinguaEvo API", version="0.3.0")

FRONTEND_URL = os.getenv("https://linguaevo.netlify.app", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "alive"}

def is_vowel(char: str) -> bool:
    vowels = set("aeiouɑɛɪɔʊə")
    return char.lower() in vowels

def apply_sound_changes(word: str, rules: List[Dict], passes: int = 1) -> str:
    result = word
    for _ in range(passes):                     # ← Multi-pass loop
        for rule in rules:
            before = rule.get("before", "")
            after = rule.get("after", "")
            env = rule.get("environment")
            if not before or not after:
                continue

            new_result = ""
            i = 0
            while i < len(result):
                if result[i:i + len(before)] == before:
                    match = True
                    if env == "_V" and (i + len(before) >= len(result) or not is_vowel(result[i + len(before)])):
                        match = False
                    elif env == "V_" and (i == 0 or not is_vowel(result[i-1])):
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
async def create_proto_language(proto: ProtoLanguage, passes: int = 3):
    evolved_vocab = []
    for word in proto.vocabulary:
        evolved_form = apply_sound_changes(word.form, [r.model_dump() for r in proto.rules], passes)
        evolved_vocab.append({
            "original": word.form,
            "evolved": evolved_form,
            "meaning": word.meaning
        })

    return {
        "status": "success",
        "message": f"Language evolved over {passes} passes.",
        "evolved_vocabulary": evolved_vocab
    }