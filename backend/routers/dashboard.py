# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session
# from database import get_db
# import crud

# router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# @router.get("/")
# def get_dashboard(month: str = None, year: int = None, db: Session = Depends(get_db)):
#     data = crud.get_dashboard_data(db, month, year)
#     data["model_accuracy"] = 93.4 
#     return data
# @router.get("/filters")
# def get_filters(db: Session = Depends(get_db)):
#     return {
#         "years": get_available_years(db),
#         "months": get_available_months()
#     }


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



