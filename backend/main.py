from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text, func

from database import Base, engine, get_db
from routers import loans
import models
import crud
import traceback

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


# =========================================================
# 🧩 DASHBOARD ROUTE — THỐNG KÊ TỪ BẢNG loan_prediction.loans
# =========================================================
@app.get("/dashboard")
def get_dashboard(month: str | None = None, year: int | None = None, db: Session = Depends(get_db)):
    try:
        # 🟩 Điều kiện lọc
        filters = []
        params = {}

        if month:
            filters.append("Month = :month")
            params["month"] = month
        if year:
            filters.append("Year = :year")
            params["year"] = year

        where_clause = " WHERE " + " AND ".join(filters) if filters else ""

        # 🟩 Đếm tổng số khoản vay
        total_loans = db.execute(
            text(f"SELECT COUNT(*) FROM loan_prediction.loans{where_clause}"),
            params,
        ).scalar()

        # 🟩 Tổng số khoản vay đang hoạt động (status = 0)
        total_active_loans = db.execute(
            text(f"SELECT COUNT(*) FROM loan_prediction.loans WHERE status = 0{(' AND ' + ' AND '.join(filters)) if filters else ''}"),
            params,
        ).scalar()

        # 🟩 Trung bình loan_amount
        avg_loan_amount = db.execute(
            text(f"SELECT AVG(loan_amount) FROM loan_prediction.loans{where_clause}"),
            params,
        ).scalar()

        # 🟩 Tỷ lệ trung bình nợ quá hạn (status = 1)
        avg_overdue_rate = db.execute(
            text(f"SELECT (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM loan_prediction.loans{where_clause})) FROM loan_prediction.loans WHERE status = 1{(' AND ' + ' AND '.join(filters)) if filters else ''}"),
            params,
        ).scalar() or 0.0
        avg_overdue_rate = round(avg_overdue_rate, 2)

        # 🟩 Gọi hàm CRUD để thống kê chi tiết hơn
        crud_data = crud.get_dashboard_data(db, month, year)

        return {
            "total_loans": total_loans,
            "total_active_loans": total_active_loans,
            "avg_loan_amount": avg_loan_amount,
            "avg_overdue_rate_percent": avg_overdue_rate,
            **crud_data,
        }

    except Exception as e:
        print("❌ ERROR in /dashboard:", e)
        traceback.print_exc()
        return {"error": "Database query failed", "details": str(e)}


# =========================================================
# ROUTERS
# =========================================================
app.include_router(loans.router)
