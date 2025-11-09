from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import schemas, crud
from database import get_db
from model_loader import predict as model_predict



router = APIRouter(prefix="/loans", tags=["Loans"])

@router.get("/", response_model=list[schemas.LoanResponse])
def read_loans(db: Session = Depends(get_db)):
    return crud.get_loans(db)

@router.post("/", response_model=schemas.LoanResponse)
def create_loan(loan: schemas.LoanCreate, db: Session = Depends(get_db)):
    return crud.create_loan(db, loan)

# @router.post("/predict")
# def predict_loan(features: dict):
#     return predict(features)
@router.post("/predict")
def predict_loan(data: schemas.LoanBase):
    result = model_predict(data.dict())  # chạy mô hình
    return result


