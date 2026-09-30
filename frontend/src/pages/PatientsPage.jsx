import { useEffect, useState } from 'react';
import api from '../services/api';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    dob: '',
    gender: 'Male',
    phone: '',
    email: '',
    address: '',
    emergency_contact: '',
    insurance_number: '',
    allergies: '',
    notes: '',
  });

  const loadPatients = async () => {
    const res = await api.get('/patients');
    setPatients(res.data.patients || []);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/patients', form);
    setForm({
      first_name: '',
      last_name: '',
      dob: '',
      gender: 'Male',
      phone: '',
      email: '',
      address: '',
      emergency_contact: '',
      insurance_number: '',
      allergies: '',
      notes: '',
    });
    loadPatients();
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Records</p>
          <h1>Patient Management</h1>
        </div>
      </header>

      <div className="grid-two">
        <div className="panel-card">
          <div className="panel-title-row">
            <h3>Register a Patient</h3>
          </div>

          <form className="form-grid" onSubmit={handleCreate}>
            <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="First name" />
            <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Last name" />
            <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
            <input className="full-width" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" />
            <input value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} placeholder="Emergency contact" />
            <input value={form.insurance_number} onChange={(e) => setForm({ ...form, insurance_number: e.target.value })} placeholder="Insurance number" />
            <input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="Allergies" />
            <textarea className="full-width" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Clinical notes" rows="3" />

            <button type="submit" className="full-width">Save Patient</button>
          </form>
        </div>

        <div className="panel-card">
          <div className="panel-title-row">
            <h3>Patient Directory</h3>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Gender</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.patient_id}</td>
                  <td>{patient.first_name} {patient.last_name}</td>
                  <td>{patient.phone}</td>
                  <td>{patient.gender}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
