"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// Import individual components
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import {
  AlertCircle,
  FileText,
  Download,
  RotateCcw,
  BarChart3,
  LogOut,
} from "lucide-react"

/* ============================================================= */
/* 1. MAPPINGS – Short code → Full name (UI display)            */
/* ============================================================= */
const mappings = {
  loan_limit: { cf: "Conforming", ncf: "Non-conforming" },
  approv_in_adv: { pre: "Pre-approved", nopre: "Not Pre-approved" },
  loan_type: {
    type1: "Conventional Loans",
    type2: "Government-Backed Loans",
    type3: "Non-Conventional Loans",
  },
  loan_purpose: {
    p1: "Home Purchase",
    p2: "Home Improvement",
    p3: "Refinancing",
    p4: "Investment Property",
  },
  Credit_Worthiness: { l1: "Level 1", l2: "Level 2" },
  open_credit: { opc: "Opened", nopc: "Not Opened" },
  business_or_commercial: { "b/c": "Business/Commercial", "nob/c": "Personal" },
  Neg_ammortization: {
    neg_amm: "Negative Amortization",
    not_neg: "Non-negative Amortization",
  },
  interest_only: { int_only: "Interest-only", not_int: "Non-interest-only" },
  lump_sum_payment: {
    lpsm: "Lump Sum Payment",
    not_lpsm: "No Lump Sum Payment",
  },
  construction_type: { sb: "Site Built", mh: "Manufactured Home" },
  occupancy_type: {
    pr: "Primary Residence",
    sr: "Secondary Residence",
    ir: "Investment Property",
  },
  total_units: {
    "1U": "1 Unit",
    "2U": "2 Units",
    "3U": "3 Units",
    "4U": "4 Units",
  },
  credit_type: { CIB: "CIB", CRIF: "CRIF", EXP: "EXP", EQUI: "EQUI" },
  co_applicant_credit_type: { CIB: "CIB", EXP: "EXP" },
  submission_of_application: {
    to_inst: "to Institution",
    not_inst: "Not to Institution",
  },
}

// Gender mapping: lowercase value → display label
const genderMapping = {
  female: "Female",
  male: "Male",
  joint: "Joint",
  "sex not available": "Sex Not Available",
}

/* ============================================================= */
/* 2. AGE MAPPING – Age group → Average value                   */
/* ============================================================= */
const ageGroupToValue: Record<string, number> = {
  "<25": 20,
  "25-34": 29.5,
  "35-44": 39.5,
  "45-54": 49.5,
  "55-64": 59.5,
  "65-74": 69.5,
  ">74": 80,
}

const ageValueToGroup = (value: number): string => {
  if (value <= 20) return "<25"
  if (value <= 29.5) return "25-34"
  if (value <= 39.5) return "35-44"
  if (value <= 49.5) return "45-54"
  if (value <= 59.5) return "55-64"
  if (value <= 69.5) return "65-74"
  return ">74"
}

/* ============================================================= */
/* 3. MAIN COMPONENT                                            */
/* ============================================================= */
export default function LoanPredictFullUI() {
  const router = useRouter()

  /* ------------------- Authentication ------------------- */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLoggedIn = localStorage.getItem("isLoggedIn")
      if (!isLoggedIn) router.replace("/login")
    }
  }, [router])

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  /* ------------------- Form State – COMPLETELY EMPTY ------------------- */
  const [form, setForm] = useState({
    loan_limit: "",
    Gender: "",
    approv_in_adv: "",
    loan_type: "",
    loan_purpose: "",
    Credit_Worthiness: "",
    open_credit: "",
    business_or_commercial: "",
    loan_amount: 0,
    rate_of_interest: 0,
    rate_of_interest_monthly: 0,
    Interest_rate_spread: 0,
    Upfront_charges: 0,
    term: 0,
    Neg_ammortization: "",
    interest_only: "",
    lump_sum_payment: "",
    property_value: 0,
    construction_type: "",
    occupancy_type: "",
    Secured_by: "",
    total_units: "",
    income: 0,
    credit_type: "",
    Credit_Score: 0,
    co_applicant_credit_type: "",
    age: 0,
    submission_of_application: "",
    LTV: 0,
    Region: "",
    Security_Type: "",
    Status: 0,
    dtir1: 0,
  })

  const [predicting, setPredicting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [openItems, setOpenItems] = useState<string[]>([])

  const handleChange = (key: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  /* ------------------- Predict ------------------- */
  const handlePredict = async () => {
    // Required fields validation
    const required = ["Gender", "age", "income", "loan_amount", "term", "rate_of_interest"]
    for (const field of required) {
      if (!form[field as keyof typeof form]) {
        alert(`Please enter ${field === "age" ? "Age" : field.replace(/_/g, " ")}`)
        return
      }
    }

    try {
      setPredicting(true)
      console.log("Sending payload:", form)

      const res = await fetch(`${apiUrl}/loans/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Prediction failed: ${res.status} – ${txt}`)
      }

      const data = await res.json()
      const probability = data.probability ?? 0
      const riskLevel =
        data.riskLevel ??
        (probability >= 0.7 ? "High Risk" : probability >= 0.4 ? "Medium Risk" : "Low Risk")

      setResult({ ...data, probability, riskLevel, factors: data.factors ?? [] })
    } catch (e: any) {
      alert(e.message)
    } finally {
      setPredicting(false)
    }
  }

  /* ------------------- Save ------------------- */
  const handleSave = async () => {
    if (!result) return alert("Please predict first!")
    try {
      setSaving(true)
      const payload = {
        ...form,
        prediction: result.prediction,
        probability: result.probability,
        risk_level: result.riskLevel,
      }
      const res = await fetch(`${apiUrl}/loans/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Save failed: ${await res.text()}`)
      const d = await res.json()
      alert(`Saved successfully! ID: ${d.ID}`)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleClear = () => setResult(null)
  const handleLogout = () => {
    localStorage.clear()
    router.push("/login")
  }

  /* ------------------- Render ------------------- */
  return (
    <div className="min-h-dvh bg-transparent">
      {/* Header */}
      <header className="border-b border-border bg-card/100 backdrop-blur-md">
        <div className="container mx-auto flex h-12 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <h1 className="font-semibold text-foreground">
              Loan Default Prediction System
            </h1>
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <button className="hover:text-foreground transition-colors">
                System
              </button>
              <span>|</span>
              <button className="hover:text-foreground transition-colors">
                Help
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild className="gap-2 bg-transparent">
              <a href="/dashboard">
                <BarChart3 className="h-4 w-4" />
                Statistics Dashboard
              </a>
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2 bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          {/* 1. Input Form */}
          <Card className="bg-card/90 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg">
                1. Enter Loan Application Data
              </CardTitle>
              <CardDescription>
                Fill in all fields for accurate prediction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion
                type="multiple"
                value={openItems}
                onValueChange={setOpenItems}
                className="w-full"
              >
                {/* PERSONAL INFORMATION */}
                <AccordionItem value="personal">
                  <AccordionTrigger
                    className={`text-base font-medium transition-all duration-300 ${
                      openItems.includes("personal")
                        ? "pl-8 pr-4 bg-gradient-to-r from-blue-300/60 via-blue-200/30 to-transparent rounded-r-lg shadow-sm"
                        : ""
                    }`}
                  >
                    Personal Information
                  </AccordionTrigger>
                  <AccordionContent>
                    <fieldset className="rounded-2xl border border-border/100 bg-card/60 backdrop-blur p-4 md:p-6 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        {/* Gender – FIXED */}
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender *</Label>
                          <Select
                            value={form.Gender}
                            onValueChange={(v) => handleChange("Gender", v)}
                          >
                            <SelectTrigger id="gender">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(genderMapping).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Age */}
                        <div className="space-y-2">
                          <Label htmlFor="age">Age *</Label>
                          <Select
                            value={form.age ? ageValueToGroup(form.age) : ""}
                            onValueChange={(v) =>
                              handleChange("age", ageGroupToValue[v])
                            }
                          >
                            <SelectTrigger id="age">
                              <SelectValue placeholder="Select age group" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(ageGroupToValue).map((group) => (
                                <SelectItem key={group} value={group}>
                                  {group}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Region */}
                        <div className="space-y-2">
                          <Label htmlFor="region">Region</Label>
                          <Select
                            value={form.Region}
                            onValueChange={(v) => handleChange("Region", v)}
                          >
                            <SelectTrigger id="region">
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="south">South</SelectItem>
                              <SelectItem value="north">North</SelectItem>
                              <SelectItem value="central">Central</SelectItem>
                              <SelectItem value="north-east">North-East</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Submission of Application */}
                        <div className="space-y-2">
                          <Label htmlFor="submission">
                            Submission of Application
                          </Label>
                          <Select
                            value={form.submission_of_application}
                            onValueChange={(v) =>
                              handleChange("submission_of_application", v)
                            }
                          >
                            <SelectTrigger id="submission">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(
                                mappings.submission_of_application
                              ).map(([v, l]) => (
                                <SelectItem key={v} value={v}>
                                  {l}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Approval in Advance */}
                        <div className="space-y-2">
                          <Label htmlFor="approval">
                            Approval in Advance
                          </Label>
                          <Select
                            value={form.approv_in_adv}
                            onValueChange={(v) =>
                              handleChange("approv_in_adv", v)
                            }
                          >
                            <SelectTrigger id="approval">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(mappings.approv_in_adv).map(
                                ([v, l]) => (
                                  <SelectItem key={v} value={v}>
                                    {l}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </fieldset>
                  </AccordionContent>
                </AccordionItem>

                {/* FINANCIAL & CREDIT */}
                <AccordionItem value="financial">
                  <AccordionTrigger
                    className={`text-base font-medium transition-all duration-300 ${
                      openItems.includes("financial")
                        ? "pl-8 pr-4 bg-gradient-to-r from-blue-300/60 via-blue-200/30 to-transparent rounded-r-lg shadow-sm"
                        : ""
                    }`}
                  >
                    Financial & Credit Information
                  </AccordionTrigger>
                  <AccordionContent>
                    <fieldset className="rounded-2xl border border-border/100 bg-card/60 backdrop-blur p-4 md:p-6 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="income">Income *</Label>
                          <Input
                            id="income"
                            type="number"
                            placeholder="e.g. 7200"
                            value={form.income || ""}
                            onChange={(e) =>
                              handleChange("income", Number(e.target.value) || 0)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="credit-score">Credit Score</Label>
                          <Input
                            id="credit-score"
                            type="number"
                            placeholder="e.g. 690"
                            value={form.Credit_Score || ""}
                            onChange={(e) =>
                              handleChange(
                                "Credit_Score",
                                Number(e.target.value) || 0
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="credit-type">Credit Type</Label>
                          <Select
                            value={form.credit_type}
                            onValueChange={(v) =>
                              handleChange("credit_type", v)
                            }
                          >
                            <SelectTrigger id="credit-type">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(mappings.credit_type).map(
                                ([v, l]) => (
                                  <SelectItem key={v} value={v}>
                                    {l}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="co-applicant-credit-type">
                            Co-Applicant Credit Type
                          </Label>
                          <Select
                            value={form.co_applicant_credit_type}
                            onValueChange={(v) =>
                              handleChange("co_applicant_credit_type", v)
                            }
                          >
                            <SelectTrigger id="co-applicant-credit-type">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(
                                mappings.co_applicant_credit_type
                              ).map(([v, l]) => (
                                <SelectItem key={v} value={v}>
                                  {l}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="credit-worthiness">
                            Credit Worthiness
                          </Label>
                          <Select
                            value={form.Credit_Worthiness}
                            onValueChange={(v) =>
                              handleChange("Credit_Worthiness", v)
                            }
                          >
                            <SelectTrigger id="credit-worthiness">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(mappings.Credit_Worthiness).map(
                                ([v, l]) => (
                                  <SelectItem key={v} value={v}>
                                    {l}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="open-credit">Open Credit</Label>
                          <Select
                            value={form.open_credit}
                            onValueChange={(v) =>
                              handleChange("open_credit", v)
                            }
                          >
                            <SelectTrigger id="open-credit">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(mappings.open_credit).map(
                                ([v, l]) => (
                                  <SelectItem key={v} value={v}>
                                    {l}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dtir1">DTI Ratio (dtir1)</Label>
                          <Input
                            id="dtir1"
                            type="number"
                            step="0.1"
                            placeholder="e.g. 47.0"
                            value={form.dtir1 || ""}
                            onChange={(e) =>
                              handleChange("dtir1", Number(e.target.value) || 0)
                            }
                          />
                        </div>
                      </div>
                    </fieldset>
                  </AccordionContent>
                </AccordionItem>

                {/* LOAN DETAILS */}
                <AccordionItem value="loan">
                  <AccordionTrigger
                    className={`text-base font-medium transition-all duration-300 ${
                      openItems.includes("loan")
                        ? "pl-8 pr-4 bg-gradient-to-r from-blue-300/60 via-blue-200/30 to-transparent rounded-r-lg shadow-sm"
                        : ""
                    }`}
                  >
                    Loan Details
                  </AccordionTrigger>
                  <AccordionContent>
                    <fieldset className="rounded-2xl border border-border/100 bg-card/60 backdrop-blur p-4 md:p-6 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="loan-type">Loan Type</Label>
                          <Select
                            value={form.loan_type}
                            onValueChange={(v) =>
                              handleChange("loan_type", v)
                            }
                          >
                            <SelectTrigger id="loan-type">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(mappings.loan_type).map(
                                ([v, l]) => (
                                  <SelectItem key={v} value={v}>
                                    {l}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="loan-purpose">Loan Purpose</Label>
                          <Select
                            value={form.loan_purpose}
                            onValueChange={(v) =>
                              handleChange("loan_purpose", v)
                            }
                          >
                            <SelectTrigger id="loan-purpose">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(mappings.loan_purpose).map(
                                ([v, l]) => (
                                  <SelectItem key={v} value={v}>
                                    {l}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="loan-amount">Loan Amount *</Label>
                          <Input
                            id="loan-amount"
                            type="number"
                            placeholder="e.g. 250000"
                            value={form.loan_amount || ""}
                            onChange={(e) =>
                              handleChange(
                                "loan_amount",
                                Number(e.target.value) || 0
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="term">Term (months) *</Label>
                          <Input
                            id="term"
                            type="number"
                            placeholder="e.g. 360"
                            value={form.term || ""}
                            onChange={(e) =>
                              handleChange("term", Number(e.target.value) || 0)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="rate-of-interest">
                            Rate of Interest (%) *
                          </Label>
                          <Input
                            id="rate-of-interest"
                            type="number"
                            step="0.01"
                            placeholder="e.g. 5.2"
                            value={form.rate_of_interest || ""}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0
                              handleChange("rate_of_interest", val)
                              handleChange(
                                "rate_of_interest_monthly",
                                val / 12 / 100
                              )
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="interest-rate-spread">
                            Interest Rate Spread
                          </Label>
                          <Input
                            id="interest-rate-spread"
                            type="number"
                            step="0.01"
                            placeholder="e.g. 0.4"
                            value={form.Interest_rate_spread || ""}
                            onChange={(e) =>
                              handleChange(
                                "Interest_rate_spread",
                                Number(e.target.value) || 0
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="upfront-charges">
                            Upfront Charges
                          </Label>
                          <Input
                            id="upfront-charges"
                            type="number"
                            step="0.01"
                            placeholder="e.g. 600"
                            value={form.Upfront_charges || ""}
                            onChange={(e) =>
                              handleChange(
                                "Upfront_charges",
                                Number(e.target.value) || 0
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="loan-limit">Loan Limit</Label>
                          <Select
                            value={form.loan_limit}
                            onValueChange={(v) =>
                              handleChange("loan_limit", v)
                            }
                          >
                            <SelectTrigger id="loan-limit">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(mappings.loan_limit).map(
                                ([v, l]) => (
                                  <SelectItem key={v} value={v}>
                                    {l}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="business-commercial">
                            Business or Commercial
                          </Label>
                          <Select
                            value={form.business_or_commercial}
                            onValueChange={(v) =>
                              handleChange("business_or_commercial", v)
                            }
                          >
                            <SelectTrigger id="business-commercial">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(
                                mappings.business_or_commercial
                              ).map(([v, l]) => (
                                <SelectItem key={v} value={v}>
                                  {l}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ltv">LTV (%)</Label>
                          <Input
                            id="ltv"
                            type="number"
                            step="0.1"
                            placeholder="e.g. 83.3"
                            value={form.LTV || ""}
                            onChange={(e) =>
                              handleChange("LTV", Number(e.target.value) || 0)
                            }
                          />
                        </div>
                      </div>
                    </fieldset>
                  </AccordionContent>
                </AccordionItem>

                {/* COLLATERAL & CONDITIONS */}
                <AccordionItem value="collateral">
                  <AccordionTrigger
                    className={`text-base font-medium transition-all duration-300 ${
                      openItems.includes("collateral")
                        ? "pl-8 pr-4 bg-gradient-to-r from-blue-300/60 via-blue-200/30 to-transparent rounded-r-lg shadow-sm"
                        : ""
                    }`}
                  >
                    Collateral & Loan Conditions
                  </AccordionTrigger>
                  <AccordionContent>
                    <fieldset className="rounded-2xl border border-border/100 bg-card/60 backdrop-blur p-4 md:p-6 shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        <div className="space-y-2">
                          <Label htmlFor="secured-by">Secured By</Label>
                          <Select
                            value={form.Secured_by}
                            onValueChange={(v) =>
                              handleChange("Secured_by", v)
                            }
                          >
                            <SelectTrigger id="secured-by">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="home">Home</SelectItem>
                              <SelectItem value="land">Land</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="security-type">
                            Security Type
                          </Label>
                          <Select
                            value={form.Security_Type}
                            onValueChange={(v) =>
                              handleChange("Security_Type", v)
                            }
                          >
                            <SelectTrigger id="security-type">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="direct">Direct</SelectItem>
                              <SelectItem value="indirect">
                                Indirect
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="construction-type">
                            Construction Type
                          </Label>
                          <Select
                            value={form.construction_type}
                            onValueChange={(v) =>
                              handleChange("construction_type", v)
                            }
                          >
                            <SelectTrigger id="construction-type">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(mappings.construction_type).map(
                                ([v, l]) => (
                                  <SelectItem key={v} value={v}>
                                    {l}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="occupancy-type">
                            Occupancy Type
                          </Label>
                          <Select
                            value={form.occupancy_type}
                            onValueChange={(v) =>
                              handleChange("occupancy_type", v)
                            }
                          >
                            <SelectTrigger id="occupancy-type">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(mappings.occupancy_type).map(
                                ([v, l]) => (
                                  <SelectItem key={v} value={v}>
                                    {l}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="total-units">Total Units</Label>
                          <Select
                            value={form.total_units}
                            onValueChange={(v) =>
                              handleChange("total_units", v)
                            }
                          >
                            <SelectTrigger id="total-units">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(mappings.total_units).map(
                                ([v, l]) => (
                                  <SelectItem key={v} value={v}>
                                    {l}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="negative-amortization">
                            Negative Amortization
                          </Label>
                          <Select
                            value={form.Neg_ammortization}
                            onValueChange={(v) =>
                              handleChange("Neg_ammortization", v)
                            }
                          >
                            <SelectTrigger id="negative-amortization">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(mappings.Neg_ammortization).map(
                                ([v, l]) => (
                                  <SelectItem key={v} value={v}>
                                    {l}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="interest-only">
                            Interest Only
                          </Label>
                          <Select
                            value={form.interest_only}
                            onValueChange={(v) =>
                              handleChange("interest_only", v)
                            }
                          >
                            <SelectTrigger id="interest-only">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(mappings.interest_only).map(
                                ([v, l]) => (
                                  <SelectItem key={v} value={v}>
                                    {l}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lump-sum-payment">
                            Lump Sum Payment
                          </Label>
                          <Select
                            value={form.lump_sum_payment}
                            onValueChange={(v) =>
                              handleChange("lump_sum_payment", v)
                            }
                          >
                            <SelectTrigger id="lump-sum-payment">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(mappings.lump_sum_payment).map(
                                ([v, l]) => (
                                  <SelectItem key={v} value={v}>
                                    {l}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="property-value">
                            Property Value
                          </Label>
                          <Input
                            id="property-value"
                            type="number"
                            placeholder="e.g. 300000"
                            value={form.property_value || ""}
                            onChange={(e) =>
                              handleChange(
                                "property_value",
                                Number(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                      </div>
                    </fieldset>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* 2. PREDICTION */}
          <Card className="bg-card/90 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg">
                2. Generate Prediction
              </CardTitle>
              <CardDescription>
                Run the ML model to predict default risk
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                onClick={handlePredict}
                disabled={predicting}
                className="gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                {predicting ? "Predicting..." : "Predict Default Risk"}
              </Button>

              {result && (
                <div className="space-y-4">
                  <Card className="border-warning bg-warning/5">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Prediction Result
                          </p>
                          <p className="text-2xl font-bold text-warning-foreground">
                            Default Risk Probability: {(result.probability * 100).toFixed(2)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-1">
                            Risk Level
                          </p>
                          <p className="text-xl font-semibold text-warning-foreground">
                            {result.riskLevel}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {result.factors?.length > 0 && (
                    <Card className="bg-card/70 backdrop-blur-md">
                      <CardHeader>
                        <CardTitle className="text-base">
                          Top Contributing Factors
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {result.factors.map((f: any, i: number) => (
                            <div key={i} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-foreground">
                                  {f.name}
                                </span>
                                <span className="text-muted-foreground">
                                  {f.impact}%
                                </span>
                              </div>
                              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all"
                                  style={{ width: `${f.impact}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. ACTIONS */}
          <Card className="bg-card/90 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg">3. Actions</CardTitle>
              <CardDescription>
                Save, export, or clear the prediction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="gap-2 bg-primary text-primary-foreground"
                >
                  <FileText className="h-4 w-4" />
                  {saving ? "Saving..." : "Save to Database"}
                </Button>

                <Button
                  onClick={() => window.print()}
                  className="gap-2 bg-primary text-primary-foreground"
                >
                  <Download className="h-4 w-4" />
                  Export PDF
                </Button>

                <Button
                  onClick={handleClear}
                  className="gap-2 bg-primary text-primary-foreground"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear Result
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}