import { useEffect, useState } from 'react';
import api from '../services/api';

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({
    patient_id: '',
    doctor_id: '',
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
  });

  const loadData = async () => {
    const [presRes, patientsRes, doctorsRes] = await Promise.all([
      api.get('/prescriptions'),
      api.get('/patients'),
      api.get('/doctors'),
    ]);
    setPrescriptions(presRes.data.prescriptions || []);
    setPatients(patientsRes.data.patients || []);
    setDoctors(doctorsRes.data.doctors || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/prescriptions', form);
    setForm({ patient_id: '', doctor_id: '', medication_name: '', dosage: '', frequency: '', duration: '', instructions: '' });
    loadData();
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Clinical</p>
          <h1>Prescriptions</h1>
        </div>
      </header>

      <div className="grid-two">
        <div className="panel-card">
          <div className="panel-title-row">
            <h3>New Prescription</h3>
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

            <input value={form.medication_name} onChange={(e) => setForm({ ...form, medication_name: e.target.value })} placeholder="Medication name" />
            <input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="Dosage" />
            <input value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} placeholder="Frequency" />
            <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="Duration" />
            <textarea className="full-width" rows="3" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Instructions" />

            <button type="submit" className="full-width">Issue Prescription</button>
          </form>
        </div>

        <div className="panel-card">
          <div className="panel-title-row">
            <h3>Prescription Log</h3>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Medication</th>
                <th>Doctor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((item) => (
                <tr key={item.id}>
                  <td>{item.first_name} {item.last_name}</td>
                  <td>{item.medication_name}</td>
                  <td>{item.doctor_name}</td>
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
