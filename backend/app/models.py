from pydantic import BaseModel
from typing import List, Dict, Optional

class Phoneme(BaseModel):
    symbol: str
    category: str  # "consonant" or "vowel"

class Word(BaseModel):
    form: str
    meaning: str

class SoundChangeRule(BaseModel):
    before: str
    after: str
    environment: Optional[str] = None  # e.g., "_V" for before vowel

class ProtoLanguage(BaseModel):
    name: str
    phonemes: List[Phoneme]
    vocabulary: List[Word]
    rules: List[SoundChangeRule]