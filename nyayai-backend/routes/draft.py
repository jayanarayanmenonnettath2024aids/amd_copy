from fastapi import APIRouter, File, UploadFile, Form
from typing import Optional
from db.models import DraftResponseResponse
from core.pipeline import draft_legal_reply
from utils.file_utils import validate_upload_file
import db.database as database

router = APIRouter()

@router.post("/draft-response", response_model=DraftResponseResponse)
async def draft_response_endpoint(
    citizen_situation: str = Form(...),
    document_text: Optional[str] = Form(None),
    language: str = Form("hindi"),
    file: Optional[UploadFile] = File(None)
):
    if file:
        await validate_upload_file(file)
        
    result = await draft_legal_reply(citizen_situation, language, file, document_text)
    
    # Save to db (assuming a default doc_id mapping if we don't have one in payload)
    conn = database.get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO drafts (doc_id, draft_text) VALUES (?, ?)",
        (None, result["draft"])
    )
    conn.commit()
    conn.close()
    
    return DraftResponseResponse(**result)
