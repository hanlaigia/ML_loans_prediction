from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
import traceback
from fastapi import HTTPException

from database import Base, engine, get_db, SessionLocal
from routers import loans
import models
import crud
from fastapi.responses import RedirectResponse




Base.metadata.create_all(bind=engine)

app = FastAPI(title="Loan Prediction API", version="1.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Backend connected successfully"}

@app.get("/dashboard")
def get_dashboard(month: str | None = None, year: int | None = None, db: Session = Depends(get_db)):
    """
    - Không filter: trả full DB
    - Có month/year: lọc theo Month, Year
    """
    return crud.get_dashboard_data(db, month, year)


@app.post("/login")
def login(username: str, password: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, username)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # so sánh mật khẩu
    if user.password != password:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return {
        "message": "Login success",
        "user": {
            "id": user.id,
            "employee_code": user.employee_code,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@app.get("/loans")
async def redirect_loans():
    return RedirectResponse(url="/loans/")

app.include_router(loans.router)


