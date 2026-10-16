from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, Response, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import select

from app.api.auth import CurrentActiveUser, DbSession
from app.api.products import get_owned_product_or_404
from app.core.config import get_settings
from app.models.document import Document
from app.schemas.document import DocumentPublic, DocumentUploadInput
from app.services.storage import (
    generate_stored_filename,
    get_upload_root,
    validate_upload,
)

router = APIRouter(prefix="/documents", tags=["Documents"])
settings = get_settings()


def get_owned_document_or_404(
    db: DbSession,
    user_id: int,
    document_id: int,
) -> Document:
    document = db.scalar(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == user_id,
        )
    )
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )
    return document


@router.post("/upload", response_model=DocumentPublic, status_code=status.HTTP_201_CREATED)
async def upload_document(
    db: DbSession,
    current_user: CurrentActiveUser,
    file: UploadFile = File(...),
    document_type: str = Form(...),
    product_id: int | None = Form(default=None),
) -> DocumentPublic:
    payload = DocumentUploadInput(
        document_type=document_type,
        product_id=product_id,
    )
    normalized_document_type = payload.document_type

    if product_id is not None:
        get_owned_product_or_404(db, current_user.id, product_id)

    upload_root = get_upload_root()
    upload_root.mkdir(parents=True, exist_ok=True)

    original_filename = Path(file.filename or "upload").name
    suffix = Path(original_filename).suffix.lower()
    stored_filename = generate_stored_filename(suffix or ".bin")
    relative_file_path = str(Path(settings.upload_dir) / stored_filename)
    full_file_path = upload_root / stored_filename

    file_size = 0
    try:
        with full_file_path.open("wb") as buffer:
            while chunk := await file.read(1024 * 1024):
                file_size += len(chunk)
                validate_upload(file, file_size)
                buffer.write(chunk)

        validate_upload(file, file_size)

        document = Document(
            user_id=current_user.id,
            product_id=product_id,
            original_filename=original_filename,
            stored_filename=stored_filename,
            file_path=relative_file_path,
            file_type=file.content_type or "application/octet-stream",
            file_size=file_size,
            document_type=normalized_document_type,
        )
        db.add(document)
        db.commit()
        db.refresh(document)
        return DocumentPublic.model_validate(document)
    except HTTPException:
        db.rollback()
        if full_file_path.exists():
            full_file_path.unlink(missing_ok=True)
        raise
    except Exception:
        if full_file_path.exists():
            full_file_path.unlink(missing_ok=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to save uploaded document.",
        )
    finally:
        await file.close()


@router.get("", response_model=list[DocumentPublic])
def list_documents(
    db: DbSession,
    current_user: CurrentActiveUser,
    product_id: int | None = None,
    document_type: str | None = None,
) -> list[DocumentPublic]:
    query = select(Document).where(Document.user_id == current_user.id)

    if product_id is not None:
        query = query.where(Document.product_id == product_id)

    if document_type:
        normalized = document_type.strip().lower()
        if normalized:
            query = query.where(Document.document_type == normalized)

    documents = db.scalars(query.order_by(Document.uploaded_at.desc(), Document.id.desc())).all()
    return [DocumentPublic.model_validate(document) for document in documents]


@router.get("/{document_id}", response_model=DocumentPublic)
def get_document(
    document_id: int,
    db: DbSession,
    current_user: CurrentActiveUser,
) -> DocumentPublic:
    document = get_owned_document_or_404(db, current_user.id, document_id)
    return DocumentPublic.model_validate(document)


@router.get("/{document_id}/download")
def download_document(
    document_id: int,
    db: DbSession,
    current_user: CurrentActiveUser,
) -> FileResponse:
    document = get_owned_document_or_404(db, current_user.id, document_id)
    file_path = Path(document.file_path)
    if not file_path.exists():
        fallback_path = get_upload_root() / document.stored_filename
        if fallback_path.exists():
            file_path = fallback_path
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document file not found.",
            )

    return FileResponse(
        path=file_path,
        filename=document.original_filename,
        media_type=document.file_type,
    )


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    db: DbSession,
    current_user: CurrentActiveUser,
) -> Response:
    document = get_owned_document_or_404(db, current_user.id, document_id)
    file_path = Path(document.file_path)
    if not file_path.exists():
        fallback_path = get_upload_root() / document.stored_filename
        if fallback_path.exists():
            file_path = fallback_path

    db.delete(document)
    db.commit()

    if file_path.exists():
        file_path.unlink(missing_ok=True)

    return Response(status_code=status.HTTP_204_NO_CONTENT)
