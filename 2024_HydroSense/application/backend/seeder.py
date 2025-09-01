from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from database import Base
from models.models import Role, User, Company, Product, WaterProperty, WaterData, WaterDataDetail, WaterQuality, WaterQualityPrediction, UserCompanyMapping

# Database URL
DATABASE_URL = "mysql+mysqlconnector://wasq4731_admin:I^F&tgK&GTCR6U%@103.247.8.36:3306/wasq4731_Hydrosense"

# Create the database engine
engine = create_engine(DATABASE_URL)

# Create all tables
Base.metadata.create_all(engine)

# Seed data
def seed_data():
    # Create a new session
    with Session(bind=engine) as session:
        try:
            # Seed roles
            roles = [
                Role(Name="Admin", Description="Administrator role"),
                Role(Name="User", Description="Regular user role"),
                Role(Name="Super Admin", Description="Super administrator role")
            ]
            for role in roles:
                if not session.query(Role).filter_by(Name=role.Name).first():
                    session.add(role)

            # Seed companies
            companies = [
                Company(Name="Company A", Description="Description A", Address="Address A", Email="emailA@example.com", PhoneNumber="1234567890", Website="www.companya.com"),
                Company(Name="Company B", Description="Description B", Address="Address B", Email="emailB@example.com", PhoneNumber="0987654321", Website="www.companyb.com")
            ]
            for company in companies:
                if not session.query(Company).filter_by(Email=company.Email).first():
                    session.add(company)

            # Seed users
            users = [
                User(FirstName="John", LastName="Doe", Email="john.doe@example.com", Password="$2a$12$9t55.m5D7S/Ymh5LCVmFbegJYnPID.mXtVKTxLc.sqppuF54Batju", Role=1),
                User(FirstName="Jane", LastName="Doe", Email="jane.doe@example.com", Password="$2a$12$9t55.m5D7S/Ymh5LCVmFbegJYnPID.mXtVKTxLc.sqppuF54Batju", Role=2),
                User(FirstName="Super", LastName="Admin", Email="Admin@superadmin.com", Password="$2a$12$cCDUDJBl6xVSKtGgEA/JDO316rCMjfYMiKR.MEqmD0lua949xpIf6", Role=3)
            ]
            for user in users:
                if not session.query(User).filter_by(Email=user.Email).first():
                    session.add(user)

            # Seed user-company mappings
            user_company_mappings = [
                UserCompanyMapping(UserID=1, CompanyID=1),
                UserCompanyMapping(UserID=2, CompanyID=2)
            ]
            for mapping in user_company_mappings:
                if not session.query(UserCompanyMapping).filter_by(UserID=mapping.UserID, CompanyID=mapping.CompanyID).first():
                    session.add(mapping)

            # Seed products
            products = [
                Product(Name="Product A", Description="Description A", CompanyID=1),
                Product(Name="Product B", Description="Description B", CompanyID=2)
            ]
            for product in products:
                if not session.query(Product).filter_by(Name=product.Name, CompanyID=product.CompanyID).first():
                    session.add(product)

            # Seed water properties
            water_properties = [
                WaterProperty(Name="pH", Description="pH level"),
                WaterProperty(Name="Iron", Description="Iron content"),
                WaterProperty(Name="Nitrate", Description="Nitrate content"),
                WaterProperty(Name="Chloride", Description="Chloride content"),
                WaterProperty(Name="Lead", Description="Lead content"),
                WaterProperty(Name="Turbidity", Description="Turbidity level"),
                WaterProperty(Name="Fluoride", Description="Fluoride content"),
                WaterProperty(Name="Copper", Description="Copper content"),
                WaterProperty(Name="Odor", Description="Odor level"),
                WaterProperty(Name="Sulfate", Description="Sulfate content"),
                WaterProperty(Name="Chlorine", Description="Chlorine content"),
                WaterProperty(Name="Manganese", Description="Manganese content"),
                WaterProperty(Name="Total Dissolved Solids", Description="Total dissolved solids content")
            ]
            for property in water_properties:
                if not session.query(WaterProperty).filter_by(Name=property.Name).first():
                    session.add(property)

            # Seed water data
            water_data = [
                WaterData(ProductID=1, Date="2023-01-01 00:00:00", Description="Water data A"),
                WaterData(ProductID=2, Date="2023-01-02 00:00:00", Description="Water data B")
            ]
            for data in water_data:
                if not session.query(WaterData).filter_by(ProductID=data.ProductID, Date=data.Date).first():
                    session.add(data)

            # Seed water data details
            water_data_details = [
                WaterDataDetail(WaterDataID=1, WaterPropertyID=1, Value=7.0),
                WaterDataDetail(WaterDataID=1, WaterPropertyID=2, Value=0.02),
                WaterDataDetail(WaterDataID=2, WaterPropertyID=1, Value=6.5),
                WaterDataDetail(WaterDataID=2, WaterPropertyID=2, Value=0.03)
            ]
            for detail in water_data_details:
                if not session.query(WaterDataDetail).filter_by(WaterDataID=detail.WaterDataID, WaterPropertyID=detail.WaterPropertyID).first():
                    session.add(detail)

            # Seed water quality
            water_qualities = [
                WaterQuality(Name="Clean", Description="Clean water"),
                WaterQuality(Name="Dirty", Description="Dirty water")
            ]
            for quality in water_qualities:
                if not session.query(WaterQuality).filter_by(Name=quality.Name).first():
                    session.add(quality)

            # Seed water quality predictions
            water_quality_predictions = [
                WaterQualityPrediction(WaterDataID=1, WaterQualityID=1),
                WaterQualityPrediction(WaterDataID=2, WaterQualityID=2)
            ]
            for prediction in water_quality_predictions:
                if not session.query(WaterQualityPrediction).filter_by(WaterDataID=prediction.WaterDataID, WaterQualityID=prediction.WaterQualityID).first():
                    session.add(prediction)

            # Commit all changes in one transaction
            session.commit()

        except Exception as e:
            session.rollback()
            print(f"Error occurred while seeding data: {e}")
        finally:
            session.close()

# Run the seeder
if __name__ == "__main__":
    seed_data()
