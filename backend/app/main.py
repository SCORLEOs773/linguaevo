from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models import ProtoLanguage

app = FastAPI(
    title="LinguaEvo API",
    description="Evolutionary Language Simulator Backend",
    version="0.1.0"
)

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

@app.post("/api/proto/create")
async def create_proto_language(proto: ProtoLanguage):
    # For now we just echo back what we received + a success message
    return {
        "status": "success",
        "message": f"Proto-language '{proto.name}' created with {len(proto.phonemes)} phonemes and {len(proto.vocabulary)} words.",
        "data": proto
    }

@app.get("/api/simulator/status")
async def simulator_status():
    return {"simulator": "ready", "message": "Evolution engine loaded"}