import { useEffect, useState } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';

export default function DashboardPage() {
  const [summary, setSummary] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    todayAppointments: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
    recentAppointments: [],
  });

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/dashboard');
      setSummary(res.data);
    };
    load();
  }, []);

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Clinic Dashboard</h1>
        </div>
      </header>

      <div className="stats-grid">
        <StatCard title="Patients" value={summary.totalPatients} subtitle="Total active records" accent="blue" />
        <StatCard title="Doctors" value={summary.totalDoctors} subtitle="Available care staff" accent="green" />
        <StatCard title="Today Appointments" value={summary.todayAppointments} subtitle="Scheduled visits" accent="purple" />
        <StatCard title="Pending Bills" value={summary.pendingInvoices} subtitle="Open invoices" accent="orange" />
        <StatCard title="Revenue" value={`$${Number(summary.totalRevenue || 0).toLocaleString()}`} subtitle="Cumulative amount" accent="teal" />
      </div>

      <div className="panel-card">
        <div className="panel-title-row">
          <h3>Recent Appointments</h3>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {summary.recentAppointments?.map((item) => (
              <tr key={item.id}>
                <td>{item.first_name} {item.last_name}</td>
                <td>{item.doctor_name}</td>
                <td>{item.appointment_date}</td>
                <td>{item.appointment_time}</td>
                <td><span className="status-badge">{item.status}</span></td>
              </tr>
            )) || <tr><td colSpan="5">No appointments found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
