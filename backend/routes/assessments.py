from fastapi import APIRouter, HTTPException
from supabase_client import supabase
from schemas import CreateAssessmentRequest

router = APIRouter(prefix="/assessments", tags=["Assessments"])


@router.post("/create")
def create_assessment(data: CreateAssessmentRequest):

    # 1️⃣ Create assessment
    assessment_res = (
        supabase.table("assessments")
        .insert(
            {
                "title": data.title,
                "description": data.description,
                "created_by": data.recruiter_id,
            }
        )
        .execute()
    )

    if not assessment_res.data:
        raise HTTPException(status_code=500, detail="Assessment creation failed")

    assessment_id = assessment_res.data[0]["id"]

    # 2️⃣ Insert questions directly into assessment_questions
    for index, question in enumerate(data.questions):
        supabase.table("assessment_questions").insert(
            {
                "assessment_id": assessment_id,
                "question_text": question.question_text,
                "duration_seconds": question.duration_seconds,
                "question_order": index + 1,
            }
        ).execute()

    return {
        "message": "Assessment created successfully",
        "assessment_id": assessment_id,
    }


@router.get("/{assessment_id}/questions")
def get_assessment_questions(assessment_id: str):

    # 1️⃣ Fetch assessment details
    assessment_res = (
        supabase.table("assessments")
        .select("id, title, description")
        .eq("id", assessment_id)
        .single()
        .execute()
    )

    if not assessment_res.data:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # 2️⃣ Fetch questions ordered
    questions_res = (
        supabase.table("assessment_questions")
        .select("id, question_text, duration_seconds, question_order")
        .eq("assessment_id", assessment_id)
        .order("question_order")
        .execute()
    )

    return {"assessment": assessment_res.data, "questions": questions_res.data}
