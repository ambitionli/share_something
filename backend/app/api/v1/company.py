from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_admin
from app.models.company import CompanyInfo, CompanyNews
from app.models.user import User
from app.schemas.company import (
    CompanyInfoUpdate,
    CompanyInfoResponse,
    NewsCreate,
    NewsUpdate,
    NewsResponse,
    PaginatedNews,
)

router = APIRouter(prefix="/company", tags=["公司信息"])


@router.get("/info", response_model=CompanyInfoResponse | None)
async def get_company_info(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CompanyInfo).limit(1))
    return result.scalar_one_or_none()


@router.put("/info", response_model=CompanyInfoResponse)
async def update_company_info(
    body: CompanyInfoUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(CompanyInfo).limit(1))
    info = result.scalar_one_or_none()
    if info is None:
        info = CompanyInfo(title=body.title, description=body.description, photos=body.photos)
        db.add(info)
    else:
        info.title = body.title
        info.description = body.description
        info.photos = body.photos
    await db.flush()
    await db.refresh(info)
    return info


@router.get("/news", response_model=PaginatedNews)
async def list_news(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    published_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    query = select(CompanyNews)
    if published_only:
        query = query.where(CompanyNews.is_published == True)  # noqa: E712

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    items_q = query.order_by(CompanyNews.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(items_q)
    items = result.scalars().all()

    return PaginatedNews(items=items, total=total, page=page, page_size=page_size)


@router.post("/news", response_model=NewsResponse, status_code=status.HTTP_201_CREATED)
async def create_news(
    body: NewsCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    news = CompanyNews(
        title=body.title,
        content=body.content,
        cover_image=body.cover_image,
        is_published=body.is_published,
        published_at=datetime.now(timezone.utc) if body.is_published else None,
    )
    db.add(news)
    await db.flush()
    await db.refresh(news)
    return news


@router.get("/news/{news_id}", response_model=NewsResponse)
async def get_news(news_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CompanyNews).where(CompanyNews.id == news_id))
    news = result.scalar_one_or_none()
    if news is None:
        raise HTTPException(status_code=404, detail="新闻不存在")
    return news


@router.put("/news/{news_id}", response_model=NewsResponse)
async def update_news(
    news_id: int,
    body: NewsUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(CompanyNews).where(CompanyNews.id == news_id))
    news = result.scalar_one_or_none()
    if news is None:
        raise HTTPException(status_code=404, detail="新闻不存在")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(news, field, value)
    if "is_published" in update_data and update_data["is_published"] and news.published_at is None:
        news.published_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(news)
    return news


@router.delete("/news/{news_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_news(
    news_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    result = await db.execute(select(CompanyNews).where(CompanyNews.id == news_id))
    news = result.scalar_one_or_none()
    if news is None:
        raise HTTPException(status_code=404, detail="新闻不存在")
    await db.delete(news)
