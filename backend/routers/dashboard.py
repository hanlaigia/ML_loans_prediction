from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import crud

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/")
def get_dashboard(month: str = None, year: int = None, db: Session = Depends(get_db)):
    data = crud.get_dashboard_data(db, month, year)
    data["model_accuracy"] = 90.14  # cố định
    return data