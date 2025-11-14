from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import schemas, models
from database import get_db
from model_loader import predict as model_predict
import crud
router = APIRouter(prefix="/loans", tags=["Loans"])

#API lấy danh sách loans với phân trang và lọc
@router.get("/page", response_model=list[schemas.LoanResponse])
def read_loans_page(
    page: int = 1,
    size: int = 300,
    id: int | None = None,
    year: int | None = None,
    month: str | None = None,
    sort_id: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Loan)

    if id is not None:
        query = query.filter(models.Loan.id == id)

    if year is not None:
        query = query.filter(models.Loan.Year == year)

    if month is not None:
        query = query.filter(models.Loan.Month == month)

    if sort_id == "asc":
        query = query.order_by(models.Loan.id.asc())

    if sort_id == "desc":
        query = query.order_by(models.Loan.id.desc())

    offset = (page - 1) * size
    return query.offset(offset).limit(size).all()

# API trả tổng số bản ghi
@router.get("/count")
def loans_count(db: Session = Depends(get_db)):
    total = db.query(models.Loan).count()
    return {"total": total}

@router.post("/", response_model=schemas.LoanResponse)
def create_loan(loan: schemas.LoanCreate, db: Session = Depends(get_db)):
    return crud.create_loan(db, loan)

@router.post("/predict")
def predict_loan(data: schemas.LoanBase):
    result = model_predict(data.dict())
    return result

@router.delete("/{loan_id}")
def delete_loan(loan_id: int, db: Session = Depends(get_db)):
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        return {"error": "Loan not found"}

    db.delete(loan)
    db.commit()
    return {"message": f"Loan {loan_id} deleted successfully"}

