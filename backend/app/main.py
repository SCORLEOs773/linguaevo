from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="LinguaEvo API",
    description="Evolutionary Language Simulator Backend",
    version="0.1.0"
)

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],   # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {
        "status": "alive",
        "message": "LinguaEvo backend is running! Ready for language evolution."
    }

# Future simulation endpoint (stub for now)
@app.get("/api/simulator/status")
async def simulator_status():
    return {"simulator": "ready", "message": "Evolution engine loaded (stub)"}