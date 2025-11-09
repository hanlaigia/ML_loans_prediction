// import { NextRequest, NextResponse } from "next/server";
// import mysql from "mysql2/promise";

// export async function POST(req: NextRequest) {
//   try {
//     const data = await req.json();

//     const connection = await mysql.createConnection({
//       host: "localhost",
//       user: "root",
//       password: "@Obama123",
//       database: "loan_prediction",
//       port: 3306,
//     });

//     const [result] = await connection.execute(
//       `INSERT INTO loan_applications 
//         (gender, age, region, submission_of_application, approval_in_advance, income, credit_score)
//         VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [
//         data.gender,
//         data.age,
//         data.region,
//         data.submission_of_application,
//         data.approval_in_advance,
//         data.income,
//         data.credit_score,
//       ]
//     );

//     await connection.end();
//     return NextResponse.json({ status: "success", id: result.insertId });
//   } catch (err: any) {
//     return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
//   }
// }

// // Ví dụ gửi dữ liệu từ form lên API
// const handleSave = async (formData) => {
//   const res = await fetch("/api/loan-application", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(formData),
//   });
//   const data = await res.json();
//   if (data.status === "success") {
//     alert("Lưu thành công!");
//   } else {
//     alert("Lỗi: " + data.message);
//   }
// };


























// // frontend/app/api/loans/route.ts
// import { NextResponse } from "next/server"

// const BASE = process.env.BACKEND_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8000"

// // GET /api/loans  → proxy tới FastAPI GET /loans/
// export async function GET() {
//   try {
//     const r = await fetch(`${BASE}/loans/`, { cache: "no-store" })
//     if (!r.ok) {
//       const text = await r.text()
//       return NextResponse.json({ error: `Backend GET failed: ${r.status} ${text}` }, { status: 502 })
//     }
//     const data = await r.json()
//     return NextResponse.json(data)
//   } catch (e: any) {
//     return NextResponse.json({ error: `Proxy GET error: ${e?.message || e}` }, { status: 502 })
//   }
// }

// // POST /api/loans → proxy tới FastAPI POST /loans/
// export async function POST(req: Request) {
//   try {
//     const body = await req.json()
//     const r = await fetch(`${BASE}/loans/`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//     })
//     if (!r.ok) {
//       const text = await r.text()
//       return NextResponse.json({ error: `Backend POST failed: ${r.status} ${text}` }, { status: 502 })
//     }
//     const data = await r.json()
//     return NextResponse.json(data)
//   } catch (e: any) {
//     return NextResponse.json({ error: `Proxy POST error: ${e?.message || e}` }, { status: 502 })
//   }
// }



import { NextResponse } from "next/server"

const BASE = process.env.BACKEND_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8000"

// GET /api/loan-application → proxy tới FastAPI GET /loans/
export async function GET() {
  try {
    const r = await fetch(`${BASE}/loans/`, { cache: "no-store" })
    if (!r.ok) {
      const text = await r.text()
      return NextResponse.json({ error: `Backend GET failed: ${r.status} ${text}` }, { status: 502 })
    }
    const data = await r.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: `Proxy GET error: ${e?.message || e}` }, { status: 502 })
  }
}

// POST /api/loan-application → proxy tới FastAPI POST /loans/
// hoặc nếu URL kết thúc bằng /predict → proxy sang FastAPI /loans/predict
export async function POST(req: Request) {
  try {
    const url = new URL(req.url)

    // Nếu endpoint là /api/loan-application/predict → gọi FastAPI /loans/predict
    if (url.pathname.endsWith("/predict")) {
      const body = await req.json()
      const r = await fetch(`${BASE}/loans/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!r.ok) {
        const text = await r.text()
        return NextResponse.json({ error: `Backend predict failed: ${r.status} ${text}` }, { status: 502 })
      }
      const data = await r.json()
      return NextResponse.json(data)
    }

    // Mặc định: POST để lưu loan mới
    const body = await req.json()
    const r = await fetch(`${BASE}/loans/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!r.ok) {
      const text = await r.text()
      return NextResponse.json({ error: `Backend POST failed: ${r.status} ${text}` }, { status: 502 })
    }
    const data = await r.json()
    return NextResponse.json(data)

  } catch (e: any) {
    return NextResponse.json({ error: `Proxy POST error: ${e?.message || e}` }, { status: 502 })
  }
}
