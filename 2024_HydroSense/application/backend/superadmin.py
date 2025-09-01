from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from pydantic import BaseModel, EmailStr
from database import SessionLocal
from models.models import User, UserCompanyMapping, Company, Product, WaterData, WaterDataDetail,Role,WaterQualityPrediction
from typing import Optional, List,Union
import cloudinary
import cloudinary.uploader
import uuid
from slowapi import Limiter
from slowapi.util import get_remote_address
from auth import get_current_super_admin_user, get_db
from datetime import datetime

router = APIRouter()

limiter = Limiter(key_func=get_remote_address)

# Pydantic Models
class AssignRole(BaseModel):
    user_id: int
    role: int

class AssignCompany(BaseModel):
    user_id: int
    company_id: int

class CompanyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    address: str
    email: EmailStr
    phone_number: str
    website: Optional[str] = None
    image: Optional[UploadFile] = None

class UserWithRole(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    role_id: Optional[int]
    role_name: Optional[str]

class UserCompanyMappingResponse(BaseModel):
    user_company_id: int
    user_id: int
    user_name: str
    company_id: int
    company_name: str
    company_image: Optional[str]

class CompanyResponse(BaseModel):
    company_id: int
    name: str
    description: Optional[str]
    address: str
    email: str
    phone_number: str
    website: Optional[str]
    image: Optional[str]

class HeaderResponse(BaseModel):
    total_products_tested: int
    total_users_registered: int
    total_companies_registered: int
    total_products_registered: int

class DashboardResponse(BaseModel):
    total_products_tested: int
    total_users_registered: int
    total_companies_registered: int
    total_products_registered: int
    average_property_value_tested: float
    tests_conducted_this_month: int
    most_active_company: str
    testing_activity_over_time: List[dict]
    products_tested_by_month: List[dict]
    top_products_by_tests: List[dict]
    top_companies_by_activity: List[dict]
    companies: List[CompanyResponse]
    total_revenue: float
    top_performing_products: List[dict]
    top_performing_companies: List[dict]

class RoleResponse(BaseModel):
    role_id: int
    name: str
    description: Optional[str]

class UserResponse(BaseModel):
    user_id: int
    first_name: str
    last_name: str
    email: EmailStr
    role_id: Optional[int]
    role_name: Optional[str]


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    website: Optional[str] = None
    image: Optional[UploadFile] = None

# Assign Role to User Endpoint
@router.post("/assign-role", status_code=status.HTTP_200_OK)
@limiter.limit("50/minute")
def assign_role(request: Request, assign_role: AssignRole, db: Session = Depends(get_db), current_user: User = Depends(get_current_super_admin_user)):
    user = db.query(User).filter(User.UserID == assign_role.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.Role = assign_role.role
    db.commit()
    return {"message": "Role assigned successfully"}

# Assign Company to User Endpoint
@router.post("/assign-company", status_code=status.HTTP_200_OK)
@limiter.limit("50/minute")
def assign_company(request: Request, assign_company: AssignCompany, db: Session = Depends(get_db), current_user: User = Depends(get_current_super_admin_user)):
    user = db.query(User).filter(User.UserID == assign_company.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    company = db.query(Company).filter(Company.CompanyID == assign_company.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    user_company_mapping = db.query(UserCompanyMapping).filter(UserCompanyMapping.UserID == assign_company.user_id, UserCompanyMapping.CompanyID == assign_company.company_id).first()
    if user_company_mapping:
        raise HTTPException(status_code=400, detail="User is already assigned to this company")
    new_mapping = UserCompanyMapping(UserID=assign_company.user_id, CompanyID=assign_company.company_id)
    db.add(new_mapping)
    db.commit()
    db.refresh(new_mapping)
    return {"message": "Company assigned successfully", "mapping": UserCompanyMappingResponse(
        user_id=new_mapping.UserID,
        user_name=f"{new_mapping.user.FirstName} {new_mapping.user.LastName}",
        company_id=new_mapping.CompanyID,
        company_name=new_mapping.company.Name,
        company_image=new_mapping.company.Image
    )}

# Edit User-Company Mapping Endpoint
@router.put("/user-company-mappings/{user_company_id}", response_model=UserCompanyMappingResponse)
@limiter.limit("50/minute")
def edit_user_company_mapping(request: Request, user_company_id: int, assign_company: AssignCompany, db: Session = Depends(get_db), current_user: User = Depends(get_current_super_admin_user)):
    user_company_mapping = db.query(UserCompanyMapping).filter(UserCompanyMapping.UserCompanyID == user_company_id).first()
    if not user_company_mapping:
        raise HTTPException(status_code=404, detail="User-Company mapping not found")
    
    user = db.query(User).filter(User.UserID == assign_company.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    company = db.query(Company).filter(Company.CompanyID == assign_company.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    existing_mapping = db.query(UserCompanyMapping).filter(UserCompanyMapping.UserID == assign_company.user_id, UserCompanyMapping.CompanyID == assign_company.company_id).first()
    if existing_mapping:
        raise HTTPException(status_code=400, detail="The user has already been assigned to this company")
    
    user_company_mapping.UserID = assign_company.user_id
    user_company_mapping.CompanyID = assign_company.company_id
    db.commit()
    db.refresh(user_company_mapping)
    
    return UserCompanyMappingResponse(
        user_company_id=user_company_mapping.UserCompanyID,
        user_id=user_company_mapping.UserID,
        user_name=f"{user_company_mapping.user.FirstName} {user_company_mapping.user.LastName}",
        company_id=user_company_mapping.CompanyID,
        company_name=user_company_mapping.company.Name,
        company_image=user_company_mapping.company.Image
    )

# Get User-Company Mapping by ID Endpoint
@router.get("/user-company-mappings/{user_company_id}", response_model=UserCompanyMappingResponse)
@limiter.limit("50/minute")
def get_user_company_mapping(request:Request, user_company_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_super_admin_user)):
    user_company_mapping = db.query(UserCompanyMapping).filter(UserCompanyMapping.UserCompanyID == user_company_id).first()
    if not user_company_mapping:
        raise HTTPException(status_code=404, detail="User-Company mapping not found")
    
    return UserCompanyMappingResponse(
        user_company_id=user_company_mapping.UserCompanyID,
        user_id=user_company_mapping.UserID,
        user_name=f"{user_company_mapping.user.FirstName} {user_company_mapping.user.LastName}",
        company_id=user_company_mapping.CompanyID,
        company_name=user_company_mapping.company.Name,
        company_image=user_company_mapping.company.Image
    )


# Create Company Endpoint
@router.post("/create-company", status_code=status.HTTP_201_CREATED)
@limiter.limit("50/minute")
def create_company(
    request: Request,
    name: str = Form(...),
    description: Optional[str] = Form(None),
    address: str = Form(...),
    email: EmailStr = Form(...),
    phone_number: str = Form(...),
    website: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_super_admin_user)
):
    try:
        image_url = None
        if image:
            result = cloudinary.uploader.upload(image.file, public_id=f"company_images/{uuid.uuid4()}")
            image_url = result['secure_url']

        new_company = Company(
            Name=name,
            Description=description,
            Address=address,
            Email=email,
            PhoneNumber=phone_number,
            Website=website,
            Image=image_url
        )
        db.add(new_company)
        db.commit()
        db.refresh(new_company)
        return {"message": "Company created successfully", "company": new_company}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get All Users with Roles Assigned
@router.get("/users-with-roles", response_model=List[UserWithRole])
@limiter.limit("50/minute")
def get_users_with_roles(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_super_admin_user)):
    users = db.query(User).all()
    return [
        UserWithRole(
            user_id=user.UserID,
            first_name=user.FirstName,
            last_name=user.LastName,
            role_id=user.Role,
            role_name=user.role.Name if user.role else None
        )
        for user in users
    ]

# Get All User-Company Mappings
@router.get("/user-company-mappings", response_model=List[UserCompanyMappingResponse])
@limiter.limit("50/minute")
def get_user_company_mappings(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_super_admin_user)):
    mappings = db.query(UserCompanyMapping).all()
    return [
        UserCompanyMappingResponse(
            user_company_id= mapping.UserCompanyID,
            user_id=mapping.UserID,
            user_name=f"{mapping.user.FirstName} {mapping.user.LastName}",
            company_id=mapping.CompanyID,
            company_name=mapping.company.Name,
            company_image=mapping.company.Image
        )
        for mapping in mappings
    ]

# Delete User-Company Mapping Endpoint
@router.delete("/user-company-mappings", status_code=status.HTTP_200_OK)
@limiter.limit("50/minute")
def delete_user_company_mapping(request: Request, user_id: int, company_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_super_admin_user)):
    user_company_mapping = db.query(UserCompanyMapping).filter(UserCompanyMapping.UserID == user_id, UserCompanyMapping.CompanyID == company_id).first()
    if not user_company_mapping:
        raise HTTPException(status_code=404, detail="User-Company mapping not found")
    db.delete(user_company_mapping)
    db.commit()
    return {"message": "User-Company mapping deleted successfully"}

# List All Companies
@router.get("/companies", response_model=List[CompanyResponse])
@limiter.limit("50/minute")
def list_companies(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_super_admin_user)):
    companies = db.query(Company).all()
    return [
        CompanyResponse(
            company_id=company.CompanyID,
            name=company.Name,
            description=company.Description,
            address=company.Address,
            email=company.Email,
            phone_number=company.PhoneNumber,
            website=company.Website,
            image=company.Image
        )
        for company in companies
    ]

# Get Company by ID Endpoint
@router.get("/companies/{company_id}", response_model=CompanyResponse)
@limiter.limit("50/minute")
def get_company_by_id(request: Request, company_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_super_admin_user)):
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


# Edit Company Endpoint
@router.put("/companies/{company_id}", response_model=CompanyResponse)
@limiter.limit("50/minute")
def edit_company(request: Request, company_id: int, name: Optional[str] = Form(None), description: Optional[str] = Form(None), address: Optional[str] = Form(None), email: Optional[EmailStr] = Form(None), phone_number: Optional[str] = Form(None), website: Optional[str] = Form(None), image: Optional[UploadFile] = File(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_super_admin_user)):
    company = db.query(Company).filter(Company.CompanyID == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    if name:
        company.Name = name
    if description:
        company.Description = description
    if address:
        company.Address = address
    if email:
        company.Email = email
    if phone_number:
        company.PhoneNumber = phone_number
    if website:
        company.Website = website
    if image:
        result = cloudinary.uploader.upload(image.file, public_id=f"company_images/{uuid.uuid4()}")
        company.Image = result['secure_url']
    
    db.commit()
    db.refresh(company)
    
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

# Delete Company Endpoint
@router.delete("/companies/{company_id}", status_code=status.HTTP_200_OK)
@limiter.limit("50/minute")
def delete_company(request: Request, company_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_super_admin_user)):
    company = db.query(Company).filter(Company.CompanyID == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Delete all related data
    user_company_mappings = db.query(UserCompanyMapping).filter(UserCompanyMapping.CompanyID == company_id).all()
    for mapping in user_company_mappings:
        db.delete(mapping)
    
    products = db.query(Product).filter(Product.CompanyID == company_id).all()
    for product in products:
        water_data = db.query(WaterData).filter(WaterData.ProductID == product.ProductID).all()
        for data in water_data:
            water_data_details = db.query(WaterDataDetail).filter(WaterDataDetail.WaterDataID == data.WaterDataID).all()
            for detail in water_data_details:
                db.delete(detail)
            water_quality_predictions = db.query(WaterQualityPrediction).filter(WaterQualityPrediction.WaterDataID == data.WaterDataID).all()
            for prediction in water_quality_predictions:
                db.delete(prediction)
            db.delete(data)
        db.delete(product)
    
    db.delete(company)
    db.commit()
    
    return {"message": "Company and all related data deleted successfully"}


# Get Header Information
@router.get("/header", response_model=HeaderResponse)
@limiter.limit("50/minute")
def get_header(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_super_admin_user)):
    total_products_tested = db.query(WaterData).count()
    total_users_registered = db.query(User).count()
    total_companies_registered = db.query(Company).count()
    total_products_registered = db.query(Product).count()

    return HeaderResponse(
        total_products_tested=total_products_tested,
        total_users_registered=total_users_registered,
        total_companies_registered=total_companies_registered,
        total_products_registered=total_products_registered
    )

# Get Dashboard Data
@router.get("/dashboard", response_model=DashboardResponse)
@limiter.limit("50/minute")
def get_dashboard_data(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_super_admin_user)):
    total_products_tested = db.query(WaterData).count()
    total_users_registered = db.query(User).count()
    total_companies_registered = db.query(Company).count()
    total_products_registered = db.query(Product).count()

    # Average Property Value Tested
    average_property_value_tested = db.query(func.avg(WaterDataDetail.Value)).scalar()

    # Tests Conducted This Month
    current_month = datetime.now().month
    tests_conducted_this_month = db.query(WaterData).filter(extract('month', WaterData.Date) == current_month).count()

    # Most Active Company
    most_active_company = db.query(Company.Name).join(Product, Company.CompanyID == Product.CompanyID).join(WaterData, Product.ProductID == WaterData.ProductID).group_by(Company.Name).order_by(func.count(WaterData.WaterDataID).desc()).first()

    # Testing Activity Over Time
    testing_activity_over_time = db.query(
        extract('year', WaterData.Date).label('year'),
        extract('month', WaterData.Date).label('month'),
        func.count(WaterData.WaterDataID).label('tests_conducted')
    ).group_by('year', 'month').all()

    # Products Tested by Month
    products_tested_by_month = db.query(
        extract('year', WaterData.Date).label('year'),
        extract('month', WaterData.Date).label('month'),
        func.count(WaterData.WaterDataID).label('products_tested')
    ).group_by('year', 'month').all()

    # Top Products by Tests Performed
    top_products_by_tests = db.query(
        Product.Name,
        func.count(WaterData.WaterDataID).label('tests_conducted'),
        func.avg(WaterDataDetail.Value).label('average_property_value')
    ).join(WaterData, Product.ProductID == WaterData.ProductID).join(WaterDataDetail, WaterData.WaterDataID == WaterDataDetail.WaterDataID).group_by(Product.Name).order_by(func.count(WaterData.WaterDataID).desc()).all()

    # Top Companies by Activity
    top_companies_by_activity = db.query(
        Company.Name,
        func.count(WaterData.WaterDataID).label('tests_conducted'),
        func.count(Product.ProductID).label('product_count')
    ).join(Product, Company.CompanyID == Product.CompanyID).join(WaterData, Product.ProductID == WaterData.ProductID).group_by(Company.Name).order_by(func.count(WaterData.WaterDataID).desc()).all()

    # Total Revenue
    total_revenue = db.query(func.sum(WaterDataDetail.Value)).scalar()

    # Top Performing Products
    top_performing_products = db.query(
        Product.Name,
        func.avg(WaterDataDetail.Value).label('average_property_value')
    ).join(WaterData, Product.ProductID == WaterData.ProductID).join(WaterDataDetail, WaterData.WaterDataID == WaterDataDetail.WaterDataID).group_by(Product.Name).order_by(func.avg(WaterDataDetail.Value).desc()).all()

    # Top Performing Companies
    top_performing_companies = db.query(
        Company.Name,
        func.avg(WaterDataDetail.Value).label('average_property_value')
    ).join(Product, Company.CompanyID == Product.CompanyID).join(WaterData, Product.ProductID == WaterData.ProductID).join(WaterDataDetail, WaterData.WaterDataID == WaterDataDetail.WaterDataID).group_by(Company.Name).order_by(func.avg(WaterDataDetail.Value).desc()).all()

    companies = db.query(Company).all()
    company_responses = [
        CompanyResponse(
            company_id=company.CompanyID,
            name=company.Name,
            description=company.Description,
            address=company.Address,
            email=company.Email,
            phone_number=company.PhoneNumber,
            website=company.Website,
            image=company.Image
        )
        for company in companies
    ]

    return DashboardResponse(
        total_products_tested=total_products_tested,
        total_users_registered=total_users_registered,
        total_companies_registered=total_companies_registered,
        total_products_registered=total_products_registered,
        average_property_value_tested=average_property_value_tested,
        tests_conducted_this_month=tests_conducted_this_month,
        most_active_company=most_active_company[0] if most_active_company else None,
        testing_activity_over_time=[{"year": year, "month": month, "tests_conducted": tests_conducted} for year, month, tests_conducted in testing_activity_over_time],
        products_tested_by_month=[{"year": year, "month": month, "products_tested": products_tested} for year, month, products_tested in products_tested_by_month],
        top_products_by_tests=[{"product_name": name, "tests_conducted": tests_conducted, "average_property_value": average_property_value} for name, tests_conducted, average_property_value in top_products_by_tests],
        top_companies_by_activity=[{"company_name": name, "tests_conducted": tests_conducted, "product_count": product_count} for name, tests_conducted, product_count in top_companies_by_activity],
        companies=company_responses,
        total_revenue=total_revenue,
        top_performing_products=[{"product_name": name, "average_property_value": average_property_value} for name, average_property_value in top_performing_products],
        top_performing_companies=[{"company_name": name, "average_property_value": average_property_value} for name, average_property_value in top_performing_companies]
    )

# Get All Users Endpoint
@router.get("/users", response_model=List[UserResponse])
@limiter.limit("50/minute")
def get_users(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_super_admin_user)):
    users = db.query(User).all()
    return [
        UserResponse(
            user_id=user.UserID,
            first_name=user.FirstName,
            last_name=user.LastName,
            email=user.Email,
            role_id=user.Role,
            role_name=user.role.Name if user.role else None
        )
        for user in users
    ]

# Get All Roles Endpoint
@router.get("/roles", response_model=List[RoleResponse])
@limiter.limit("50/minute")
def get_roles(request: Request, db: Session = Depends(get_db), current_user: User = Depends(get_current_super_admin_user)):
    roles = db.query(Role).all()
    return [
        RoleResponse(
            role_id=role.RoleID,
            name=role.Name,
            description=role.Description
        )
        for role in roles
    ]