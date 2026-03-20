from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.sms import router as sms_router
from app.api.v1.company import router as company_router
from app.api.v1.products import router as products_router
from app.api.v1.upload import router as upload_router
from app.api.v1.orders import router as orders_router
from app.api.v1.admin import router as admin_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(sms_router, prefix="/auth")
api_router.include_router(company_router)
api_router.include_router(products_router)
api_router.include_router(upload_router)
api_router.include_router(orders_router)
api_router.include_router(admin_router)
