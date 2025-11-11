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
type StatisticType = "genderRisk" | "regionRisk";
type LoanStatType = "loanTypeLimit" | "loanPurpose" | "specialTerms";
type CollateralStatType = "occupancyRisk" | "submissionRisk";

const availableMonths = [
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
];
const availableYears = [2019, 2025];

export default function StatisticsDashboard() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<SectionType>("demographics");
  const [selectedStat, setSelectedStat] = useState<StatisticType>("genderRisk");
  const [selectedLoanStat, setSelectedLoanStat] = useState<LoanStatType>("loanTypeLimit");
  const [selectedCollateralStat, setSelectedCollateralStat] = useState<CollateralStatType>("occupancyRisk");

  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = typeof window !== "undefined" && localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) router.replace("/login");
  }, [router]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const query = selectedMonth && selectedYear ? `?month=${selectedMonth}&year=${selectedYear}` : "";
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

  // ÁNH XẠ DỮ LIỆU
  const data = rawData
    ? {
        total_active_loans: rawData.total_active_loans ?? 0,
        overdue_rate: rawData.avg_overdue_rate_percent ?? 0,
        overdue_amount: rawData.total_overdue_amount ?? 0,
        recovery_rate: rawData.recovery_rate_percent ?? 0,
        model_accuracy: rawData.model_accuracy ?? 0,

        gender_risk: (rawData.gender_risk ?? [])
          .filter((r: any) => r.default_rate_percent > 0)
          .map((r: any) => ({ gender: r.key, riskRate: r.default_rate_percent })),

        region_risk: (rawData.region_risk ?? [])
          .filter((r: any) => r.default_rate_percent > 0)
          .map((r: any) => ({ region: r.key, riskRate: r.default_rate_percent })),

        loan_type_limit: (() => {
          const map = new Map<string, any>();
          (rawData.loan_type_limit ?? []).forEach((r: any) => {
            const [type, cf_ncf] = r.key;
            if (!map.has(type)) map.set(type, { type, cf: null, ncf: null });
            const entry = map.get(type);
            if (cf_ncf === "CF") entry.cf = r.default_rate_percent;
            if (cf_ncf === "NCF") entry.ncf = r.default_rate_percent;
          });
          return Array.from(map.values());
        })(),

        loan_purpose: (rawData.loan_purpose ?? [])
          .filter((r: any) => r.default_rate_percent > 0)
          .map((r: any) => ({ purpose: r.key, riskRate: r.default_rate_percent })),

        special_terms: (rawData.special_terms ?? [])
          .filter((r: any) => r.default_rate_percent > 0)
          .map((r: any) => ({
            category: r.key === "int_only" ? "Interest Only" : "Not Interest Only",
            riskRate: r.default_rate_percent,
          })),

        occupancy_risk: (rawData.occupancy_risk ?? [])
          .filter((r: any) => r.default_rate_percent > 0)
          .map((r: any) => ({ type: r.key.toUpperCase(), riskRate: r.default_rate_percent })),

        submission_risk: (rawData.submission_risk ?? [])
          .filter((r: any) => r.default_rate_percent > 0)
          .map((r: any) => ({
            method: r.key === "to_inst" ? "To Institution" : "Not to Institution",
            riskRate: r.default_rate_percent,
          })),
      }
    : null;

  const formatPercent = (v: any, decimals = 1) => (v == null ? "N/A" : `${Number(v).toFixed(decimals)}%`);
  const formatCurrency = (v: any) => v == null ? "N/A" : `$${(v / 1_000_000).toFixed(1)}M`;

  // LẤY DỮ LIỆU HIỆN TẠI
  const getCurrentData = () => {
    if (!data) return [];
    const map: Record<string, any[]> = {
      genderRisk: data.gender_risk,
      regionRisk: data.region_risk,
      loanTypeLimit: data.loan_type_limit,
      loanPurpose: data.loan_purpose,
      specialTerms: data.special_terms,
      occupancyRisk: data.occupancy_risk,
      submissionRisk: data.submission_risk,
    };
    const key =
      activeSection === "demographics" ? selectedStat :
      activeSection === "loan" ? selectedLoanStat :
      activeSection === "collateral" ? selectedCollateralStat : "";
    return map[key] || [];
  };

  // RENDER TABLE
  const renderTable = () => {
    const currentData = getCurrentData();
    if (loading) return <div className="py-8 text-center text-muted-foreground">Đang tải...</div>;
    if (error || !data) return <div className="py-8 text-center text-red-600">{error || "Không có dữ liệu"}</div>;
    if (currentData.length === 0) return <div className="py-8 text-center text-muted-foreground">Không có dữ liệu</div>;

    const key = activeSection === "demographics" ? selectedStat : activeSection === "loan" ? selectedLoanStat : selectedCollateralStat;

    if (key === "genderRisk") {
      return (
        <Table>
          <TableHeader><TableRow><TableHead>Gender</TableHead><TableHead className="text-right">Default Rate %</TableHead></TableRow></TableHeader>
          <TableBody>{currentData.map((r: any, i: number) => (
            <TableRow key={i}><TableCell className="font-medium">{r.gender}</TableCell><TableCell className="text-right">{formatPercent(r.riskRate)}</TableCell></TableRow>
          ))}</TableBody>
        </Table>
      );
    }

    if (key === "regionRisk") {
      return (
        <Table>
          <TableHeader><TableRow><TableHead>Region</TableHead><TableHead className="text-right">Default Rate %</TableHead></TableRow></TableHeader>
          <TableBody>{currentData.map((r: any, i: number) => (
            <TableRow key={i}><TableCell className="font-medium">{r.region}</TableCell><TableCell className="text-right">{formatPercent(r.riskRate)}</TableCell></TableRow>
          ))}</TableBody>
        </Table>
      );
    }

    if (key === "loanTypeLimit") {
      return (
        <Table>
          <TableHeader><TableRow><TableHead>Type</TableHead><TableHead className="text-right">CF %</TableHead><TableHead className="text-right">NCF %</TableHead></TableRow></TableHeader>
          <TableBody>{currentData.map((r: any, i: number) => (
            <TableRow key={i}>
              <TableCell className="font-medium">{r.type}</TableCell>
              <TableCell className="text-right">{formatPercent(r.cf)}</TableCell>
              <TableCell className="text-right">{formatPercent(r.ncf)}</TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      );
    }

    if (key === "loanPurpose") {
      return (
        <Table>
          <TableHeader><TableRow><TableHead>Purpose</TableHead><TableHead className="text-right">Default Rate %</TableHead></TableRow></TableHeader>
          <TableBody>{currentData.map((r: any, i: number) => (
            <TableRow key={i}><TableCell className="font-medium">{r.purpose}</TableCell><TableCell className="text-right">{formatPercent(r.riskRate)}%</TableCell></TableRow>
          ))}</TableBody>
        </Table>
      );
    }

    if (key === "specialTerms") {
      return (
        <Table>
          <TableHeader><TableRow><TableHead>Term</TableHead><TableHead className="text-right">Default Rate %</TableHead></TableRow></TableHeader>
          <TableBody>{currentData.map((r: any, i: number) => (
            <TableRow key={i}><TableCell className="font-medium">{r.category}</TableCell><TableCell className="text-right">{formatPercent(r.riskRate)}</TableCell></TableRow>
          ))}</TableBody>
        </Table>
      );
    }

    if (key === "occupancyRisk") {
      return (
        <Table>
          <TableHeader><TableRow><TableHead>Occupancy</TableHead><TableHead className="text-right">Default Rate %</TableHead></TableRow></TableHeader>
          <TableBody>{currentData.map((r: any, i: number) => (
            <TableRow key={i}><TableCell className="font-medium">{r.type}</TableCell><TableCell className="text-right">{formatPercent(r.riskRate)}</TableCell></TableRow>
          ))}</TableBody>
        </Table>
      );
    }

    if (key === "submissionRisk") {
      return (
        <Table>
          <TableHeader><TableRow><TableHead>Submission</TableHead><TableHead className="text-right">Default Rate %</TableHead></TableRow></TableHeader>
          <TableBody>{currentData.map((r: any, i: number) => (
            <TableRow key={i}><TableCell className="font-medium">{r.method}</TableCell><TableCell className="text-right">{formatPercent(r.riskRate)}</TableCell></TableRow>
          ))}</TableBody>
        </Table>
      );
    }

    return null;
  };

  // RENDER CHART
  const renderChart = () => {
    const currentData = getCurrentData();
    if (!currentData || currentData.length === 0) {
      return <div className="h-[300px] flex items-center justify-center text-muted-foreground">Không có dữ liệu</div>;
    }

    const key = activeSection === "demographics" ? selectedStat : activeSection === "loan" ? selectedLoanStat : selectedCollateralStat;

    if (key === "loanTypeLimit") {
      const pieData = currentData.flatMap((r: any) => [
        r.cf != null ? { name: `${r.type} (CF)`, value: r.cf } : null,
        r.ncf != null ? { name: `${r.type} (NCF)`, value: r.ncf } : null,
      ].filter(Boolean));
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {pieData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => formatPercent(v)} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (key === "submissionRisk") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={currentData} dataKey="riskRate" nameKey="method" cx="50%" cy="50%" outerRadius={100} label>
              {currentData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => formatPercent(v)} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    const dataKey = "riskRate";
    const nameKeyMap: Record<string, string> = {
      genderRisk: "gender",
      regionRisk: "region",
      loanPurpose: "purpose",
      specialTerms: "category",
      occupancyRisk: "type",
    };
    const nameKey = nameKeyMap[key] || "name";

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={currentData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={nameKey} />
          <YAxis unit="%" />
          <Tooltip formatter={(v) => formatPercent(v)} />
          <Bar dataKey={dataKey} fill="#3b82f6" name="Default Risk %" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

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
        {/* KPI */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="bg-card/100 backdrop-blur-md">
            <CardContent className="pt-6 flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Total Active Loans</p><p className="text-2xl font-bold text-foreground">{data.total_active_loans.toLocaleString()}</p></div>
              <CreditCard className="h-8 w-8 text-primary" />
            </CardContent>
          </Card>
          <Card className="bg-card/100 backdrop-blur-md">
            <CardContent className="pt-6 flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Avg Overdue Rate</p><p className="text-2xl font-bold text-foreground">{formatPercent(data.overdue_rate, 1)}</p></div>
              <Percent className="h-8 w-8 text-orange-500" />
            </CardContent>
          </Card>
          <Card className="bg-card/100 backdrop-blur-md">
            <CardContent className="pt-6 flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Total Overdue Amount</p><p className="text-2xl font-bold text-foreground">{formatCurrency(data.overdue_amount)}</p></div>
              <DollarSign className="h-8 w-8 text-destructive" />
            </CardContent>
          </Card>
          <Card className="bg-card/100 backdrop-blur-md">
            <CardContent className="pt-6 flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Recovery Rate</p><p className="text-2xl font-bold text-foreground">{formatPercent(data.recovery_rate, 1)}</p></div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>
          <Card className="bg-card/100 backdrop-blur-md">
            <CardContent className="pt-6 flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Model Accuracy</p><p className="text-2xl font-bold text-foreground">{formatPercent(data.model_accuracy, 1)}</p></div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT PANELS */}
          <div className="lg:col-span-1 space-y-6">
            {/* Demographics */}
            <Card className="bg-card/100 backdrop-blur-md">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm">Demographics Overview</CardTitle>
                <CardDescription className="text-xs">Select a statistic</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 mt-[-4px]">
                <div className="space-y-1">
                  {[
                    { id: "genderRisk" as StatisticType, number: "1", label: "Risk Distribution by Gender" },
                    { id: "regionRisk" as StatisticType, number: "2", label: "Risk Allocation by Region" },
                  ].map((stat) => {
                    const isSelected = activeSection === "demographics" && selectedStat === stat.id;
                    return (
                      <Button
                        key={stat.id}
                        variant={isSelected ? "default" : "secondary"}
                        className={`w-full justify-start gap-2 text-xs h-8 ${isSelected ? "ring-2 ring-primary/50" : ""}`}
                        onClick={() => { setActiveSection("demographics"); setSelectedStat(stat.id); }}
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
                <CardDescription className="text-xs">Select a statistic</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 mt-[-4px]">
                <div className="space-y-1">
                  {[
                    { id: "loanTypeLimit" as LoanStatType, number: "1", label: "Risk by Loan Limit and Type" },
                    { id: "loanPurpose" as LoanStatType, number: "2", label: "Risk by Loan Purpose" },
                    { id: "specialTerms" as LoanStatType, number: "3", label: "Impact of Special Terms" },
                  ].map((stat) => {
                    const isSelected = activeSection === "loan" && selectedLoanStat === stat.id;
                    return (
                      <Button
                        key={stat.id}
                        variant={isSelected ? "default" : "secondary"}
                        className={`w-full justify-start gap-2 text-xs h-8 ${isSelected ? "ring-2 ring-primary/50" : ""}`}
                        onClick={() => { setActiveSection("loan"); setSelectedLoanStat(stat.id); }}
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
                <CardDescription className="text-xs">Select a statistic</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 mt-[-4px]">
                <div className="space-y-1">
                  {[
                    { id: "occupancyRisk" as CollateralStatType, number: "1", label: "Risk by Occupancy Type" },
                    { id: "submissionRisk" as CollateralStatType, number: "2", label: "Risk by Submission Method" },
                  ].map((stat) => {
                    const isSelected = activeSection === "collateral" && selectedCollateralStat === stat.id;
                    return (
                      <Button
                        key={stat.id}
                        variant={isSelected ? "default" : "secondary"}
                        className={`w-full justify-start gap-2 text-xs h-8 ${isSelected ? "ring-2 ring-primary/50" : ""}`}
                        onClick={() => { setActiveSection("collateral"); setSelectedCollateralStat(stat.id); }}
                      >
                        <span className="flex h-4 w-4 items-center justify-center rounded text-xs font-semibold bg-white text-primary">{stat.number}</span>
                        <span className="flex-1 text-left truncate">{stat.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT PANEL */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="bg-card/100 backdrop-blur-md">
              <CardContent className="py-3 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-foreground">
                  {activeSection === "demographics" ? (selectedStat === "genderRisk" ? "Risk Distribution by Gender" : "Risk Allocation by Region") :
                   activeSection === "loan" ? (selectedLoanStat === "loanTypeLimit" ? "Risk by Loan Limit and Type" : selectedLoanStat === "loanPurpose" ? "Risk by Loan Purpose" : "Impact of Special Terms") :
                   activeSection === "collateral" ? (selectedCollateralStat === "occupancyRisk" ? "Risk by Occupancy Type" : "Risk by Submission Method") : ""}
                </h2>
                <div className="flex gap-2">
                  <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                        <Calendar className="h-4 w-4" />
                        {selectedMonth && selectedYear ? `${availableMonths.find(m => m.value === selectedMonth)?.label} ${selectedYear}` : "Filter by Month/Year"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Filter by Time Period</DialogTitle>
                        <DialogDescription>Select month and year to view specific data</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium block mb-2">Year</label>
                            <Select value={selectedYear?.toString() || ""} onValueChange={(v) => setSelectedYear(Number(v))}>
                              <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                              <SelectContent>{availableYears.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-2">Month</label>
                            <Select value={selectedMonth?.toString() || ""} onValueChange={(v) => { setSelectedMonth(Number(v)); setIsFilterOpen(false); }} disabled={!selectedYear}>
                              <SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger>
                              <SelectContent>{availableMonths.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        </div>
                        {(selectedMonth || selectedYear) && (
                          <Button variant="ghost" className="text-red-600" onClick={() => { setSelectedMonth(null); setSelectedYear(null); setIsFilterOpen(false); }}>
                            Clear All Filters
                          </Button>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Download className="h-4 w-4" /> Save
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/100 backdrop-blur-md">
              <CardHeader><CardTitle className="text-base">Data Table</CardTitle></CardHeader>
              <CardContent>{renderTable()}</CardContent>
            </Card>

            <Card className="bg-card/100 backdrop-blur-md">
              <CardHeader><CardTitle className="text-base">Chart Visualization</CardTitle></CardHeader>
              <CardContent>{renderChart()}</CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}