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

class LoanResponse(BaseModel):
    id: int
    Month: str
    Gender: str
    age: str
    Region: str
    submission_of_application: str | None = None
    approv_in_adv: str | None = None
    income: float | None = None
    Credit_Score: float | None = None
    credit_type: str | None = None
    co_applicant_credit_type: str | None = None
    Credit_Worthiness: str | None = None
    open_credit: str | None = None
    loan_type: str | None = None
    loan_purpose: str | None = None
    loan_amount: float | None = None
    term: str | None = None
    rate_of_interest: float | None = None
    loan_limit: float | None = None
    business_or_commercial: str | None = None
    LTV: float | None = None
    Secured_by: str | None = None
    Security_Type: str | None = None
    construction_type: str | None = None
    occupancy_type: str | None = None
    total_units: str | None = None
    Neg_ammortization: str | None = None
    interest_only: str | None = None
    lump_sum_payment: str | None = None
    prediction: int | None = None
    probability: float | None = None
    Year: int | None = None

    class Config:
        orm_mode = True

