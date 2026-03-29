from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models import ProtoLanguage

app = FastAPI(title="LinguaEvo API", version="0.1.0")

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

# Simple sound change applicator
def apply_sound_changes(word: str, rules: list) -> str:
    result = word
    for rule in rules:
        before = rule.before
        after = rule.after
        # Very basic replacement for now (we'll improve it later)
        if before in result:
            result = result.replace(before, after)
    return result

@app.post("/api/proto/create")
async def create_proto_language(proto: ProtoLanguage):
    # Apply basic evolution to vocabulary
    evolved_vocab = []
    for word in proto.vocabulary:
        evolved_form = apply_sound_changes(word.form, proto.rules)
        evolved_vocab.append({
            "original": word.form,
            "evolved": evolved_form,
            "meaning": word.meaning
        })

    return {
        "status": "success",
        "message": f"Proto-language '{proto.name}' created and evolved with {len(proto.rules)} rules.",
        "proto": proto,
        "evolved_vocabulary": evolved_vocab
    }

@app.get("/api/simulator/status")
async def simulator_status():
    return {"simulator": "ready"}