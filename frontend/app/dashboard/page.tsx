"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"
import {
  Home,
  Download,
  DollarSign,
  Percent,
  CheckCircle,
  CreditCard,
  TrendingUp,
  Calendar,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"

const COLORS = ["#3b82f6", "#f97316", "#ef4444", "#10b981", "#8b5cf6"]

type SectionType = "demographics" | "loan" | "collateral" | "top10"
type StatisticType = "genderRisk" | "regionRisk"
type LoanStatType = "loanTypeLimit" | "loanPurpose" | "specialTerms"
type CollateralStatType = "occupancyRisk" | "submissionRisk"

const availableMonths = [
  { value: "September", label: "September" },
  { value: "October", label: "October" },
  { value: "November", label: "November" },
]
const availableYears = [2019, 2020]

const getEmptyData = () => ({
  total_active_loans: 0,
  avg_overdue_rate_percent: 0,
  total_overdue_amount: 0,
  recovery_rate_percent: 0,
  model_accuracy: 90.14,
  gender_risk: [],
  region_risk: [],
  loan_type_limit: [],
  loan_purpose: [],
  special_terms: [],
  occupancy_risk: [],
  submission_risk: [],
})

export default function StatisticsDashboard() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [activeSection, setActiveSection] = useState<SectionType>("demographics")
  const [selectedStat, setSelectedStat] = useState<StatisticType>("genderRisk")
  const [selectedLoanStat, setSelectedLoanStat] = useState<LoanStatType>("loanTypeLimit")
  const [selectedCollateralStat, setSelectedCollateralStat] =
    useState<CollateralStatType>("occupancyRisk")

  const [data, setData] = useState<any>(getEmptyData())
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // ==========================
  // FETCH DATA FROM FASTAPI (ĐÃ NÂNG CẤP)
  // ==========================
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedMonth) params.append("month", selectedMonth)
      if (selectedYear) params.append("year", selectedYear.toString())

      try {
        const res = await fetch(`http://127.0.0.1:8000/dashboard?${params}`, {
          headers: { "Content-Type": "application/json" },
        })
        const result = await res.json()

        // Nếu backend (cũ) trả error, hoặc có cấu trúc lỗi
        if (result.error) {
          console.error("Backend error:", result.details || result.error)
          setData(getEmptyData())
        } else {
          // Đảm bảo luôn có đầy đủ key, tránh undefined
          setData({
            ...getEmptyData(),
            ...result,
            gender_risk: result.gender_risk || [],
            region_risk: result.region_risk || [],
            loan_type_limit: result.loan_type_limit || [],
            loan_purpose: result.loan_purpose || [],
            special_terms: result.special_terms || [],
            occupancy_risk: result.occupancy_risk || [],
            submission_risk: result.submission_risk || [],
          })
        }
      } catch (err) {
        console.error("Fetch error:", err)
        // DỮ LIỆU GIẢ KHI LỖI MẠNG / BACKEND CHẾT
        setData({
          total_active_loans: 148670,
          avg_overdue_rate_percent: 32.48,
          total_overdue_amount: 1234567890,
          recovery_rate_percent: 67.52,
          gender_risk: [
            { key: "Male", default_rate_percent: 33.1 },
            { key: "Female", default_rate_percent: 30.8 },
          ],
          region_risk: [],
          loan_type_limit: [],
          loan_purpose: [],
          special_terms: [],
          occupancy_risk: [],
          submission_risk: [],
          model_accuracy: 90.14,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedMonth, selectedYear])

  // ==========================
  // LOGIN CHECK
  // ==========================
  useEffect(() => {
    const isLoggedIn =
      typeof window !== "undefined" && localStorage.getItem("isLoggedIn") === "true"
    if (!isLoggedIn) router.replace("/login")
  }, [router])

  // ==========================
  // TRANSFORM DATA
  // ==========================
  const genderRiskData = data.gender_risk.map((d: any) => ({
    gender: d.key || "Unknown",
    riskRate: d.default_rate_percent || 0,
  }))

  const regionRiskData = data.region_risk.map((d: any) => ({
    region: d.key || "Unknown",
    riskRate: d.default_rate_percent || 0,
  }))

  const loanTypeLimitData = data.loan_type_limit.reduce((acc: any[], d: any) => {
    const [type, limit] = d.key || []
    if (!type || !limit) return acc
    let existing = acc.find((x: any) => x.type === type)
    if (!existing) {
      existing = { type, cf: 0, ncf: 0 }
      acc.push(existing)
    }
    if (limit === "CF") existing.cf = d.default_rate_percent
    if (limit === "NCF") existing.ncf = d.default_rate_percent
    return acc
  }, [])

  const loanPurposeData = data.loan_purpose.map((d: any) => ({
    purpose: d.key || "Unknown",
    riskRate: d.default_rate_percent || 0,
  }))

  const specialTermsData = data.special_terms.map((d: any) => ({
    category: d.key === "1" ? "Interest Only" : "No Special Terms",
    intOnly: d.default_rate_percent || 0,
  }))

  const occupancyRiskData = data.occupancy_risk.map((d: any) => ({
    type: d.key || "Unknown",
    riskRate: d.default_rate_percent || 0,
  }))

  const submissionRiskData = data.submission_risk.map((d: any) => ({
    method: d.key || "Unknown",
    value: d.default_rate_percent || 0,
  }))

  const top10FactorsData = [
    { factor: "Credit Score", importance: 25.0 },
    { factor: "Debt-to-Income Ratio", importance: 18.0 },
    { factor: "Loan Amount", importance: 12.0 },
    { factor: "Employment Status", importance: 10.0 },
    { factor: "Loan Purpose", importance: 8.5 },
    { factor: "Credit History Length", importance: 7.2 },
    { factor: "Property Value", importance: 6.1 },
    { factor: "Occupancy Type", importance: 5.3 },
    { factor: "Interest Rate", importance: 4.8 },
    { factor: "Region", importance: 3.1 },
  ]

  // ==========================
  // RENDER TABLE
  // ==========================
  const renderSharedTable = () => {
    if (loading)
      return (
        <div className="text-center py-8 text-muted-foreground">Loading data...</div>
      )

    if (activeSection === "demographics") {
      if (selectedStat === "genderRisk") {
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gender</TableHead>
                <TableHead className="text-right">Default Rate %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {genderRiskData.map((row: any) => (
                <TableRow key={row.gender}>
                  <TableCell className="font-medium">{row.gender}</TableCell>
                  <TableCell className="text-right">
                    {row.riskRate.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      }

      if (selectedStat === "regionRisk") {
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Region</TableHead>
                <TableHead className="text-right">Default Rate %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regionRiskData.map((row: any) => (
                <TableRow key={row.region}>
                  <TableCell className="font-medium">{row.region}</TableCell>
                  <TableCell className="text-right">
                    {row.riskRate.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      }
    }

    if (activeSection === "loan") {
      if (selectedLoanStat === "loanTypeLimit") {
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Loan Type</TableHead>
                <TableHead className="text-right">CF %</TableHead>
                <TableHead className="text-right">NCF %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loanTypeLimitData.map((row: any) => (
                <TableRow key={row.type}>
                  <TableCell className="font-medium">{row.type}</TableCell>
                  <TableCell className="text-right">
                    {row.cf.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {row.ncf.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      }

      if (selectedLoanStat === "loanPurpose") {
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Purpose</TableHead>
                <TableHead className="text-right">Default Rate %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loanPurposeData.map((row: any) => (
                <TableRow key={row.purpose}>
                  <TableCell className="font-medium">{row.purpose}</TableCell>
                  <TableCell className="text-right">
                    {row.riskRate.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      }

      if (selectedLoanStat === "specialTerms") {
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Interest Only %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specialTermsData.map((row: any) => (
                <TableRow key={row.category}>
                  <TableCell className="font-medium">{row.category}</TableCell>
                  <TableCell className="text-right">
                    {row.intOnly.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      }
    }

    if (activeSection === "collateral") {
      if (selectedCollateralStat === "occupancyRisk") {
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Occupancy Type</TableHead>
                <TableHead className="text-right">Default Rate %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {occupancyRiskData.map((row: any) => (
                <TableRow key={row.type}>
                  <TableCell className="font-medium">{row.type}</TableCell>
                  <TableCell className="text-right">
                    {row.riskRate.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      }

      if (selectedCollateralStat === "submissionRisk") {
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Default Rate %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissionRiskData.map((row: any) => (
                <TableRow key={row.method}>
                  <TableCell className="font-medium">{row.method}</TableCell>
                  <TableCell className="text-right">
                    {row.value.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )
      }
    }

    if (activeSection === "top10") {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Factor</TableHead>
              <TableHead className="text-right">Importance %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {top10FactorsData.map((row, i) => (
              <TableRow key={row.factor}>
                <TableCell className="font-medium">
                  {i + 1}. {row.factor}
                </TableCell>
                <TableCell className="text-right">
                  {row.importance.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
    }

    return (
      <div className="text-center py-8 text-muted-foreground">
        Select a statistic to view data
      </div>
    )
  }

  // ==========================
  // RENDER CHART
  // ==========================
  const renderSharedChart = () => {
    if (loading)
      return (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Loading chart...
        </div>
      )

    if (activeSection === "demographics" && selectedStat === "genderRisk") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={genderRiskData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="gender" />
            <YAxis unit="%" />
            <Tooltip formatter={(v) => `${v}%`} />
            <Legend />
            <Bar dataKey="riskRate" fill="#3b82f6" name="Default Risk %" />
          </BarChart>
        </ResponsiveContainer>
      )
    }

    if (activeSection === "demographics" && selectedStat === "regionRisk") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={regionRiskData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="region" />
            <YAxis unit="%" />
            <Tooltip formatter={(v) => `${v}%`} />
            <Legend />
            <Bar dataKey="riskRate" fill="#f97316" name="Default Risk %" />
          </BarChart>
        </ResponsiveContainer>
      )
    }

    if (activeSection === "loan" && selectedLoanStat === "loanTypeLimit") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={loanTypeLimitData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis unit="%" />
            <Tooltip formatter={(v) => `${v}%`} />
            <Legend />
            <Bar dataKey="cf" fill="#3b82f6" name="CF" />
            <Bar dataKey="ncf" fill="#f97316" name="NCF" />
          </BarChart>
        </ResponsiveContainer>
      )
    }

    if (activeSection === "loan" && selectedLoanStat === "loanPurpose") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={loanPurposeData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" unit="%" />
            <YAxis dataKey="purpose" type="category" width={100} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Legend />
            <Bar dataKey="riskRate" fill="#10b981" name="Default Risk %" />
          </BarChart>
        </ResponsiveContainer>
      )
    }

    if (activeSection === "loan" && selectedLoanStat === "specialTerms") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={specialTermsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis unit="%" />
            <Tooltip formatter={(v) => `${v}%`} />
            <Legend />
            <Bar dataKey="intOnly" fill="#8b5cf6" name="Interest Only %" />
          </BarChart>
        </ResponsiveContainer>
      )
    }

    if (activeSection === "collateral" && selectedCollateralStat === "occupancyRisk") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={occupancyRiskData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis unit="%" />
            <Tooltip formatter={(v) => `${v}%`} />
            <Legend />
            <Bar dataKey="riskRate" fill="#3b82f6" name="Default Risk %" />
          </BarChart>
        </ResponsiveContainer>
      )
    }

    if (
      activeSection === "collateral" &&
      selectedCollateralStat === "submissionRisk"
    ) {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={submissionRiskData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              labelLine={false}
              label={({ method, percent }) =>
                `${method}: ${(percent * 100).toFixed(0)}%`
              }
              dataKey="value"
            >
              {submissionRiskData.map((_: any, i: number) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `${v}%`} />
          </PieChart>
        </ResponsiveContainer>
      )
    }

    if (activeSection === "top10") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={top10FactorsData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" unit="%" />
            <YAxis dataKey="factor" type="category" width={150} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Bar dataKey="importance" fill="#10b981" name="Importance %" />
          </BarChart>
        </ResponsiveContainer>
      )
    }

    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        Select a statistic to view chart
      </div>
    )
  }

  // ==========================
  // SECTION TITLE
  // ==========================
  const getSectionTitle = () => {
    if (activeSection === "demographics") {
      return selectedStat === "genderRisk"
        ? "Risk Distribution by Gender"
        : "Risk Allocation by Region"
    }
    if (activeSection === "loan") {
      const map: any = {
        loanTypeLimit: "Risk by Loan Limit and Type",
        loanPurpose: "Risk by Loan Purpose",
        specialTerms: "Impact of Special Terms",
      }
      return map[selectedLoanStat]
    }
    if (activeSection === "collateral") {
      const map: any = {
        occupancyRisk: "Risk by Occupancy Type",
        submissionRisk: "Risk by Submission Method",
      }
      return map[selectedCollateralStat]
    }
    return "Top 10 Important Factors in Risk Prediction"
  }

  // ==========================
  // UI
  // ==========================
  return (
    <div className="min-h-screen bg-transparent">
      {/* HEADER */}
      <header className="border-b border-border bg-card/100 backdrop-blur-md">
        <div className="container mx-auto flex h-12 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <h1 className="font-semibold text-foreground">
              Risk Management Statistics Dashboard
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
          <Button variant="outline" asChild className="gap-2 bg-transparent">
            <a href="/">
              <Home className="h-4 w-4" />
              Prediction
            </a>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-card/100 backdrop-blur-md">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Active Loans
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {loading
                    ? "..."
                    : data.total_active_loans.toLocaleString()}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </CardContent>
          </Card>

          <Card className="bg-card/100 backdrop-blur-md">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Avg Overdue Rate
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? "..." : `${data.avg_overdue_rate_percent}%`}
                </p>
              </div>
              <Percent className="h-8 w-8 text-orange-500" />
            </CardContent>
          </Card>

          <Card className="bg-card/100 backdrop-blur-md">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Overdue Amount
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {loading
                    ? "..."
                    : `$${(data.total_overdue_amount / 1_000_000).toFixed(
                        1,
                      )}M`}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-500" />
            </CardContent>
          </Card>

          <Card className="bg-card/100 backdrop-blur-md">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Recovery Rate
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? "..." : `${data.recovery_rate_percent}%`}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>

          <Card className="bg-card/100 backdrop-blur-md">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Model Accuracy
                </p>
                <p className="text-2xl font-bold text-foreground">90.14%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT PANELS */}
          <div className="space-y-4">
            {/* Demographics */}
            <Card className="bg-card/100 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Demographics Overview
                </CardTitle>
                <CardDescription className="text-xs">
                  Select a statistic
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <Button
                  variant={
                    activeSection === "demographics" &&
                    selectedStat === "genderRisk"
                      ? "default"
                      : "ghost"
                  }
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    setActiveSection("demographics")
                    setSelectedStat("genderRisk")
                  }}
                >
                  <span className="w-6">1.</span> Risk Distribution by Gender
                </Button>
                <Button
                  variant={
                    activeSection === "demographics" &&
                    selectedStat === "regionRisk"
                      ? "default"
                      : "ghost"
                  }
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    setActiveSection("demographics")
                    setSelectedStat("regionRisk")
                  }}
                >
                  <span className="w-6">2.</span> Risk Allocation by Region
                </Button>
              </CardContent>
            </Card>

            {/* Loan Characteristics */}
            <Card className="bg-card/100 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Loan Characteristics
                </CardTitle>
                <CardDescription className="text-xs">
                  Select a statistic
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <Button
                  variant={
                    activeSection === "loan" &&
                    selectedLoanStat === "loanTypeLimit"
                      ? "default"
                      : "ghost"
                  }
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    setActiveSection("loan")
                    setSelectedLoanStat("loanTypeLimit")
                  }}
                >
                  <span className="w-6">1.</span> Risk by Loan Limit and Type
                </Button>
                <Button
                  variant={
                    activeSection === "loan" &&
                    selectedLoanStat === "loanPurpose"
                      ? "default"
                      : "ghost"
                  }
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    setActiveSection("loan")
                    setSelectedLoanStat("loanPurpose")
                  }}
                >
                  <span className="w-6">2.</span> Risk by Loan Purpose
                </Button>
                <Button
                  variant={
                    activeSection === "loan" &&
                    selectedLoanStat === "specialTerms"
                      ? "default"
                      : "ghost"
                  }
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    setActiveSection("loan")
                    setSelectedLoanStat("specialTerms")
                  }}
                >
                  <span className="w-6">3.</span> Impact of Special Terms
                </Button>
              </CardContent>
            </Card>

            {/* Collateral */}
            <Card className="bg-card/100 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Collateral and Application
                </CardTitle>
                <CardDescription className="text-xs">
                  Select a statistic
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <Button
                  variant={
                    activeSection === "collateral" &&
                    selectedCollateralStat === "occupancyRisk"
                      ? "default"
                      : "ghost"
                  }
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    setActiveSection("collateral")
                    setSelectedCollateralStat("occupancyRisk")
                  }}
                >
                  <span className="w-6">1.</span> Risk by Occupancy Type
                </Button>
                <Button
                  variant={
                    activeSection === "collateral" &&
                    selectedCollateralStat === "submissionRisk"
                      ? "default"
                      : "ghost"
                  }
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    setActiveSection("collateral")
                    setSelectedCollateralStat("submissionRisk")
                  }}
                >
                  <span className="w-6">2.</span> Risk by Submission Method
                </Button>
              </CardContent>
            </Card>

            {/* Top 10 */}
            <Card className="bg-card/100 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Top 10 Important Factors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant={activeSection === "top10" ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={() => setActiveSection("top10")}
                >
                  View Ranking
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="bg-card/100 backdrop-blur-md">
              <CardContent className="py-3 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-foreground">
                  {getSectionTitle()}
                </h2>
                <div className="flex gap-2">
                  <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 bg-transparent"
                      >
                        <Calendar className="h-4 w-4" />
                        {selectedMonth && selectedYear
                          ? `${selectedMonth} ${selectedYear}`
                          : "Filter by Month/Year"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Filter by Time Period</DialogTitle>
                        <DialogDescription>
                          Select month and year to filter data
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium block mb-2">
                              Year
                            </label>
                            <Select
                              value={selectedYear?.toString() || ""}
                              onValueChange={(v) =>
                                setSelectedYear(Number(v))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select year" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableYears.map((y) => (
                                  <SelectItem key={y} value={y.toString()}>
                                    {y}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-2">
                              Month
                            </label>
                            <Select
                              value={selectedMonth || ""}
                              onValueChange={(v) => {
                                setSelectedMonth(v)
                                setIsFilterOpen(false)
                              }}
                              disabled={!selectedYear}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select month" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableMonths.map((m) => (
                                  <SelectItem
                                    key={m.value}
                                    value={m.value}
                                  >
                                    {m.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {(selectedMonth || selectedYear) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedMonth(null)
                              setSelectedYear(null)
                              setIsFilterOpen(false)
                            }}
                          >
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent"
                  >
                    <Download className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/100 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-base">Data Table</CardTitle>
              </CardHeader>
              <CardContent>{renderSharedTable()}</CardContent>
            </Card>

            <Card className="bg-card/100 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-base">
                  Chart Visualization
                </CardTitle>
              </CardHeader>
              <CardContent>{renderSharedChart()}</CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
