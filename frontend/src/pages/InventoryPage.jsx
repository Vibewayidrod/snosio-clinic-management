import { useEffect, useState } from 'react';
import api from '../services/api';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [form, setForm] = useState({
    name: '',
    category: 'Medication',
    stock_quantity: 0,
    reorder_level: 5,
    unit_price: 0,
    supplier: '',
  });

  const loadInventory = async () => {
    const res = await api.get('/inventory');
    setInventory(res.data.inventory || []);
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/inventory', form);
    setForm({ name: '', category: 'Medication', stock_quantity: 0, reorder_level: 5, unit_price: 0, supplier: '' });
    loadInventory();
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Supplies</p>
          <h1>Inventory</h1>
        </div>
      </header>

      <div className="grid-two">
        <div className="panel-card">
          <div className="panel-title-row">
            <h3>Add Medicine / Item</h3>
          </div>

          <form className="form-grid" onSubmit={handleCreate}>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Item name" />
            <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" />
            <input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} placeholder="Stock quantity" />
            <input type="number" value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} placeholder="Reorder level" />
            <input type="number" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} placeholder="Unit price" />
            <input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier" />
            <button type="submit" className="full-width">Save Item</button>
          </form>
        </div>

        <div className="panel-card">
          <div className="panel-title-row">
            <h3>Stock Overview</h3>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Reorder</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.stock_quantity}</td>
                  <td>{item.reorder_level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
