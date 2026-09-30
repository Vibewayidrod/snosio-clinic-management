import { useEffect, useState } from 'react';
import api from '../services/api';

export default function LabTestsPage() {
  const [tests, setTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    patient_id: '',
    doctor_id: '',
    test_name: '',
    result: '',
    status: 'pending',
    notes: '',
  });

  const loadData = async () => {
    const [testsRes, patientsRes, doctorsRes] = await Promise.all([
      api.get('/lab-tests'),
      api.get('/patients'),
      api.get('/doctors'),
    ]);
    setTests(testsRes.data.tests || []);
    setPatients(patientsRes.data.patients || []);
    setDoctors(doctorsRes.data.doctors || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/lab-tests', form);
    setForm({ patient_id: '', doctor_id: '', test_name: '', result: '', status: 'pending', notes: '' });
    loadData();
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Diagnostics</p>
          <h1>Laboratory</h1>
        </div>
      </header>

      <div className="grid-two">
        <div className="panel-card">
          <div className="panel-title-row">
            <h3>Record Test</h3>
          </div>

          <form className="form-grid" onSubmit={handleCreate}>
            <select value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })}>
              <option value="">Select patient</option>
              {patients.map((pt) => <option key={pt.id} value={pt.id}>{pt.first_name} {pt.last_name}</option>)}
            </select>

            <select value={form.doctor_id} onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}>
              <option value="">Select doctor</option>
              {doctors.map((doc) => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
            </select>

            <input value={form.test_name} onChange={(e) => setForm({ ...form, test_name: e.target.value })} placeholder="Test name" />
            <input value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} placeholder="Status" />
            <textarea className="full-width" value={form.result} onChange={(e) => setForm({ ...form, result: e.target.value })} placeholder="Result" rows="3" />
            <textarea className="full-width" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" rows="3" />

            <button type="submit" className="full-width">Save Lab Result</button>
          </form>
        </div>

        <div className="panel-card">
          <div className="panel-title-row">
            <h3>Lab Test Queue</h3>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Test</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((item) => (
                <tr key={item.id}>
                  <td>{item.first_name} {item.last_name}</td>
                  <td>{item.test_name}</td>
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
