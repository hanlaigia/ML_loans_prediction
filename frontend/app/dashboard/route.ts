// app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const year = searchParams.get('year');

  const monthFilter = month && year ? `AND Month = '${month}' AND YEAR(loan_date) = ${year}` : '';

  try {
    const connection = await pool.getConnection();

    // 1. TOTAL ACTIVE LOANS
    const [totalActiveLoans] = await connection.query(`
      SELECT COUNT(*) AS total_active_loans FROM loans
      ${monthFilter ? `WHERE ${monthFilter.replace('AND', '')}` : ''}
    `);

    // 2. AVERAGE OVERDUE RATE
    const [avgOverdueRate] = await connection.query(`
      SELECT ROUND(SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS avg_overdue_rate_percent
      FROM loans
      ${monthFilter}
    `);

    // 3. TOTAL OVERDUE AMOUNT
    const [totalOverdueAmount] = await connection.query(`
      SELECT SUM(loan_amount) AS total_overdue_amount
      FROM loans
      WHERE status = 1 ${monthFilter}
    `);

    // 4. RECOVERY RATE
    const [recoveryRate] = await connection.query(`
      SELECT ROUND(SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS recovery_rate_percent
      FROM loans
      ${monthFilter}
    `);

    // 6. RISK BY GENDER
    const [genderRisk] = await connection.query(`
      SELECT Gender, ROUND(SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS default_rate_percent
      FROM loans
      ${monthFilter}
      GROUP BY Gender
    `);

    // 7. RISK BY REGION
    const [regionRisk] = await connection.query(`
      SELECT Region, ROUND(SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS default_rate_percent
      FROM loans
      ${monthFilter}
      GROUP BY Region
    `);

    // 8. RISK BY LOAN LIMIT AND TYPE
    const [loanTypeLimit] = await connection.query(`
      SELECT loan_limit, loan_type,
             ROUND(SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS default_rate_percent
      FROM loans
      ${monthFilter}
      GROUP BY loan_limit, loan_type
    `);

    // 9. RISK BY LOAN PURPOSE
    const [loanPurpose] = await connection.query(`
      SELECT loan_purpose, ROUND(SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS default_rate_percent
      FROM loans
      ${monthFilter}
      GROUP BY loan_purpose
    `);

    // 10. IMPACT OF SPECIAL TERMS
    const [specialTerms] = await connection.query(`
      SELECT interest_only,
             ROUND(SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS default_rate_percent
      FROM loans
      ${monthFilter}
      GROUP BY interest_only
    `);

    // 11. RISK BY OCCUPANCY TYPE
    const [occupancyRisk] = await connection.query(`
      SELECT occupancy_type,
             ROUND(SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS default_rate_percent
      FROM loans
      ${monthFilter}
      GROUP BY occupancy_type
    `);

    // 12. RISK BY SUBMISSION METHOD
    const [submissionRisk] = await connection.query(`
      SELECT submission_of_application,
             ROUND(SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) AS default_rate_percent
      FROM loans
      ${monthFilter}
      GROUP BY submission_of_application
    `);

    connection.release();

    return NextResponse.json({
      total_active_loans: (totalActiveLoans as any)[0].total_active_loans,
      avg_overdue_rate_percent: (avgOverdueRate as any)[0].avg_overdue_rate_percent,
      total_overdue_amount: (totalOverdueAmount as any)[0].total_overdue_amount || 0,
      recovery_rate_percent: (recoveryRate as any)[0].recovery_rate_percent,
      model_accuracy: 90.14, // Cố định
      gender_risk: genderRisk,
      region_risk: regionRisk,
      loan_type_limit: loanTypeLimit,
      loan_purpose: loanPurpose,
      special_terms: specialTerms,
      occupancy_risk: occupancyRisk,
      submission_risk: submissionRisk,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }
}