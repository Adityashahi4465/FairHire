from fastapi import FastAPI, HTTPException
from supabase_client import supabase
from routes.auth import router as auth_router
from routes.assessments import router as assessment_router


app = FastAPI()


@app.get("/")
def root():
    return {"message": "FastAPI backend is running 🚀"}


app.include_router(auth_router)
app.include_router(assessment_router)
