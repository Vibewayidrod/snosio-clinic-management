import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
    notes: '',
  });

  const loadData = async () => {
    const [appointmentsRes, patientsRes, doctorsRes] = await Promise.all([
      api.get('/appointments'),
      api.get('/patients'),
      api.get('/doctors'),
    ]);
    setAppointments(appointmentsRes.data.appointments || []);
    setPatients(patientsRes.data.patients || []);
    setDoctors(doctorsRes.data.doctors || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/appointments', form);
    setForm({ patient_id: '', doctor_id: '', appointment_date: '', appointment_time: '', reason: '', notes: '' });
    loadData();
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Schedule</p>
          <h1>Appointments</h1>
        </div>
      </header>

      <div className="grid-two">
        <div className="panel-card">
          <div className="panel-title-row">
            <h3>Create Appointment</h3>
          </div>

          <form className="form-grid" onSubmit={handleCreate}>
            <select value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })}>
              <option value="">Select patient</option>
              {patients.map((pt) => (
                <option key={pt.id} value={pt.id}>{pt.first_name} {pt.last_name}</option>
              ))}
            </select>

            <select value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}>
              <option value="">Select doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
              ))}
            </select>

            <input type="date" value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} />
            <input type="time" value={form.appointment_time} onChange={(e) => setForm({ ...form, appointment_time: e.target.value })} />

            <input className="full-width" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Visit reason" />
            <textarea className="full-width" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" rows="3" />

            <button type="submit" className="full-width">Schedule Appointment</button>
          </form>
        </div>

        <div className="panel-card">
          <div className="panel-title-row">
            <h3>Upcoming Appointments</h3>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((item) => (
                <tr key={item.id}>
                  <td>{item.first_name} {item.last_name}</td>
                  <td>{item.doctor_name}</td>
                  <td>{item.appointment_date} {item.appointment_time}</td>
                  <td><span className="status-badge">{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
