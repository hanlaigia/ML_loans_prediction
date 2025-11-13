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

# =========================================================
# 🧩 DASHBOARD ROUTE — THỐNG KÊ TỪ BẢNG loan_prediction.loans
# =========================================================
@app.get("/dashboard")
def get_dashboard(month: str | None = None, year: int | None = None, db: Session = Depends(get_db)):
    try:
        # 1️⃣ Xây where clause an toàn
        conditions = ["1=1"]
        params = {}
        if month:
            conditions.append("Month = :month")
            params["month"] = month
        if year:
            conditions.append("Year = :year")
            params["year"] = year

        where_clause = " AND ".join(conditions)

        # 2️⃣ Thực thi các truy vấn thống kê chính
        with db.begin():
            total_loans = db.execute(
                text(f"SELECT COUNT(*) FROM loan_prediction.loans WHERE {where_clause}"), params
            ).scalar()
        with db.begin():
            total_active_loans = db.execute(
                text(f"SELECT COUNT(*) FROM loan_prediction.loans WHERE prediction = 0 AND {where_clause}"), params
            ).scalar()
        with db.begin():
            avg_loan_amount = db.execute(
                text(f"SELECT AVG(loan_amount) FROM loan_prediction.loans WHERE {where_clause}"), params
            ).scalar()
        with db.begin():
            avg_overdue_rate = db.execute(
                text(f"""
                    SELECT (COUNT(*) * 100.0 / NULLIF(
                        (SELECT COUNT(*) FROM loan_prediction.loans WHERE {where_clause}),
                        0
                    ))
                    FROM loan_prediction.loans
                    WHERE prediction = 1 AND {where_clause}
                """), params
            ).scalar() or 0.0
        avg_overdue_rate = round(avg_overdue_rate, 2)

        # 3️⃣ Gọi CRUD với session riêng để tránh rollback toàn bộ
        crud_data = {}
        try:
            with SessionLocal() as local_db:
                crud_data = crud.get_dashboard_data(local_db, month, year)
        except Exception as e:
            print("⚠️ Warning: get_dashboard_data() failed, ignoring CRUD stats")
            print(e)

        # 4️⃣ Trả kết quả JSON
        return {
            "total_loans": total_loans,
            "total_active_loans": total_active_loans,
            "avg_loan_amount": avg_loan_amount,
            "avg_overdue_rate_percent": avg_overdue_rate,
            **crud_data,
        }

    except Exception as e:
        print("ERROR in /dashboard:", e)
        traceback.print_exc()
        return {"error": "Database query failed", "details": str(e)}


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


# =========================================================
# ROUTERS
# =========================================================
app.include_router(loans.router)


