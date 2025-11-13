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

    filtered_data["Month"] = datetime.now().strftime("%B")
    filtered_data["Year"] = datetime.now().year


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


    # Chuyển đổi lại để hiển thị CF/NCF
    if hasattr(db_loan, "loan_limit") and isinstance(db_loan.loan_limit, (int, float)):
        val = db_loan.loan_limit
        if val == 0 or val == 0.0:
            db_loan.loan_limit = "ncf"
        elif val >= 500000:
            db_loan.loan_limit = "cf"
        else:
            db_loan.loan_limit = str(val)


    return db_loan





def safe_limit(val):
    """Chuyển giá trị loan_limit về float an toàn"""
    try:
        return float(val)
    except Exception:
        return 0.0




def get_dashboard_data(db: Session, month: str = None, year: int = None):
    try:
        query = db.query(models.Loan)


        if month:
            query = query.filter(models.Loan.Month == month)


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
        "loan_type_limit": [],
        "loan_purpose": [],
        "special_terms": [],
        "occupancy_risk": [],
        "submission_risk": [],
        "model_accuracy": 90.4,
    }



def get_user_by_username(db: Session, username: str):
    return db.query(models.Employee).filter(models.Employee.username == username).first()
