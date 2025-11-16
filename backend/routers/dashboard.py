from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import crud

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/")
def get_dashboard(db: Session = Depends(get_db)):
    return crud.get_dashboard_data(db)
@router.get("/filters")
def get_filters(db: Session = Depends(get_db)):
    return {
        "years": get_available_years(db),
        "months": get_available_months()
    }



