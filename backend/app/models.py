from pydantic import BaseModel
from typing import List, Optional

class Phoneme(BaseModel):
    symbol: str
    category: str

class Word(BaseModel):
    form: str
    meaning: str

class SoundChangeRule(BaseModel):
    before: str
    after: str
    environment: Optional[str] = None

class ProtoLanguage(BaseModel):
    name: str
    phonemes: List[Phoneme]
    vocabulary: List[Word]
    rules: List[SoundChangeRule]