"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  ScatterChart,
  Scatter
} from "recharts";
import {
  Home,
  Download,
  DollarSign,
  Percent,
  CheckCircle,
  CreditCard,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COLORS = ["#3b82f6", "#f97316", "#ef4444", "#10b981", "#8b5cf6"];

type SectionType = "demographics" | "loan" | "collateral" | "top10";
type StatisticType = "genderRisk" | "regionRisk" | "creditCapacity";
type LoanStatType = "loanTypeLimit" | "loanPurpose" | "specialTerms" | "loanAmountGroup";
type CollateralStatType = "occupancyRisk" | "submissionRisk";

const availableMonths = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const currentYear = new Date().getFullYear();
const availableYears = Array.from(
  { length: currentYear - 2015 + 1 },
  (_, i) => currentYear - i
);

export default function StatisticsDashboard() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [allData, setAllData] = useState<any[]>([]);
  const [showAllData, setShowAllData] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<SectionType>("demographics");
  const [selectedStat, setSelectedStat] = useState<StatisticType>("genderRisk");
  const [selectedLoanStat, setSelectedLoanStat] = useState<LoanStatType>("loanTypeLimit");
  const [selectedCollateralStat, setSelectedCollateralStat] = useState<CollateralStatType>("occupancyRisk");

  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 300;

  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = typeof window !== "undefined" && localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) router.replace("/login");
  }, [router]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const monthName =
          selectedMonth
            ? availableMonths.find(m => m.value === selectedMonth)?.label
            : null;

        const query =
          monthName && selectedYear
            ? `?month=${encodeURIComponent(monthName)}&year=${selectedYear}`
            : "";

        const res = await fetch(`http://127.0.0.1:8000/dashboard${query}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json = await res.json();
        setRawData(json);
        setError(null);
      } catch (err: any) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedMonth, selectedYear]);

  const handleViewAllData = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/loans/page?page=${page}&size=${pageSize}`
      );
      const data = await res.json();

      setAllData(data);
      setShowAllData(true);
    } catch (error) {
      console.error("Failed to fetch:", error);
    }
  };

  useEffect(() => {
    if (showAllData) {
      handleViewAllData();
    }
  }, [page]);


  // ============================
  // MAP DATA (SỬA LỖI CHUẨN)
  // ============================
  const data = rawData
    ? {
        total_loans: rawData.kpi?.total_loans ?? 0,
        avg_credit_score: rawData.kpi?.avg_credit_score ?? 0,
        avg_loan_amount: rawData.kpi?.avg_loan_amount ?? 0,
        default_rate_percent: rawData.kpi?.default_rate_percent ?? 0,
        model_accuracy: rawData.kpi?.model_accuracy ?? 0,

        gender: rawData.demographics?.gender ?? [],
        age_group: rawData.demographics?.age_group ?? [],
        region: rawData.demographics?.region ?? [],

        loan_type: rawData.loan_characteristics?.loan_type ?? [],
        loan_purpose: rawData.loan_characteristics?.purpose ?? [],
        interest_rate: rawData.loan_characteristics?.interest_rate ?? [],
        loan_amount_group: rawData.loan_characteristics?.loan_amount_group ?? [],

        submission_method: rawData.collateral_application?.submission_method ?? [],
        occupancy_type: rawData.collateral_application?.occupancy_type ?? [],
      }
    : null;


  // ==================================
  // UTILS
  // ==================================
  const formatPercent = (v: any, decimals = 1) =>
    v == null ? "N/A" : `${Number(v).toFixed(decimals)}%`;

  const formatCurrency = (v: any) =>
    v == null ? "N/A" : `$${(v / 1_000_000).toFixed(1)}M`;


  // ==================================
  // TABLE RENDER
  // ==================================
  const renderTable = () => {
    if (!data) return null;

    const currentKey =
      activeSection === "demographics"
        ? selectedStat
        : activeSection === "loan"
        ? selectedLoanStat
        : selectedCollateralStat;

    let tableData: any[] = [];

    if (currentKey === "genderRisk") tableData = data.gender;
    if (currentKey === "regionRisk") tableData = data.region;
    if (currentKey === "creditCapacity") tableData = data.age_group;

    if (currentKey === "loanTypeLimit") tableData = data.loan_type;
    if (currentKey === "loanPurpose") tableData = data.loan_purpose;
    // if (currentKey === "specialTerms") tableData = data.interest_rate;
    if (currentKey === "specialTerms") {
        const src = data.interest_rate;
        const total = src.length;

        if (total > 20) {
            tableData = [
                src[0],                                       // min interest
                ...src.slice(Math.floor(total/2) - 5, Math.floor(total/2) + 5), // middle sample
                src[total - 1]                                // max interest
            ];
        } else {
            tableData = src;
        }
    }

    if (currentKey === "loanAmountGroup") tableData = data.loan_amount_group;

    if (currentKey === "occupancyRisk") tableData = data.occupancy_type;
    if (currentKey === "submissionRisk") tableData = data.submission_method;

    if (!tableData || tableData.length === 0) {
      return (
        <div className="text-center py-6 text-sm text-muted-foreground">
          Không có dữ liệu
        </div>
      );
    }

    // ====== MAP TÊN CỘT HIỂN THỊ ĐẦY ĐỦ ======
    const columnNameMap: Record<string, string> = {
      // Demographics
      gender: "Gender",
      Gender: "Gender",
      region: "Region",
      Region: "Region",
      age_group: "Age Group",
      total_loans: "Total Loans",
      default_count: "Default Count",
      default_rate_percent: "Default Rate (%)",
      avg_probability: "Avg Probability",
      avg_credit_score: "Avg Credit Score",

      // Loan characteristics
      loan_type: "Loan Type",
      purpose: "Loan Purpose",
      loan_count: "Loan Count",
      rate_of_interest: "Interest Rate (%)",
      avg_interest_rate: "Avg Interest Rate",
      loan_amount_group: "Loan Amount Group",
      avg_loan_amount: "Avg Loan Amount",

      // Collateral & Application
      submission: "Submission Method",
      method: "Submission Method",
      pre_approval: "Pre-Approval",
      occupancy_type: "Occupancy Type",
      Secured_by: "Secured By",
    };

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {Object.keys(tableData[0]).map((key) => (
              <TableHead key={key}>
                {columnNameMap[key] ?? key}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {tableData.map((row, idx) => (
            <TableRow key={idx}>
              {Object.entries(row).map(([key, value]) => (
                <TableCell key={key}>{value as any}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };


  // ==================================
  // CHART RENDER 
  // ==================================
  const renderChart = () => {
    if (!data) return null;

    // 1. Gender
    if (activeSection === "demographics" && selectedStat === "genderRisk") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.gender}>
            <XAxis dataKey="Gender" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="default_rate_percent" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // 2. Region
    if (activeSection === "demographics" && selectedStat === "regionRisk") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.region}>
            <XAxis dataKey="Region" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="default_rate_percent" fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // 3. Age Group
    if (activeSection === "demographics" && selectedStat === "creditCapacity") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.age_group}>
            <XAxis dataKey="age_group" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="default_rate_percent" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Loan Type
    if (activeSection === "loan" && selectedLoanStat === "loanTypeLimit") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.loan_type}>
            <XAxis dataKey="loan_type" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="default_rate_percent" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Loan Purpose
    if (activeSection === "loan" && selectedLoanStat === "loanPurpose") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.loan_purpose}>
            <XAxis dataKey="purpose" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="default_rate_percent" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Special Terms (Interest scatter)
    if (activeSection === "loan" && selectedLoanStat === "specialTerms") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <XAxis dataKey="rate_of_interest" name="Interest Rate" />
            <YAxis dataKey="default_rate_percent" name="Default Rate" />
            <Tooltip />
            <Scatter data={data.interest_rate} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    // Loan Amount Group
    if (activeSection === "loan" && selectedLoanStat === "loanAmountGroup") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.loan_amount_group}>
            <XAxis dataKey="loan_amount_group" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="default_rate_percent" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // Submission Method
    if (activeSection === "collateral" && selectedCollateralStat === "submissionRisk") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.submission_method}>
            <XAxis dataKey="submission" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="default_rate_percent" fill="#f97316" />
          </BarChart>

        </ResponsiveContainer>
      );
    }

    // Occupancy Type
    if (activeSection === "collateral" && selectedCollateralStat === "occupancyRisk") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.occupancy_type}>
            <XAxis dataKey="occupancy_type" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="default_rate_percent" fill="#14b8a6" />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return <div className="py-4 text-center text-muted-foreground">Không có dữ liệu</div>;
  };


  // ==================================
  // RENDER UI
  // ==================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold text-red-600 mb-2">Lỗi</h2>
          <p className="text-gray-600">{error || "Không có dữ liệu"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <header className="border-b border-border bg-card/100 backdrop-blur-md">
        <div className="container mx-auto flex h-12 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <h1 className="font-semibold text-foreground">Risk Management Statistics Dashboard</h1>
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <button className="hover:text-foreground transition-colors">System</button>
              <span>|</span>
              <button className="hover:text-foreground transition-colors">Help</button>
            </nav>
          </div>
          <Button variant="outline" asChild className="gap-2 bg-transparent">
            <a href="/"><Home className="h-4 w-4" /> Prediction</a>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">

          {[
            { title: "Total Loans", value: data.total_loans?.toLocaleString(), unit: "loans" },
            { title: "Avg Credit Score", value: data.avg_credit_score?.toFixed(2), unit: "pts" },
            { title: "Avg Loan Amount", value: data.avg_loan_amount?.toLocaleString(), unit: "$" },
            { title: "Default Rate (%)", value: `${data.default_rate_percent?.toFixed(2)}%`, unit: "" },
            { title: "Model Accuracy (%)", value: `${data.model_accuracy}%`, unit: "" },
          ].map((item, i) => (
            <Card
              key={i}
              className="relative shadow border rounded-xl px-4 flex items-center justify-center"
              style={{
                minHeight: "100px",      
              }}
            >

              {/* TITLE */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-sm font-semibold text-center">
                {item.title}
              </div>

              {/* NUMBER + UNIT */}
              <div className="text-center mt-3">
                <span className="text-3xl font-bold">{item.value}</span>
                {item.unit && (
                  <span className="text-2xl font-bold ml-1">{item.unit}</span>
                )}
              </div>

            </Card>
          ))}

        </div>
        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Demographics */}
            <Card className="bg-card/100 backdrop-blur-md">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm">Demographics Overview</CardTitle>
                <CardDescription className="text-xs italic">Select a statistic</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 mt-[-4px]">
                <div className="space-y-1">
                  {[
                    { id: "genderRisk", number: "1", label: "Risk Distribution by Gender" },
                    { id: "regionRisk", number: "2", label: "Risk Allocation by Region" },
                    { id: "creditCapacity", number: "3", label: "Credit Capacity Distribution" },
                  ].map((stat) => {
                    const isSelected = activeSection === "demographics" && selectedStat === stat.id;
                    return (
                      <Button
                        key={stat.id}
                        variant={isSelected ? "default" : "secondary"}
                        className={`w-full justify-start gap-2 text-xs h-8 ${
                          isSelected ? "ring-2 ring-primary/50" : ""
                        }`}
                        onClick={() => {
                          setActiveSection("demographics");
                          setSelectedStat(stat.id as StatisticType);
                        }}
                      >
                        <span className="flex h-4 w-4 items-center justify-center rounded text-xs font-semibold bg-white text-primary">{stat.number}</span>
                        <span className="flex-1 text-left truncate">{stat.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Loan */}
            <Card className="bg-card/100 backdrop-blur-md">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm">Loan Characteristics</CardTitle>
                <CardDescription className="text-xs italic">Select a statistic</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 mt-[-4px]">
                <div className="space-y-1">
                  {[
                    { id: "loanTypeLimit", number: "1", label: "Risk by Loan Limit and Type" },
                    { id: "loanPurpose", number: "2", label: "Risk by Loan Purpose" },
                    { id: "specialTerms", number: "3", label: "Impact of Special Terms" },
                    { id: "loanAmountGroup", number: "4", label: "Loan Amount Group" },
                  ].map((stat) => {
                    const isSelected = activeSection === "loan" && selectedLoanStat === stat.id;
                    return (
                      <Button
                        key={stat.id}
                        variant={isSelected ? "default" : "secondary"}
                        className={`w-full justify-start gap-2 text-xs h-8 ${
                          isSelected ? "ring-2 ring-primary/50" : ""
                        }`}
                        onClick={() => {
                          setActiveSection("loan");
                          setSelectedLoanStat(stat.id as LoanStatType);
                        }}
                      >
                        <span className="flex h-4 w-4 items-center justify-center rounded text-xs font-semibold bg-white text-primary">{stat.number}</span>
                        <span className="flex-1 text-left truncate">{stat.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Collateral */}
            <Card className="bg-card/100 backdrop-blur-md">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm">Collateral and Application</CardTitle>
                <CardDescription className="text-xs italic">Select a statistic</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 mt-[-4px]">
                <div className="space-y-1">
                  {[
                    { id: "occupancyRisk", number: "1", label: "Risk by Occupancy Type" },
                    { id: "submissionRisk", number: "2", label: "Risk by Submission Method" },
                  ].map((stat) => {
                    const isSelected =
                      activeSection === "collateral" && selectedCollateralStat === stat.id;

                    return (
                      <Button
                        key={stat.id}
                        variant={isSelected ? "default" : "secondary"}
                        className={`w-full justify-start gap-2 text-xs h-8 ${
                          isSelected ? "ring-2 ring-primary/50" : ""
                        }`}
                        onClick={() => {
                          setActiveSection("collateral");
                          setSelectedCollateralStat(stat.id as CollateralStatType);
                        }}
                      >
                        <span className="flex h-4 w-4 items-center justify-center rounded text-xs font-semibold bg-white text-primary">
                          {stat.number}
                        </span>
                        <span className="flex-1 text-left truncate">{stat.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* RIGHT CONTENT */}
          <div className="lg:col-span-3 space-y-4">

            {/* TITLE + FILTER */}
            <Card className="bg-card/100 backdrop-blur-md">
              <CardContent className="py-0.5 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-foreground">
                  Chart & Data
                </h2>

                <div className="flex gap-2">
                  {/* Filter Button */}
                  <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Calendar className="h-4 w-4" />
                        {selectedMonth && selectedYear
                          ? `${availableMonths.find(m => m.value === selectedMonth)?.label} ${selectedYear}`
                          : "Filter by Month/Year"}
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Filter by Time Period</DialogTitle>
                        <DialogDescription>Select month and year</DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          
                          <div>
                            <label className="text-sm font-medium block mb-2">Year</label>
                            <Select
                              value={selectedYear?.toString() || ""}
                              onValueChange={(v) => setSelectedYear(Number(v))}
                            >
                              <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
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
                            <label className="text-sm font-medium block mb-2">Month</label>
                            <Select
                              value={selectedMonth?.toString() || ""}
                              onValueChange={(v) => {
                                setSelectedMonth(Number(v));
                                setIsFilterOpen(false);
                              }}
                            >
                              <SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger>
                              <SelectContent>
                                {availableMonths.map((m) => (
                                  <SelectItem key={m.value} value={m.value.toString()}>
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
                            className="text-red-600"
                            onClick={() => {
                              setSelectedMonth(null);
                              setSelectedYear(null);
                              setIsFilterOpen(false);
                            }}
                          >
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* View All Data */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent"
                    onClick={() => router.push("/all-data")}
                  >
                    View All Data
                  </Button>

                </div>
              </CardContent>
            </Card>

            {/* CHART */}
            <Card className="bg-card/100 backdrop-blur-md">
              <CardHeader><CardTitle className="text-base">Chart Visualization</CardTitle></CardHeader>
              <CardContent>{renderChart()}</CardContent>
            </Card>
            
            {/* TABLE */}
            <Card className="bg-card/100 backdrop-blur-md">
              <CardHeader><CardTitle className="text-base">Data Table</CardTitle></CardHeader>
              <CardContent>{renderTable()}</CardContent>
            </Card>



          </div>
        </div>
      </main>
    </div>
  );
}
