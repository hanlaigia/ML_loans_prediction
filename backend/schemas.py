from pydantic import BaseModel
from typing import Optional

class LoanBase(BaseModel):
    loan_limit: Optional[str] = None
    Gender: Optional[str] = None
    approv_in_adv: Optional[str] = None
    loan_type: Optional[str] = None
    loan_purpose: Optional[str] = None
    Credit_Worthiness: Optional[str] = None
    open_credit: Optional[str] = None
    business_or_commercial: Optional[str] = None
    loan_amount: Optional[float] = None
    rate_of_interest: Optional[float] = None
    rate_of_interest_monthly: Optional[float] = None   # ✅ thêm dòng này
    Interest_rate_spread: Optional[float] = None
    Upfront_charges: Optional[float] = None
    term: Optional[float] = None
    Neg_ammortization: Optional[str] = None
    interest_only: Optional[str] = None
    lump_sum_payment: Optional[str] = None
    property_value: Optional[float] = None
    construction_type: Optional[str] = None
    occupancy_type: Optional[str] = None
    Secured_by: Optional[str] = None
    total_units: Optional[str] = None
    income: Optional[float] = None
    credit_type: Optional[str] = None
    Credit_Score: Optional[int] = None
    co_applicant_credit_type: Optional[str] = None     # ✅ sửa lại đúng cú pháp
    age: Optional[float] = None                        # ✅ đổi thành số
    submission_of_application: Optional[str] = None
    LTV: Optional[float] = None
    Region: Optional[str] = None
    Security_Type: Optional[str] = None
    Status: Optional[int] = None                       # ✅ thêm field này
    dtir1: Optional[float] = None

class LoanCreate(LoanBase):
    prediction: Optional[int] = None
    probability: Optional[float] = None
    risk_level: Optional[str] = None

class LoanResponse(LoanCreate):
    ID: Optional[int] = None

    class Config:
        from_attributes = True

