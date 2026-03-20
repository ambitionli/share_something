import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

from app.core.deps import get_current_admin
from app.models.user import User
from app.schemas.upload import UploadResponse

router = APIRouter(prefix="/upload", tags=["文件上传"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_SIZE = 5 * 1024 * 1024  # 5MB

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    _admin: User = Depends(get_current_admin),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"不支持的文件类型: {file.content_type}")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="文件大小不能超过 5MB")

    ext = Path(file.filename or "img.jpg").suffix or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = UPLOAD_DIR / filename

    filepath.write_bytes(content)

    url = f"/uploads/{filename}"
    return UploadResponse(url=url, filename=filename)
