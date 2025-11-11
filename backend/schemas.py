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
    term: Optional[float] = None
    Neg_ammortization: Optional[str] = None
    interest_only: Optional[str] = None
    lump_sum_payment: Optional[str] = None
    construction_type: Optional[str] = None
    occupancy_type: Optional[str] = None
    Secured_by: Optional[str] = None
    total_units: Optional[str] = None
    income: Optional[float] = None
    credit_type: Optional[str] = None
    Credit_Score: Optional[float] = None
    co_applicant_credit_type: Optional[str] = None
    age: Optional[float] = None
    submission_of_application: Optional[str] = None
    LTV: Optional[float] = None
    Region: Optional[str] = None
    Security_Type: Optional[str] = None


class LoanCreate(LoanBase):
    age: float
    credit_type: str
    prediction: int
    probability: float


class LoanResponse(LoanBase):
    id: int

    class Config:
        orm_mode = True
