from supabase_client import supabase


def aggregate_assessment(assessment_id: str, user_id: str):
    responses = (
        supabase.table("responses")
        .select("*")
        .eq("assessment_id", assessment_id)
        .eq("user_id", user_id)
        .eq("status", "completed")
        .execute()
        .data
    )

    if not responses:
        return

    total = len(responses)

    avg_fluency = sum(r["fluency_score"] for r in responses) // total
    avg_clarity = sum(r["clarity_score"] for r in responses) // total
    avg_confidence = sum(r["confidence_score"] for r in responses) // total
    avg_grooming = sum(r["grooming_score"] for r in responses) // total

    # ✅ content_score = clarity + chatgpt relevance
    content_score = sum(
        (r["clarity_score"] + (r["chatgpt_score"] or 0)) for r in responses
    ) // (2 * total)

    overall_score = (avg_fluency + avg_clarity + avg_confidence + avg_grooming) // 4

    supabase.table("assessment_results").upsert(
        {
            "assessment_id": assessment_id,
            "user_id": user_id,
            "overall_score": overall_score,
            "avg_fluency": avg_fluency,
            "avg_clarity": avg_clarity,
            "avg_confidence": avg_confidence,
            "avg_grooming": avg_grooming,
            "content_score": content_score,
            "grooming_score": avg_grooming,
            "speech_variability_detected": any(
                r["speech_variability"] != "low" for r in responses
            ),
            "evaluation_mode": "balanced",
            "final_summary": "Candidate shows consistent performance.",
        }
    ).execute()
