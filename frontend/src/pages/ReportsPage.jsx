import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ReportsPage() {
  const [report, setReport] = useState({ summary: {}, revenueByMonth: [] });

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/reports');
      setReport(res.data);
    };
    load();
  }, []);

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Analytics</p>
          <h1>Reports</h1>
        </div>
      </header>

      <div className="stats-grid">
        <StatCard title="Total Patients" value={report.summary.totalPatients || 0} accent="blue" />
        <StatCard title="Appointments" value={report.summary.totalAppointments || 0} accent="green" />
        <StatCard title="Invoices" value={report.summary.totalInvoices || 0} accent="purple" />
        <StatCard title="Low Stock" value={report.summary.lowStockItems || 0} accent="orange" />
      </div>

      <div className="panel-card">
        <div className="panel-title-row">
          <h3>Monthly Revenue</h3>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {(report.revenueByMonth || []).map((row) => (
              <tr key={row.month}>
                <td>{row.month}</td>
                <td>${Number(row.total || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
