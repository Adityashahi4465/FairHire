from fastapi import APIRouter, HTTPException
from supabase_client import supabase
from schemas import LoginRequest

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login")
def login(data: LoginRequest):
    # 1️⃣ Check if user already exists by email
    response = supabase.table("users").select("*").eq("email", data.email).execute()

    if response.data:
        # User already exists
        return {"message": "Login successful", "user": response.data[0]}

    # 2️⃣ If not exists → create new user
    new_user = (
        supabase.table("users")
        .insert({"name": data.name, "email": data.email, "role": data.role})
        .execute()
    )

    if not new_user.data:
        raise HTTPException(status_code=500, detail="User creation failed")

    return {"message": "User created successfully", "user": new_user.data[0]}
