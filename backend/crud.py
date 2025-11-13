from sqlalchemy.orm import Session
from collections import defaultdict
import traceback
from datetime import datetime

import models
import schemas


def create_loan(db: Session, loan: schemas.LoanCreate):
    try:
        loan_data = loan.model_dump()
    except AttributeError:
        loan_data = loan.dict()

    if "co-applicant_credit_type" in loan_data and "co_applicant_credit_type" not in loan_data:
        loan_data["co_applicant_credit_type"] = loan_data.pop("co-applicant_credit_type")

    allowed_columns = {col.name for col in models.Loan.__table__.columns}
    filtered_data = {k: v for k, v in loan_data.items() if k in allowed_columns}
    # CHUẨN HÓA GENDER 
    if "Gender" in filtered_data:
        g = str(filtered_data["Gender"]).lower()
        if "male" in g:
            filtered_data["Gender"] = "Male"
        elif "female" in g:
            filtered_data["Gender"] = "Female"
        else:
            filtered_data["Gender"] = "Sex Not Av"

    # Ghi nhận Month/Year hiện tại vào CSDL
    filtered_data["Month"] = datetime.now().strftime("%B")
    filtered_data["Year"] = datetime.now().year
    # Ghi nhận Month/Year hiện tại vào CSDL
    filtered_data["Month"] = datetime.now().strftime("%B")  # VD: "September"
    filtered_data["Year"] = datetime.now().year

    # Chuẩn hóa loan_limit
    if "loan_limit" in filtered_data:
        v = filtered_data["loan_limit"]
        if isinstance(v, str):
            vl = v.strip().lower()
            if vl == "cf":
                filtered_data["loan_limit"] = 500000.0
            elif vl == "ncf":
                filtered_data["loan_limit"] = 0.0
            else:
                try:
                    filtered_data["loan_limit"] = float(v)
                except ValueError:
                    filtered_data["loan_limit"] = None

    db_loan = models.Loan(**filtered_data)
    db.add(db_loan)
    db.commit()
    db.refresh(db_loan)

    return db_loan


def safe_limit(val):
    """Chuyển giá trị loan_limit về float an toàn"""
    try:
        return float(val)
    except Exception:
        return 0.0


def get_dashboard_data(db: Session, month: str = None, year: int = None):
    """
    - Nếu không truyền month/year -> thống kê toàn bộ CSDL
    - Nếu truyền month/year -> lọc theo Month + Year
    - Month trong DB là tên tiếng Anh (September, October, ...),
      trong khi frontend đang gửi month = 9, 10, 11 -> cần map sang tên tháng.
    """
    try:
        query = db.query(models.Loan)

        # Xử lý lọc theo tháng (nếu có)
        if month:
            month_name = None

            # Nếu month là chuỗi số, vd "9" -> "September"
            if isinstance(month, str) and month.isdigit():
                month_int = int(month)
            else:
                # Có thể là int hoặc string đã là "September"
                try:
                    month_int = int(month)
                except (TypeError, ValueError):
                    month_int = None

            if month_int is not None:
                month_names = [
                    None,
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                ]
                if 1 <= month_int <= 12:
                    month_name = month_names[month_int]
            else:
                # Giả sử đã là "September", "October", ...
                month_name = str(month)

            if month_name:
                query = query.filter(models.Loan.Month == month_name)

        # Xử lý lọc theo năm (nếu có)
        if year is not None:
            query = query.filter(models.Loan.Year == year)

        # Lấy dữ liệu theo filter (hoặc toàn bộ nếu không có filter)
        loans = query.all()
        total = len(loans)
        total_active = query.filter(models.Loan.prediction == 0).count()

        if total == 0:
            return get_empty_data()

        overdue = sum(1 for l in loans if getattr(l, "prediction", 0) == 1)
        total_overdue_amount = sum(
            (l.loan_amount or 0) for l in loans if getattr(l, "prediction", 0) == 1
        )

        def group_rate(key_fn):
            groups = defaultdict(list)
            for loan in loans:
                key = key_fn(loan)
                if key:
                    groups[key].append(loan)

            result = []
            for k, v in groups.items():
                if not v:
                    continue
                default_cnt = sum(1 for x in v if getattr(x, "prediction", 0) == 1)
                rate = (default_cnt / len(v)) * 100 if len(v) > 0 else 0
                result.append(
                    {
                        "key": k,
                        "default_rate_percent": round(rate, 2),
                    }
                )
            return result
        # ===========================
        # Credit Capacity Distribution (L1 vs L2)
        # ===========================
        credit_capacity_dist = []
        groups = defaultdict(list)

        for loan in loans:
            key = loan.Credit_Worthiness
            if key:
                groups[key].append(loan)

        for k, v in groups.items():
            pct = (len(v) / total) * 100
            credit_capacity_dist.append({
                "group_name": k,
                "total": len(v),
                "percentage": round(pct, 2)
            })

        # CREDIT CAPACITY DISTRIBUTION (L1 vs L2)
        credit_capacity = []
        try:
            total_count = query.count()
            if total_count > 0:
                rows = (
                    db.execute(
                        """
                        SELECT 
                            Credit_Worthiness AS group_name,
                            COUNT(*) AS total
                        FROM loans
                        WHERE (:month IS NULL OR Month = :month)
                        AND (:year IS NULL OR Year = :year)
                        GROUP BY Credit_Worthiness;
                        """,
                        {"month": month_name if month else None, "year": year},
                    )
                ).fetchall()

                for r in rows:
                    percentage = (r.total / total_count) * 100
                    credit_capacity.append(
                        {
                            "group_name": r.group_name,
                            "percentage": round(percentage, 2)
                        }
                    )
        except Exception as e:
            print("Error computing credit capacity:", e)
            credit_capacity = []

        return {
            "total_active_loans": total_active,
            "avg_overdue_rate_percent": round((overdue / total) * 100, 2),
            "total_overdue_amount": round(total_overdue_amount, 2),
            "recovery_rate_percent": round(((total - overdue) / total) * 100, 2),
            "gender_risk": group_rate(lambda x: x.Gender),
            "region_risk": group_rate(lambda x: x.Region),
            "loan_type_limit": group_rate(
                lambda x: (
                    x.loan_type,
                    "CF" if safe_limit(getattr(x, "loan_limit", 0)) >= 500000 else "NCF",
                )
            ),
            "loan_purpose": group_rate(lambda x: x.loan_purpose),
            "special_terms": group_rate(lambda x: x.interest_only),
            "occupancy_risk": group_rate(lambda x: x.occupancy_type),
            "submission_risk": group_rate(lambda x: x.submission_of_application),
            "credit_capacity": credit_capacity_dist,
            "model_accuracy": 90.4,
        }
        

    except Exception as e:
        print("DATABASE ERROR in get_dashboard_data:", str(e))
        traceback.print_exc()
        return {"error": "Database query failed", "details": str(e)}


def get_empty_data():
    return {
        "total_active_loans": 0,
        "avg_overdue_rate_percent": 0.0,
        "total_overdue_amount": 0.0,
        "recovery_rate_percent": 0.0,
        "gender_risk": [],
        "region_risk": [],
        "credit_capacity": [],
        "loan_type_limit": [],
        "loan_purpose": [],
        "special_terms": [],
        "occupancy_risk": [],
        "submission_risk": [],
        "model_accuracy": 90.4,
    }


def get_user_by_username(db: Session, username: str):
    return db.query(models.Employee).filter(models.Employee.username == username).first()
def get_loans(db: Session):
    return db.query(models.Loan).all()
