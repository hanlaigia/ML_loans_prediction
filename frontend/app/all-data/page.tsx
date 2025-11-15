"use client";


import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function AllDataPage() {
  const [isReady, setIsReady] = useState(false);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [filterId, setFilterId] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const pageSize = 100;


  const router = useRouter();


  useEffect(() => {
    setIsReady(true);
  }, []);


  const fetchData = async (extraParams: any = {}) => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", pageSize.toString());
    if (extraParams.id) params.append("id", extraParams.id);
    if (extraParams.year) params.append("year", extraParams.year);
    if (extraParams.month) params.append("month", extraParams.month);
    if (extraParams.sort_id) params.append("sort_id", extraParams.sort_id);
    const res = await fetch(`http://localhost:8000/loans/page?${params.toString()}`);
    const json = await res.json();
    setData(json);
  };


  useEffect(() => {
    if (isReady) fetchData();
  }, [page, isReady]);


  const toggleSelect = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };


  const deleteSelected = async () => {
    if (!selected.length) return;


    const confirmed = window.confirm(`Delete ${selected.length} record(s)?`);
    if (!confirmed) return;


    for (const id of selected) {
      await fetch(`http://localhost:8000/loans/${id}`, { method: "DELETE" });
    }


    alert("Deleted successfully!");


    setSelected([]);
    fetchData();
  };


  const applyFilters = () => {
    fetchData({
      id: filterId,
      year: year,
      month: month,
      sort_id: sortOrder
    });
  };


  const reload = () => {
    setFilterId("");
    setYear("");
    setMonth("");
    setSortOrder("");
    fetchData();
  };


  if (!isReady) return null;


  return (
    <div className="min-h-screen bg-gray-50/30 p-6">
      <div className="max-w-[100%] mx-auto">
        {/* Header - Đã sửa: căn giữa và bỏ chú thích */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">All Loans Data</h1>
        </div>


        {/* Filters Card */}
        <Card className="mb-6 p-3 pt-1">
          <div className="px-6 pt-4 pb-1">
            <h2 className="text-lg font-semibold">Filters & Search</h2>
          </div>

          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
              {/* Find by ID */}
              <div className="space-y-2">
                <Label htmlFor="filterId" className="text-sm font-medium">Find by ID</Label>
                <Input
                  id="filterId"
                  type="text"
                  placeholder="Enter loan ID..."
                  value={filterId}
                  onChange={(e) => setFilterId(e.target.value)}
                  className="w-full"
                />
              </div>


              {/* Year */}
              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm font-medium">Year</Label>
                <Input
                  id="year"
                  type="text"
                  placeholder="Enter year..."
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full"
                />
              </div>


              {/* Month */}
              <div className="space-y-2">
                <Label htmlFor="month" className="text-sm font-medium">Month</Label>
                <Input
                  id="month"
                  type="text"
                  placeholder="Enter month..."
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full"
                />
              </div>


              {/* Sort ID */}
              <div className="space-y-2">
                <Label htmlFor="sortOrder" className="text-sm font-medium">Sort ID</Label>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">ID Ascending</SelectItem>
                    <SelectItem value="desc">ID Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>


              {/* Action Buttons */}
              <div className="flex lg:flex-col gap-2 lg:justify-end">
                <Button onClick={applyFilters} className="w-full lg:flex-none justify-center">Apply Filters</Button>
                <Button onClick={reload} className="w-full lg:flex-none justify-center">Reset</Button>
              </div>
            </div>


            {/* Secondary Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex gap-2">
                <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
              </div>
              <Button variant="destructive" onClick={deleteSelected} disabled={selected.length === 0}>
                Delete Selected ({selected.length})
              </Button>
            </div>
          </CardContent>
        </Card>


        {/* Data Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Submission</TableHead>
                    <TableHead>Approval in Advance</TableHead>
                    <TableHead>Income</TableHead>
                    <TableHead>Credit Score</TableHead>
                    <TableHead>Credit Type</TableHead>
                    <TableHead>Co-applicant</TableHead>
                    <TableHead>Credit Worthiness</TableHead>
                    <TableHead>Open Credit</TableHead>
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Loan Purpose</TableHead>
                    <TableHead>Loan Amount</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Loan Limit</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>LTV</TableHead>
                    <TableHead>Secured By</TableHead>
                    <TableHead>Security Type</TableHead>
                    <TableHead>Construction</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead>Total Units</TableHead>
                    <TableHead>Neg Ammortization</TableHead>
                    <TableHead>Interest Only</TableHead>
                    <TableHead>Lump Sum</TableHead>
                    <TableHead>Prediction</TableHead>
                    <TableHead>Probability</TableHead>
                  </TableRow>
                </TableHeader>


                <TableBody>
                  {data.map((loan: any) => (
                    <TableRow key={loan.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selected.includes(loan.id)}
                          onChange={() => toggleSelect(loan.id)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{loan.id}</TableCell>
                      <TableCell>{loan.Year}</TableCell>
                      <TableCell>{loan.Month}</TableCell>
                      <TableCell>{loan.Gender}</TableCell>
                      <TableCell>{loan.age}</TableCell>
                      <TableCell>{loan.Region}</TableCell>
                      <TableCell>{loan.submission_of_application}</TableCell>
                      <TableCell>{loan.approv_in_adv}</TableCell>
                      <TableCell>{loan.income}</TableCell>
                      <TableCell>{loan.Credit_Score}</TableCell>
                      <TableCell>{loan.credit_type}</TableCell>
                      <TableCell>{loan.co_applicant_credit_type}</TableCell>
                      <TableCell>{loan.Credit_Worthiness}</TableCell>
                      <TableCell>{loan.open_credit}</TableCell>
                      <TableCell>{loan.loan_type}</TableCell>
                      <TableCell>{loan.loan_purpose}</TableCell>
                      <TableCell>{loan.loan_amount}</TableCell>
                      <TableCell>{loan.term}</TableCell>
                      <TableCell>{loan.rate_of_interest}</TableCell>
                      <TableCell>{loan.loan_limit}</TableCell>
                      <TableCell>{loan.business_or_commercial}</TableCell>
                      <TableCell>{loan.LTV}</TableCell>
                      <TableCell>{loan.Secured_by}</TableCell>
                      <TableCell>{loan.Security_Type}</TableCell>
                      <TableCell>{loan.construction_type}</TableCell>
                      <TableCell>{loan.occupancy_type}</TableCell>
                      <TableCell>{loan.total_units}</TableCell>
                      <TableCell>{loan.Neg_ammortization}</TableCell>
                      <TableCell>{loan.interest_only}</TableCell>
                      <TableCell>{loan.lump_sum_payment}</TableCell>
                      <TableCell>{loan.prediction}</TableCell>
                      <TableCell>{loan.probability}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>


        {/*  */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            className="h-10 px-6 py-2 text-base"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-lg font-medium text-gray-700">Page {page}</span>
          <Button
            className="h-10 px-6 py-2 text-base"
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

