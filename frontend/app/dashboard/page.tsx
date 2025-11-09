"use client";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://127.0.0.1:8000/dashboard");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error("❌ Error fetching dashboard:", err);
        setError(err.message);
      }
    }
    fetchData();
  }, []);

  if (error)
    return (
      <div className="p-6 text-red-600">
        <h2 className="text-xl font-bold mb-2">⚠ Lỗi khi tải dashboard</h2>
        <p>{error}</p>
      </div>
    );

  if (!data)
    return (
      <div className="p-6 text-gray-600">
        ⏳ Đang tải dữ liệu từ FastAPI...
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-700">
        📊 Dashboard từ FastAPI
      </h1>
      <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
