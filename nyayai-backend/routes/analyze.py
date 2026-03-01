from fastapi import APIRouter, File, UploadFile, Depends, Form
from db.models import AnalyzeDocumentResponse
from core.pipeline import process_document
from utils.file_utils import validate_upload_file
import db.database as database

router = APIRouter()

@router.post("/analyze-document", response_model=AnalyzeDocumentResponse)
async def analyze_document_endpoint(
    file: UploadFile = File(...),
    language: str = Form("hindi")
):
    # Validate
    await validate_upload_file(file)
    
    # Process
    result = await process_document(file, lang=language)
    
    # Save to db
    conn = database.get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO documents (filename, extracted_text) VALUES (?, ?)",
        (file.filename, result["extracted_text"])
    )
    conn.commit()
    conn.close()
    
    return AnalyzeDocumentResponse(**result)
