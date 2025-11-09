# backend/schemas.py
from pydantic import BaseModel
from typing import Optional

# ==============================
# Loan Schemas
# ==============================

class LoanBase(BaseModel):
    Gender: Optional[str] = None
    Married: Optional[str] = None
    Dependents: Optional[str] = None
    Education: Optional[str] = None
    Self_Employed: Optional[str] = None
    ApplicantIncome: Optional[float] = None
    CoapplicantIncome: Optional[float] = None
    LoanAmount: Optional[float] = None
    Loan_Amount_Term: Optional[float] = None
    Credit_History: Optional[float] = None
    Property_Area: Optional[str] = None
    Loan_Status: Optional[str] = None  # nếu có cột này trong DB


# Schema dùng để tạo mới khoản vay
class LoanCreate(LoanBase):
    pass


# Schema dùng để trả về cho API
class LoanResponse(LoanBase):
    id: int

    class Config:
        orm_mode = True
