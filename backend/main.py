from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from routers import loans
import crud

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Loan Prediction API", version="1.0")

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
    data = crud.get_dashboard_data(db, month, year)
    return data   # luôn JSON hợp lệ

app.include_router(loans.router)
