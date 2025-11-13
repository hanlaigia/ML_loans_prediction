"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useRouter } from "next/navigation";

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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">All Loans Data (Page {page})</h1>

      <div className="flex justify-between mb-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Find by ID"
            value={filterId}
            onChange={(e) => setFilterId(e.target.value)}
            className="border p-2 bg-white"
          />
          <input
            type="text"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="border p-2 bg-white"
          />
          <input
            type="text"
            placeholder="Month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border p-2 bg-white"
          />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border p-2 bg-white"
          >
            <option value="">Sort ID</option>
            <option value="asc">ID Asc</option>
            <option value="desc">ID Desc</option>
          </select>

          <Button onClick={applyFilters}>Apply Filters</Button>
          <Button onClick={reload}>Reset</Button>
        </div>

        <div className="flex gap-4">
          <Button onClick={() => router.push("/dashboard")}>Back</Button>
          <Button variant="destructive" onClick={deleteSelected}>Delete Selected</Button>
        </div>
      </div>

      <div className="overflow-x-auto mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Select</TableHead>
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
              <TableRow key={loan.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selected.includes(loan.id)}
                    onChange={() => toggleSelect(loan.id)}
                  />
                </TableCell>
                <TableCell>{loan.id}</TableCell>
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

      <div className="flex justify-center gap-4 mt-6">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <Button onClick={() => setPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
}
