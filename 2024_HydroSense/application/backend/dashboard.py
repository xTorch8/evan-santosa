from fastapi import APIRouter, Depends, HTTPException, status,Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import SessionLocal
from models.models import Company, Product, WaterQuality, WaterQualityPrediction, WaterData
from pydantic import BaseModel
from typing import List,Optional
from models.models import User
from auth import get_current_user,get_user_company_id    
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()

# Initialize the Limiter
limiter = Limiter(key_func=get_remote_address)


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic Models
class CompanyLeaderboard(BaseModel):
    company_id: int
    company_name: str
    clean_count: int

class ProductList(BaseModel):
    product_id: int
    product_name: str
    product_description: str
    product_image: str
    result: str
    date: str
    time: str

class ProductHistory(BaseModel):
    product_id: int
    product_name: str
    product_description: str
    product_image: Optional[str]
    result: str
    date: str
    time: str

class CompanyResponse(BaseModel):
    company_id: int
    name: str
    description: Optional[str]
    address: str
    email: str
    phone_number: str
    website: Optional[str]
    image: Optional[str]

# Leaderboard Endpoint
@router.get("/leaderboard", response_model=List[CompanyLeaderboard])
@limiter.limit("50/minute")
def get_leaderboard(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    clean_quality_id = db.query(WaterQuality.WaterQualityID).filter(WaterQuality.Name == "Clean").scalar_subquery()
    
    # Subquery to get the latest WaterDataID for each product
    latest_water_data_subquery = (
        db.query(
            WaterData.ProductID,
            func.max(WaterData.Date).label("latest_date")
        )
        .group_by(WaterData.ProductID)
        .subquery()
    )

    leaderboard = (
        db.query(
            Company.CompanyID.label("company_id"),
            Company.Name.label("company_name"),
            Company.Image.label("company_image"),
            func.count(WaterQualityPrediction.WaterQualityPredictionID).label("clean_count")
        )
        .join(Product, Product.CompanyID == Company.CompanyID)
        .join(WaterData, WaterData.ProductID == Product.ProductID)
        .join(latest_water_data_subquery, (latest_water_data_subquery.c.ProductID == WaterData.ProductID) & (latest_water_data_subquery.c.latest_date == WaterData.Date))
        .join(WaterQualityPrediction, WaterQualityPrediction.WaterDataID == WaterData.WaterDataID)
        .filter(WaterQualityPrediction.WaterQualityID == clean_quality_id)
        .group_by(Company.CompanyID, Company.Name, Company.Image)
        .order_by(func.count(WaterQualityPrediction.WaterQualityPredictionID).desc())
        .all()
    )

    return leaderboard





# Products by Company Endpoint with Latest Result
@router.get("/company/{company_id}/products", response_model=List[ProductList])
@limiter.limit("50/minute")
def get_company_products(request: Request,company_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    subquery = (
        db.query(WaterData.ProductID, func.max(WaterData.Date).label("latest_date"))
        .group_by(WaterData.ProductID)
        .subquery()
    )

    products = (
        db.query(
            Product.ProductID.label("product_id"),
            Product.Name.label("product_name"),
            Product.Description.label("product_description"),
            Product.Image.label("product_image"),
            WaterQuality.Name.label("result"),
            WaterData.Date.label("date"),
        )
        .join(WaterData, WaterData.ProductID == Product.ProductID)
        .join(subquery, (WaterData.ProductID == subquery.c.ProductID) & (WaterData.Date == subquery.c.latest_date))
        .join(WaterQualityPrediction, WaterQualityPrediction.WaterDataID == WaterData.WaterDataID, isouter=True)
        .join(WaterQuality, WaterQuality.WaterQualityID == WaterQualityPrediction.WaterQualityID, isouter=True)
        .filter(Product.CompanyID == company_id)
        .order_by(Product.ProductID, WaterData.Date)
        .all()
    )

    if not products:
        raise HTTPException(status_code=404, detail="Company not found or no products available")
    
    # Create a list of ProductList objects
    product_list = []
    for product in products:
        date_time = product.date
        date_str = date_time.strftime("%Y-%m-%d") if date_time else "N/A"
        time_str = date_time.strftime("%H:%M:%S") if date_time else "N/A"
        product_list.append(ProductList(
            product_id=product.product_id,
            product_name=product.product_name,
            product_description=product.product_description,
            product_image=product.product_image or "",
            result=product.result or "N/A",
            date=date_str,
            time=time_str
        ))

    return product_list



# Product History by Company Endpoint
@router.get("/company/history", response_model=List[ProductHistory])
@limiter.limit("50/minute")
def get_product_history(request: Request,db: Session = Depends(get_db), current_user: User = Depends(get_current_user), company_id: int = Depends(get_user_company_id)):
    if company_id is None:
        raise HTTPException(status_code=400, detail="User does not belong to any company")

    history = (
        db.query(
            Product.ProductID.label("product_id"),
            Product.Name.label("product_name"),
            Product.Description.label("product_description"),
            Product.Image.label("product_image"),
            WaterQuality.Name.label("result"),
            WaterData.Date.label("date")
        )
        .select_from(Company)
        .join(Product, Product.CompanyID == Company.CompanyID)
        .join(WaterData, WaterData.ProductID == Product.ProductID)
        .join(WaterQualityPrediction, WaterQualityPrediction.WaterDataID == WaterData.WaterDataID)
        .join(WaterQuality, WaterQuality.WaterQualityID == WaterQualityPrediction.WaterQualityID)
        .filter(Company.CompanyID == company_id)
        .order_by(WaterData.Date.desc())
        .all()
    )
    
    if not history:
        raise HTTPException(status_code=404, detail="Company not found or no history available")
    
    formatted_history = []
    for record in history:
        date_time = record.date
        date_str = date_time.strftime("%Y-%m-%d")
        time_str = date_time.strftime("%I:%M %p")
        formatted_history.append(ProductHistory(
            product_id=record.product_id,
            product_name=record.product_name,
            product_description=record.product_description,
            product_image=record.product_image,
            result=record.result,
            date=date_str,
            time=time_str
        ))
    
    return formatted_history


# Get Company by ID Endpoint
@router.get("/companies/{company_id}", response_model=CompanyResponse)
@limiter.limit("50/minute")
def get_company_by_id(request: Request, company_id: int, db: Session = Depends(get_db),  current_user: User = Depends(get_current_user)):
    company = db.query(Company).filter(Company.CompanyID == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return CompanyResponse(
        company_id=company.CompanyID,
        name=company.Name,
        description=company.Description,
        address=company.Address,
        email=company.Email,
        phone_number=company.PhoneNumber,
        website=company.Website,
        image=company.Image
    )