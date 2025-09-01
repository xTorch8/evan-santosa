from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, Request
from sqlalchemy.orm import Session
from database import SessionLocal
from models.models import Product, Company, WaterQualityPrediction, WaterQuality, WaterData, WaterDataDetail, WaterProperty,User
import cloudinary
import cloudinary.uploader
import uuid
import pandas as pd
from joblib import load
from pydantic import BaseModel
from typing import List,Optional,Dict
import json
from sqlalchemy import delete
from auth import get_current_admin_user,get_user_company_id
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import func




router = APIRouter()

# Initialize Cloudinary
cloudinary.config(
    cloud_name='dqnwgswnw',
    api_key='194188234624597',
    api_secret='ZsNvOsVwHO6W_gYcij37sYQnExs'
)

# Load the water quality prediction model
model = load("models/svm_model.pkl")

# Initialize the Limiter
limiter = Limiter(key_func=get_remote_address)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic model for water data input
class WaterDataInput(BaseModel):
    pH: float
    Iron: float
    Nitrate: float
    Chloride: float
    Lead: float
    Turbidity: float
    Fluoride: float
    Copper: float
    Odor: float
    Sulfate: float
    Chlorine: float
    Manganese: float
    Total_Dissolved_Solids: float
    Description: str

class WaterDataInputEdit(BaseModel):
    pH: float
    Iron: float
    Nitrate: float
    Chloride: float
    Lead: float
    Turbidity: float
    Fluoride: float
    Copper: float
    Odor: float
    Sulfate: float
    Chlorine: float
    Manganese: float
    Total_Dissolved_Solids: float
    ProductID: int
    Description: str

class WaterDataInputEditImage(BaseModel):
    pH: float
    Iron: float
    Nitrate: float
    Chloride: float
    Lead: float
    Turbidity: float
    Fluoride: float
    Copper: float
    Odor: float
    Sulfate: float
    Chlorine: float
    Manganese: float
    Total_Dissolved_Solids: float
    Description: str
    ProductID: int

class WaterDataResponse(BaseModel):
    Date: str
    ProductName: str
    ProductID: int
    WaterQualityName: str
    Description: str


class WaterQualityDetailResponse(BaseModel):
    WaterQualityName: str
    Value: str
    
class ProductWaterDataResponse(BaseModel):
    Date: str
    ProductName: str
    ProductID: int
    Description: str
    ProductImage: str
    WaterDataDetail: Dict[str, str]


# Function to upload image to Cloudinary
def upload_image_to_cloudinary(file: UploadFile):
    try:
        result = cloudinary.uploader.upload(file.file, public_id=f"images/{uuid.uuid4()}")
        return result['secure_url']
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

# Endpoint to create product and predict water quality in one request
@router.post("/save/")
@limiter.limit("50/minute")
def create_product_and_predict(
    request: Request,
    Name: str = Form(...),
    Description: str = Form(...),
    image: UploadFile = File(None),  # Make the image optional
    water_data: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    company_id: int = Depends(get_user_company_id)
):
    try:
        if company_id is None:
            raise HTTPException(status_code=400, detail="User does not belong to any company")

        # Parse water_data JSON string to dictionary
        water_data_dict = json.loads(water_data)
        water_data_input = WaterDataInput(**water_data_dict)

        # Step 1: Create Product
        # Check if the company exists
        company = db.query(Company).filter(Company.CompanyID == company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")

        # Upload image to Cloudinary if provided and not empty
        if image and image.filename:
            image_url = upload_image_to_cloudinary(image)
        else:
            image_url = None  # Set image_url to None if no image is uploaded

        # Create a new product
        new_product = Product(
            Name=Name,
            Description=Description,
            Image=image_url,  # Optional image
            CompanyID=company_id
        )
        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        # Step 2: Predict Water Quality
        # Convert input data to DataFrame
        input_data = pd.DataFrame([{
            "pH": water_data_input.pH,
            "Iron": water_data_input.Iron,
            "Nitrate": water_data_input.Nitrate,
            "Chloride": water_data_input.Chloride,
            "Lead": water_data_input.Lead,
            "Turbidity": water_data_input.Turbidity,
            "Fluoride": water_data_input.Fluoride,
            "Copper": water_data_input.Copper,
            "Odor": water_data_input.Odor,
            "Sulfate": water_data_input.Sulfate,
            "Chlorine": water_data_input.Chlorine,
            "Manganese": water_data_input.Manganese,
            "Total Dissolved Solids": water_data_input.Total_Dissolved_Solids
        }])

        # Ensure feature names match the model
        input_data.columns = input_data.columns.str.replace('_', ' ')
        input_data = input_data[model.feature_names_in_]

        # Make prediction
        prediction = model.predict(input_data)
        prediction_result = int(prediction[0])

        # Interpret the prediction
        result = "clean" if prediction_result == 1 else "dirty"

        # Get water quality ID
        water_quality = db.query(WaterQuality).filter(WaterQuality.Name == result.capitalize()).first()
        if not water_quality:
            raise HTTPException(status_code=404, detail="Water quality not found")

        # Save the prediction to the database
        water_data_entry = WaterData(
            ProductID=new_product.ProductID,
            Date=pd.Timestamp.now(tz="UTC"),
            Description=water_data_input.Description  # Use the description from water_data
        )
        db.add(water_data_entry)
        db.commit()
        db.refresh(water_data_entry)

        # Save prediction
        new_prediction = WaterQualityPrediction(
            WaterDataID=water_data_entry.WaterDataID,
            WaterQualityID=water_quality.WaterQualityID
        )
        db.add(new_prediction)

        # Bulk-fetch water property IDs
        water_properties = db.query(WaterProperty).all()
        property_dict = {prop.Name: prop.WaterPropertyID for prop in water_properties}

        # Save water data details
        for prop, value in water_data_input.dict().items():
            if prop == "Total_Dissolved_Solids":
                prop = "Total Dissolved Solids"
            if prop in property_dict:
                water_data_detail = WaterDataDetail(
                    WaterDataID=water_data_entry.WaterDataID,
                    WaterPropertyID=property_dict[prop],
                    Value=value
                )
                db.add(water_data_detail)

        db.commit()

        return {
            "message": "Product created and water quality predicted successfully",
            "product": new_product,
            "prediction": result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Endpoint to predict water quality
@router.post("/predict/")
@limiter.limit("50/minute")
def predict_water_quality(request:Request,data: WaterDataInputEdit, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    try:
        # Convert input data to DataFrame
        input_data = pd.DataFrame([{
            "pH": data.pH,
            "Iron": data.Iron,
            "Nitrate": data.Nitrate,
            "Chloride": data.Chloride,
            "Lead": data.Lead,
            "Turbidity": data.Turbidity,
            "Fluoride": data.Fluoride,
            "Copper": data.Copper,
            "Odor": data.Odor,
            "Sulfate": data.Sulfate,
            "Chlorine": data.Chlorine,
            "Manganese": data.Manganese,
            "Total Dissolved Solids": data.Total_Dissolved_Solids
        }])

        # Ensure feature names match the model
        input_data.columns = input_data.columns.str.replace('_', ' ')
        input_data = input_data[model.feature_names_in_]

        # Make prediction
        prediction = model.predict(input_data)
        prediction_result = int(prediction[0])

        # Interpret the prediction
        result = "clean" if prediction_result == 1 else "dirty"

        # Get water quality ID
        water_quality = db.query(WaterQuality).filter(WaterQuality.Name == result.capitalize()).first()
        if not water_quality:
            raise HTTPException(status_code=404, detail="Water quality not found")

        # Save the prediction to the database
        water_data = WaterData(
            ProductID=data.ProductID,
            Date=pd.Timestamp.now(tz="UTC"),
            Description=data.Description
        )
        db.add(water_data)
        db.commit()
        db.refresh(water_data)

        # Save prediction
        new_prediction = WaterQualityPrediction(
            WaterDataID=water_data.WaterDataID,
            WaterQualityID=water_quality.WaterQualityID
        )
        db.add(new_prediction)

        # Bulk-fetch water property IDs
        water_properties = db.query(WaterProperty).all()
        property_dict = {prop.Name: prop.WaterPropertyID for prop in water_properties}

        # Save water data details
        for prop, value in data.dict().items():
            if(prop == "Total_Dissolved_Solids"):
                prop = "Total Dissolved Solids"
            if prop in property_dict:
                water_data_detail = WaterDataDetail(
                    WaterDataID=water_data.WaterDataID,
                    WaterPropertyID=property_dict[prop],
                    Value=value
                )
                db.add(water_data_detail)

        db.commit()

        return {"Message":"Sucessfully Predict", "prediction": result}
    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing required feature: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to predict water quality
@router.post("/predict-image/")
@limiter.limit("50/minute")
def predict_water_quality(
    request: Request,
    data: str = Form(...),
    image: UploadFile = File(None),  # Make the image optional
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    try:
        # Parse the input data JSON string to dictionary
        data_dict = json.loads(data)
        water_data_input = WaterDataInputEdit(**data_dict)

        # Convert input data to DataFrame
        input_data = pd.DataFrame([{
            "pH": water_data_input.pH,
            "Iron": water_data_input.Iron,
            "Nitrate": water_data_input.Nitrate,
            "Chloride": water_data_input.Chloride,
            "Lead": water_data_input.Lead,
            "Turbidity": water_data_input.Turbidity,
            "Fluoride": water_data_input.Fluoride,
            "Copper": water_data_input.Copper,
            "Odor": water_data_input.Odor,
            "Sulfate": water_data_input.Sulfate,
            "Chlorine": water_data_input.Chlorine,
            "Manganese": water_data_input.Manganese,
            "Total Dissolved Solids": water_data_input.Total_Dissolved_Solids
        }])

        # Ensure feature names match the model
        input_data.columns = input_data.columns.str.replace('_', ' ')
        input_data = input_data[model.feature_names_in_]

        # Make prediction
        prediction = model.predict(input_data)
        prediction_result = int(prediction[0])

        # Interpret the prediction
        result = "clean" if prediction_result == 1 else "dirty"

        # Get water quality ID
        water_quality = db.query(WaterQuality).filter(WaterQuality.Name == result.capitalize()).first()
        if not water_quality:
            raise HTTPException(status_code=404, detail="Water quality not found")

        # Upload image to Cloudinary if provided and not empty
        if image and image.filename:
            image_url = upload_image_to_cloudinary(image)
        else:
            image_url = None  # Set image_url to None if no image is uploaded

        # Save the prediction to the database
        water_data_entry = WaterData(
            ProductID=water_data_input.ProductID,
            Date=pd.Timestamp.now(tz="UTC"),
            Description=water_data_input.Description,  # Use the description from data
            Image=image_url  # Optional image
        )
        db.add(water_data_entry)
        db.commit()
        db.refresh(water_data_entry)

        # Update the product image if an image was uploaded
        if image_url:
            product = db.query(Product).filter(Product.ProductID == water_data_input.ProductID).first()
            if product:
                product.Image = image_url
                db.commit()

        # Save prediction
        new_prediction = WaterQualityPrediction(
            WaterDataID=water_data_entry.WaterDataID,
            WaterQualityID=water_quality.WaterQualityID
        )
        db.add(new_prediction)

        # Bulk-fetch water property IDs
        water_properties = db.query(WaterProperty).all()
        property_dict = {prop.Name: prop.WaterPropertyID for prop in water_properties}

        # Save water data details
        for prop, value in water_data_input.dict().items():
            if prop == "Total_Dissolved_Solids":
                prop = "Total Dissolved Solids"
            if prop in property_dict:
                water_data_detail = WaterDataDetail(
                    WaterDataID=water_data_entry.WaterDataID,
                    WaterPropertyID=property_dict[prop],
                    Value=value
                )
                db.add(water_data_detail)

        db.commit()

        return {
            "message": "Water quality predicted successfully",
            "prediction": result
        }

    except KeyError as e:
        raise HTTPException(status_code=400, detail=f"Missing required feature: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.delete("/delete/{product_id}")
@limiter.limit("50/minute")
def delete_product(request:Request,product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    try:
        # Step 1: Delete records from dependent tables
        # Delete WaterQualityPrediction records
        db.execute(delete(WaterQualityPrediction).where(WaterQualityPrediction.WaterDataID.in_(
            db.query(WaterData.WaterDataID).filter(WaterData.ProductID == product_id)
        )))

        # Delete WaterDataDetail records
        db.execute(delete(WaterDataDetail).where(WaterDataDetail.WaterDataID.in_(
            db.query(WaterData.WaterDataID).filter(WaterData.ProductID == product_id)
        )))

        # Delete WaterData records
        db.execute(delete(WaterData).where(WaterData.ProductID == product_id))

        # Step 2: Delete the product record
        db.execute(delete(Product).where(Product.ProductID == product_id))

        # Commit the transaction
        db.commit()

        return {"message": "Product and related records deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/history/{product_id}", response_model=List[WaterDataResponse])
@limiter.limit("50/minute")
def get_product_history(request:Request,product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    try:
        # Query to fetch water data and predictions with joins
        results = db.query(
            WaterData.Date,
            WaterData.ProductID,
            WaterData.Description,
            Product.Name.label("ProductName"),
            WaterQuality.Name.label("WaterQualityName")
        ).join(
            WaterQualityPrediction, WaterData.WaterDataID == WaterQualityPrediction.WaterDataID, isouter=True
        ).join(
            WaterQuality, WaterQualityPrediction.WaterQualityID == WaterQuality.WaterQualityID, isouter=True
        ).join(
            Product, WaterData.ProductID == Product.ProductID
        ).filter(
            WaterData.ProductID == product_id
        ).all()

        # Process the result into the response model
        water_data_responses = [
            WaterDataResponse(
                Date=date.isoformat(),
                ProductName=product_name,
                ProductID=product_id,
                Description=description,
                WaterQualityName=water_quality_name
            )
            for date, product_id, description, product_name, water_quality_name in results
        ]

        return water_data_responses

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/last-component/{product_id}", response_model=ProductWaterDataResponse)
def last_component(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    try:
        # Subquery to get the latest WaterDataID for the given product_id
        subquery = db.query(
            func.max(WaterData.WaterDataID).label("max_water_data_id")
        ).filter(
            WaterData.ProductID == product_id
        ).subquery()

        # Main query to fetch the required data
        results = db.query(
            WaterData.Date,
            WaterData.ProductID,
            WaterData.Description,
            Product.Name.label("ProductName"),
            Product.Image.label("ProductImage"),
            WaterProperty.Name.label("WaterQualityName"),
            WaterDataDetail.Value
        ).join(
            WaterDataDetail, WaterData.WaterDataID == WaterDataDetail.WaterDataID, isouter=True
        ).join(
            WaterProperty, WaterDataDetail.WaterPropertyID == WaterProperty.WaterPropertyID, isouter=True
        ).join(
            Product, WaterData.ProductID == Product.ProductID
        ).filter(
            WaterData.ProductID == product_id,
            WaterData.WaterDataID == subquery.c.max_water_data_id
        ).all()

        # Process the result into the response model
        if not results:
            raise HTTPException(status_code=404, detail="No data found")

        date, product_id, description, product_name, product_image = results[0][:5]
        product_image = product_image or ""
        water_data_detail = {water_quality_name: str(value) for _, _, _, _, _, water_quality_name, value in results}

        water_data_response = ProductWaterDataResponse(
            Date=date.isoformat(),
            ProductName=product_name,
            ProductID=product_id,
            Description=description,
            ProductImage=product_image,
            WaterDataDetail=water_data_detail
        )

        return water_data_response

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))