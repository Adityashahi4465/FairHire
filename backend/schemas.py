from pydantic import BaseModel, EmailStr
from typing import List


class LoginRequest(BaseModel):
    name: str
    email: EmailStr
    role: str  # "candidate" or "recruiter"


class QuestionInput(BaseModel):
    question_text: str
    duration_seconds: int


class CreateAssessmentRequest(BaseModel):
    title: str
    description: str
    recruiter_id: str
    questions: List[QuestionInput]
