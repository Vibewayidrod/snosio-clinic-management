import { useEffect, useState } from 'react';
import api from '../services/api';

export default function BillingPage() {
  const [invoices, setInvoices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [items, setItems] = useState([
    { description: '', quantity: 1, unit_price: 0 },
  ]);
  const [selectedPatient, setSelectedPatient] = useState('');

  const loadData = async () => {
    const [invoicesRes, patientsRes] = await Promise.all([
      api.get('/invoices'),
      api.get('/patients'),
    ]);
    setInvoices(invoicesRes.data.invoices || []);
    setPatients(patientsRes.data.patients || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const addLine = () => setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
  const updateLine = (index, key, value) => {
    const next = [...items];
    next[index][key] = value;
    setItems(next);
  };

  const handleInvoice = async (e) => {
    e.preventDefault();
    await api.post('/invoices', {
      patient_id: selectedPatient,
      items,
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    });
    setSelectedPatient('');
    setItems([{ description: '', quantity: 1, unit_price: 0 }]);
    loadData();
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Finance</p>
          <h1>Billing & Payments</h1>
        </div>
      </header>

      <div className="grid-two">
        <div className="panel-card">
          <div className="panel-title-row">
            <h3>Create Invoice</h3>
          </div>

          <form className="form-grid" onSubmit={handleInvoice}>
            <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}>
              <option value="">Select patient</option>
              {patients.map((pt) => (
                <option key={pt.id} value={pt.id}>{pt.first_name} {pt.last_name}</option>
              ))}
            </select>

            {items.map((item, index) => (
              <div key={index} className="invoice-row">
                <input value={item.description} onChange={(e) => updateLine(index, 'description', e.target.value)} placeholder="Service" />
                <input type="number" value={item.quantity} onChange={(e) => updateLine(index, 'quantity', e.target.value)} placeholder="Qty" />
                <input type="number" value={item.unit_price} onChange={(e) => updateLine(index, 'unit_price', e.target.value)} placeholder="Price" />
              </div>
            ))}

            <button type="button" className="secondary-btn" onClick={addLine}>Add Line</button>
            <button type="submit" className="full-width">Generate Invoice</button>
          </form>
        </div>

        <div className="panel-card">
          <div className="panel-title-row">
            <h3>Invoices</h3>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Patient</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.invoice_number}</td>
                  <td>{invoice.first_name} {invoice.last_name}</td>
                  <td>${Number(invoice.total_amount || 0).toLocaleString()}</td>
                  <td><span className="status-badge">{invoice.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
