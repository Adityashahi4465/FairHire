from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from supabase_client import supabase
from services.ai_processor import process_response_ai
from services.aggregator import aggregate_assessment
import uuid

router = APIRouter(prefix="/responses", tags=["Responses"])


@router.post("/upload")
async def upload_response(
    assessment_id: str = Form(...),
    question_id: str = Form(...),
    user_id: str = Form(...),
    video: UploadFile = File(...),
):
    try:
        # 1️⃣ Upload video
        ext = video.filename.split(".")[-1]
        file_path = f"{assessment_id}/{user_id}/{question_id}_{uuid.uuid4()}.{ext}"
        file_bytes = await video.read()

        supabase.storage.from_("videos").upload(
            file_path, file_bytes, {"content-type": video.content_type}
        )

        video_url = supabase.storage.from_("interview-videos").get_public_url(file_path)

        # 2️⃣ Create response row
        res = (
            supabase.table("responses")
            .insert(
                {
                    "assessment_id": assessment_id,
                    "question_id": question_id,
                    "user_id": user_id,
                    "video_url": video_url,
                    "status": "uploaded",
                }
            )
            .execute()
        )

        response_id = res.data[0]["id"]

        # 3️⃣ 🔥 CALL AI PROCESSING (INTERNAL)
        process_response_ai(response_id)

        # 4️⃣ 🔥 AGGREGATE IF POSSIBLE
        aggregate_assessment(assessment_id, user_id)

        return {
            "message": "Video uploaded & processing started",
            "response_id": response_id,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
