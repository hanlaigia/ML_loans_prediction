from sqlalchemy import Column, String, Float, Integer, Double
from database import Base

class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, autoincrement=True)

    Month = Column(String(20), nullable=True)
    Year = Column(Integer, nullable=True)
    Gender = Column(String(10), nullable=True)
    age = Column(String(10), nullable=True)
    Region = Column(String(50), nullable=True)
    submission_of_application = Column(String(10), nullable=True)
    approv_in_adv = Column(String(10), nullable=True)
    income = Column(Double, nullable=True)
    Credit_Score = Column(Double, nullable=True)
    credit_type = Column(String(50), nullable=True)
    co_applicant_credit_type = Column(String(50), nullable=True)
    Credit_Worthiness = Column(String(50), nullable=True)
    open_credit = Column(String(10), nullable=True)
    loan_type = Column(String(50), nullable=True)
    loan_purpose = Column(String(100), nullable=True)
    loan_amount = Column(Double, nullable=True)
    term = Column(String(20), nullable=True)
    rate_of_interest = Column(Double, nullable=True)
    loan_limit = Column(Double, nullable=True)
    business_or_commercial = Column(String(10), nullable=True)
    LTV = Column(Double, nullable=True)
    Secured_by = Column(String(50), nullable=True)
    Security_Type = Column(String(50), nullable=True)
    construction_type = Column(String(50), nullable=True)
    occupancy_type = Column(String(50), nullable=True)
    total_units = Column(String(10), nullable=True)
    Neg_ammortization = Column(String(10), nullable=True)
    interest_only = Column(String(10), nullable=True)
    lump_sum_payment = Column(String(10), nullable=True)
    prediction = Column(Integer, nullable=True)
    probability = Column(Float, nullable=True)

# Employee Model for Login

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_code = Column(String(20), unique=True, nullable=False)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(50), nullable=True) 
    full_name = Column(String(100))
    email = Column(String(100))
    phone = Column(String(20))
    role = Column(String(50), default="staff")
