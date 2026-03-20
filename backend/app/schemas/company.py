from datetime import datetime
from pydantic import BaseModel


class CompanyInfoUpdate(BaseModel):
    title: str
    description: str = ""
    photos: list[str] = []


class CompanyInfoResponse(BaseModel):
    id: int
    title: str
    description: str
    photos: list[str]
    updated_at: datetime

    model_config = {"from_attributes": True}


class NewsCreate(BaseModel):
    title: str
    content: str = ""
    cover_image: str = ""
    is_published: bool = False


class NewsUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    cover_image: str | None = None
    is_published: bool | None = None


class NewsResponse(BaseModel):
    id: int
    title: str
    content: str
    cover_image: str
    is_published: bool
    published_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class PaginatedNews(BaseModel):
    items: list[NewsResponse]
    total: int
    page: int
    page_size: int
