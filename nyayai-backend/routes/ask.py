from fastapi import APIRouter, File, UploadFile, Form
from typing import Optional
from db.models import AskQuestionResponse
from core.pipeline import answer_question
from utils.file_utils import validate_upload_file
import db.database as database

router = APIRouter()

@router.post("/ask-question", response_model=AskQuestionResponse)
async def ask_question_endpoint(
    question: str = Form(...),
    language: str = Form("hindi"),
    file: Optional[UploadFile] = File(None)
):
    if file:
        await validate_upload_file(file)
        
    result = await answer_question(question, language, file)
    
    # Log query to db
    conn = database.get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO queries (question, answer, lang) VALUES (?, ?, ?)",
        (question, result["answer"], language)
    )
    conn.commit()
    conn.close()
    
    return AskQuestionResponse(**result)
