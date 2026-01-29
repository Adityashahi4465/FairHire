from supabase_client import supabase


def process_response_ai(response_id: str):
    """
    Simulated AI processing for one response.
    Later this will be replaced by real speech + vision models.
    """

    supabase.table("responses").update(
        {
            # 🎤 Speech
            "transcription": "Candidate explained their answer clearly and confidently.",
            "fluency_score": 7,
            "clarity_score": 8,
            "chatgpt_score": 7,
            "speech_variability": "medium",
            # 👀 Visual / behavioral
            "eye_contact_percentage": 70,
            "confidence_score": 6,
            "facial_stress_score": 3,
            "grooming_score": 7,
            # 😊 Emotions (percentages)
            "emotion_neutral": 60,
            "emotion_happy": 20,
            "emotion_sad": 10,
            "emotion_fearful": 5,
            "emotion_angry": 5,
            # ✅ Final status
            "status": "completed",
        }
    ).eq("id", response_id).execute()
