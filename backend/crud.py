from sqlalchemy.orm import Session
from collections import defaultdict
import traceback
from datetime import datetime
from sqlalchemy import text

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

from sqlalchemy import text
from typing import Optional

def get_dashboard_data(db: Session, month: Optional[str] = None, year: Optional[int] = None):
    data = {}

    # -------------------------
    # 0. WHERE DYNAMIC (FILTER)
    # -------------------------
    conditions = ["1=1"]
    params = {}

    if month:
        conditions.append("Month = :month")
        params["month"] = month   # VD: "October"

    if year:
        conditions.append("Year = :year")
        params["year"] = year     # VD: 2025

    where_clause = " AND ".join(conditions)

    # -------------------------
    # I. KPI DASHBOARD
    # -------------------------
    kpi = {}

    # 1. Total Loans
    sql_total_loans = f"""
        SELECT COUNT(id) AS total_loans
        FROM loans
        WHERE {where_clause};
    """
    row = db.execute(text(sql_total_loans), params).fetchone()
    kpi["total_loans"] = int(row.total_loans or 0)

    # 2. Avg Credit Score
    sql_avg_cs = f"""
        SELECT AVG(Credit_Score) AS avg_credit_score
        FROM loans
        WHERE {where_clause};
    """
    row = db.execute(text(sql_avg_cs), params).fetchone()
    kpi["avg_credit_score"] = float(row.avg_credit_score) if row.avg_credit_score is not None else None

    # 3. Avg Loan Amount
    sql_avg_la = f"""
        SELECT AVG(loan_amount) AS avg_loan_amount
        FROM loans
        WHERE {where_clause};
    """
    row = db.execute(text(sql_avg_la), params).fetchone()
    kpi["avg_loan_amount"] = float(row.avg_loan_amount) if row.avg_loan_amount is not None else None

    # 4. Default Rate (%)
    sql_default_rate = f"""
        SELECT (SUM(prediction) / COUNT(*)) * 100 AS default_rate_percent
        FROM loans
        WHERE {where_clause};
    """
    row = db.execute(text(sql_default_rate), params).fetchone()
    kpi["default_rate_percent"] = float(row.default_rate_percent) if row.default_rate_percent is not None else 0.0

    # 5. Model accuracy (cố định)
    kpi["model_accuracy"] = 93.40

    data["kpi"] = kpi

    # -------------------------
    # II. DEMOGRAPHICS
    # -------------------------
    data["demographics"] = {}

    # 2.1 Gender
    sql_gender = f"""
        SELECT
            Gender,
            COUNT(*) AS total_loans,
            SUM(prediction) AS default_count,
            (SUM(prediction) / COUNT(*)) * 100 AS default_rate_percent,
            AVG(probability) AS avg_probability
        FROM loans
        WHERE {where_clause}
        GROUP BY Gender;
    """
    data["demographics"]["gender"] = [
        dict(row._mapping)
        for row in db.execute(text(sql_gender), params).fetchall()
    ]

    # 2.2 Age Group
    sql_age = f"""
        SELECT
            CASE
                WHEN age < 25 THEN '<25'
                WHEN age BETWEEN 25 AND 34 THEN '25-34'
                WHEN age BETWEEN 35 AND 44 THEN '35-44'
                WHEN age BETWEEN 45 AND 54 THEN '45-54'
                WHEN age BETWEEN 55 AND 64 THEN '55-64'
                WHEN age BETWEEN 65 AND 74 THEN '65-74'
                ELSE '>74'
            END AS age_group,
            COUNT(*) AS total_loans,
            (SUM(prediction) / COUNT(*)) * 100 AS default_rate_percent,
            AVG(Credit_Score) AS avg_credit_score
        FROM loans
        WHERE {where_clause}
        GROUP BY age_group
        ORDER BY
            CASE
                WHEN age_group = '<25' THEN 1
                WHEN age_group = '25-34' THEN 2
                WHEN age_group = '35-44' THEN 3
                WHEN age_group = '45-54' THEN 4
                WHEN age_group = '55-64' THEN 5
                WHEN age_group = '65-74' THEN 6
                WHEN age_group = '>74' THEN 7
            END;
    """
    data["demographics"]["age_group"] = [
        dict(row._mapping)
        for row in db.execute(text(sql_age), params).fetchall()
    ]

    # 2.3 Region
    sql_region = f"""
        SELECT
            Region,
            COUNT(*) AS total_loans,
            AVG(probability) AS avg_probability,
            (SUM(prediction) / COUNT(*)) * 100 AS default_rate_percent
        FROM loans
        WHERE {where_clause}
        GROUP BY Region;
    """
    data["demographics"]["region"] = [
        dict(row._mapping)
        for row in db.execute(text(sql_region), params).fetchall()
    ]

    # -------------------------
    # III. LOAN CHARACTERISTICS
    # -------------------------
    data["loan_characteristics"] = {}

    # 3.1 Loan Type
    sql_loan_type = f"""
        SELECT
            loan_type,
            COUNT(*) AS total_loans,
            (SUM(prediction) / COUNT(*)) * 100 AS default_rate_percent,
            AVG(rate_of_interest) AS avg_interest_rate
        FROM loans
        WHERE {where_clause}
        GROUP BY loan_type
        ORDER BY loan_type;
    """
    data["loan_characteristics"]["loan_type"] = [
        dict(row._mapping)
        for row in db.execute(text(sql_loan_type), params).fetchall()
    ]

    # 3.2 Loan Purpose
    sql_purpose = f"""
        SELECT
            loan_purpose AS purpose,
            COUNT(*) AS loan_count,
            (SUM(prediction) / COUNT(*)) * 100 AS default_rate_percent,
            AVG(probability) AS avg_probability
        FROM loans
        WHERE {where_clause}
        GROUP BY loan_purpose
        ORDER BY loan_purpose;
    """
    data["loan_characteristics"]["purpose"] = [
        dict(row._mapping)
        for row in db.execute(text(sql_purpose), params).fetchall()
    ]

    # 3.3 Interest Rate vs Default
    sql_interest = f"""
        SELECT
            rate_of_interest,
            AVG(probability) AS avg_probability,
            (SUM(prediction) / COUNT(*)) * 100 AS default_rate_percent
        FROM loans
        WHERE {where_clause}
        GROUP BY rate_of_interest
        ORDER BY rate_of_interest;
    """
    data["loan_characteristics"]["interest_rate"] = [
        dict(row._mapping)
        for row in db.execute(text(sql_interest), params).fetchall()
    ]

    # 3.4 Loan Amount Group
    sql_amount_group = f"""
        SELECT
            CASE
                WHEN loan_amount < 300000 THEN '<300k'
                WHEN loan_amount >= 300000 AND loan_amount < 900000 THEN '300k-900k'
                WHEN loan_amount >= 900000 AND loan_amount <= 2000000 THEN '900k-2M'
                ELSE '>2M'
            END AS loan_amount_group,
            COUNT(*) AS total_loans,
            AVG(loan_amount) AS avg_loan_amount,
            (SUM(prediction) / COUNT(*)) * 100 AS default_rate_percent,
            AVG(probability) AS avg_probability
        FROM loans
        WHERE {where_clause}
        GROUP BY loan_amount_group
        ORDER BY
            CASE
                WHEN loan_amount_group = '<300k' THEN 1
                WHEN loan_amount_group = '300k-900k' THEN 2
                WHEN loan_amount_group = '900k-2M' THEN 3
                WHEN loan_amount_group = '>2M' THEN 4
            END;
    """
    data["loan_characteristics"]["loan_amount_group"] = [
        dict(row._mapping)
        for row in db.execute(text(sql_amount_group), params).fetchall()
    ]

    # -------------------------
    # IV. COLLATERAL & APPLICATION
    # -------------------------
    data["collateral_application"] = {}

    # 4.1 Submission Method
    sql_submission = f"""
        SELECT
            submission_of_application AS submission,
            approv_in_adv AS pre_approval,
            (SUM(prediction) / COUNT(*)) * 100 AS default_rate_percent,
            AVG(probability) AS avg_probability
        FROM loans
        WHERE {where_clause}
        GROUP BY submission_of_application, approv_in_adv
        ORDER BY submission_of_application, pre_approval;
    """
    data["collateral_application"]["submission_method"] = [
        dict(row._mapping)
        for row in db.execute(text(sql_submission), params).fetchall()
    ]

    # 4.2 Occupancy Type
    sql_occupancy = f"""
        SELECT
            occupancy_type,
            (SUM(prediction) / COUNT(*)) * 100 AS default_rate_percent,
            AVG(probability) AS avg_probability
        FROM loans
        WHERE {where_clause}
        GROUP BY occupancy_type;
    """
    data["collateral_application"]["occupancy_type"] = [
        dict(row._mapping)
        for row in db.execute(text(sql_occupancy), params).fetchall()
    ]

    # 4.3 Secured_by
    sql_secured = f"""
        SELECT
            Secured_by,
            (SUM(prediction) / COUNT(*)) * 100 AS default_rate_percent,
            AVG(loan_amount) AS avg_loan_amount
        FROM loans
        WHERE {where_clause}
        GROUP BY Secured_by;
    """
    data["collateral_application"]["secured_by"] = [
        dict(row._mapping)
        for row in db.execute(text(sql_secured), params).fetchall()
    ]

    return data



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
        "model_accuracy": 93.4,
    }


def get_user_by_username(db: Session, username: str):
    return db.query(models.Employee).filter(models.Employee.username == username).first()
def get_loans(db: Session):
    return db.query(models.Loan).all()
