from pydantic import BaseModel
from typing import Dict, List, Optional, Literal


class User(BaseModel):
    """User model for authentication and submission"""

    name: str
    # password: str
    solution: Optional[str] = None


class AnswerResult(BaseModel):
    """Result of a single question evaluation"""

    question: str
    classification: str
    correct: bool


class SubmissionResponse(BaseModel):
    """Response for a submission with evaluation results"""

    score: int
    results: Dict[str, AnswerResult]
    num_uses: int


class LeaderboardEntry(BaseModel):
    """Entry in the leaderboard"""

    name: str
    score: int
    timestamp: str


class OpenAIResponse(BaseModel):
    response: Literal["Sticos", "SupportAI", "Other"]
