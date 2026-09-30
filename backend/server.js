import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import db from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'snosio-clinic-secret-key-change-this';

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
}

function getCurrentUser(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.id);
    return user ? { ...user, password_hash: undefined } : null;
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized. Please log in again.' });
  }

  req.user = user;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied for this role.' });
    }
    next();
  };
}

const formatUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  specialty: user.specialty,
  department: user.department,
  active: user.active,
  created_at: user.created_at,
});

const formatPatient = (patient) => ({
  ...patient,
  full_name: `${patient.first_name} ${patient.last_name}`,
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Snosio Clinic API is running.' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const token = signToken(user);
  return res.json({
    token,
    user: formatUser(user),
  });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: formatUser(req.user) });
});

app.get('/api/dashboard', requireAuth, (req, res) => {
  try {
    const totalPatients = db.prepare('SELECT COUNT(*) AS total FROM patients').get().total;
    const totalDoctors = db.prepare('SELECT COUNT(*) AS total FROM users WHERE role = ?').get('doctor').total;
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = db.prepare(
      'SELECT COUNT(*) AS total FROM appointments WHERE appointment_date = ?'
    ).get(today).total;

    const pendingInvoices = db.prepare(
      "SELECT COUNT(*) AS total FROM invoices WHERE status != 'paid'"
    ).get().total;

    const totalRevenue = db.prepare('SELECT COALESCE(SUM(total_amount), 0) AS total FROM invoices').get().total;

    const recentAppointments = db.prepare(`
      SELECT a.*, p.first_name, p.last_name, u.name AS doctor_name
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      JOIN users u ON u.id = a.doctor_id
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      LIMIT 5
    `).all();

    return res.json({
      totalPatients,
      totalDoctors,
      todayAppointments,
      pendingInvoices,
      totalRevenue,
      recentAppointments,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load dashboard data.', details: error.message });
  }
});

app.get('/api/patients', requireAuth, (req, res) => {
  const patients = db.prepare('SELECT * FROM patients ORDER BY created_at DESC').all();
  res.json({ patients: patients.map(formatPatient) });
});

app.post('/api/patients', requireAuth, (req, res) => {
  const { first_name, last_name, dob, gender, phone, email, address, emergency_contact, insurance_number, allergies, notes } = req.body || {};

  if (!first_name || !last_name) {
    return res.status(400).json({ message: 'First name and last name are required.' });
  }

  const patientId = `P-${Math.floor(1000 + Math.random() * 9000)}`;
  const id = randomUUID();

  const patient = {
    id,
    patient_id: patientId,
    first_name,
    last_name,
    dob: dob || null,
    gender: gender || 'Unknown',
    phone: phone || '',
    email: email || '',
    address: address || '',
    emergency_contact: emergency_contact || '',
    insurance_number: insurance_number || '',
    allergies: allergies || '',
    notes: notes || '',
  };

  const insert = db.prepare(`
    INSERT INTO patients (
      id, patient_id, first_name, last_name, dob, gender, phone, email, address, emergency_contact, insurance_number, allergies, notes
    ) VALUES (
      @id, @patient_id, @first_name, @last_name, @dob, @gender, @phone, @email, @address, @emergency_contact, @insurance_number, @allergies, @notes
    )
  `);
  insert.run(patient);

  res.status(201).json({ message: 'Patient created successfully.', patient: formatPatient(patient) });
});

app.get('/api/patients/:id', requireAuth, (req, res) => {
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!patient) return res.status(404).json({ message: 'Patient not found.' });

  const appointments = db.prepare(`
    SELECT a.*, u.name AS doctor_name
    FROM appointments a
    JOIN users u ON u.id = a.doctor_id
    WHERE a.patient_id = ?
    ORDER BY a.appointment_date DESC
  `).all(patient.id);

  const consultations = db.prepare(`
    SELECT c.*, u.name AS doctor_name
    FROM consultations c
    JOIN users u ON u.id = c.doctor_id
    WHERE c.patient_id = ?
    ORDER BY c.created_at DESC
  `).all(patient.id);

  const prescriptions = db.prepare(`
    SELECT p.*, u.name AS doctor_name
    FROM prescriptions p
    JOIN users u ON u.id = p.doctor_id
    WHERE p.patient_id = ?
    ORDER BY p.created_at DESC
  `).all(patient.id);

  return res.json({ patient: formatPatient(patient), appointments, consultations, prescriptions });
});

app.put('/api/patients/:id', requireAuth, (req, res) => {
  const { first_name, last_name, dob, gender, phone, email, address, emergency_contact, insurance_number, allergies, notes } = req.body || {};

  const update = db.prepare(`
    UPDATE patients
    SET first_name = ?, last_name = ?, dob = ?, gender = ?, phone = ?, email = ?, address = ?, emergency_contact = ?, insurance_number = ?, allergies = ?, notes = ?
    WHERE id = ?
  `);

  update.run(
    first_name || '',
    last_name || '',
    dob || '',
    gender || 'Unknown',
    phone || '',
    email || '',
    address || '',
    emergency_contact || '',
    insurance_number || '',
    allergies || '',
    notes || '',
    req.params.id
  );

  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  res.json({ message: 'Patient updated.', patient: formatPatient(patient) });
});

app.get('/api/doctors', requireAuth, (req, res) => {
  const doctors = db.prepare('SELECT * FROM users WHERE role = ? ORDER BY name').all('doctor');
  res.json({ doctors: doctors.map(formatUser) });
});

app.get('/api/appointments', requireAuth, (req, res) => {
  const appointments = db.prepare(`
    SELECT a.*, p.first_name, p.last_name, u.name AS doctor_name
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    JOIN users u ON u.id = a.doctor_id
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `).all();
  res.json({ appointments });
});

app.post('/api/appointments', requireAuth, (req, res) => {
  const { patient_id, doctor_id, appointment_date, appointment_time, reason, notes } = req.body || {};

  if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
    return res.status(400).json({ message: 'Patient, doctor, date, and time are required.' });
  }

  const appointment = {
    id: randomUUID(),
    patient_id,
    doctor_id,
    appointment_date,
    appointment_time,
    status: 'scheduled',
    reason: reason || '',
    notes: notes || '',
  };

  db.prepare(`
    INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, reason, notes)
    VALUES (@id, @patient_id, @doctor_id, @appointment_date, @appointment_time, @status, @reason, @notes)
  `).run(appointment);

  res.status(201).json({ message: 'Appointment scheduled successfully.', appointment });
});

app.put('/api/appointments/:id/status', requireAuth, (req, res) => {
  const { status } = req.body || {};

  db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status || 'scheduled', req.params.id);
  const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);

  res.json({ message: 'Appointment status updated.', appointment });
});

app.get('/api/invoices', requireAuth, (req, res) => {
  const invoices = db.prepare(`
    SELECT i.*, p.first_name, p.last_name, p.patient_id
    FROM invoices i
    JOIN patients p ON p.id = i.patient_id
    ORDER BY i.issue_date DESC
  `).all();

  const withItems = invoices.map((invoice) => ({
    ...invoice,
    items: db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(invoice.id),
  }));

  res.json({ invoices: withItems });
});

app.post('/api/invoices', requireAuth, (req, res) => {
  const { patient_id, items, due_date } = req.body || {};

  if (!patient_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Patient and invoice items are required.' });
  }

  const invoiceId = randomUUID();
  const invoiceNumber = `INV-${Math.floor(10000 + Math.random() * 90000)}`;
  const total = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0);

  db.prepare(`INSERT INTO invoices (id, patient_id, invoice_number, total_amount, paid_amount, status, due_date)
    VALUES (?, ?, ?, ?, 0, 'unpaid', ?)`)
    .run(invoiceId, patient_id, invoiceNumber, total, due_date || null);

  const insertItem = db.prepare(`INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price) VALUES (?, ?, ?, ?, ?)`);
  for (const item of items) {
    insertItem.run(randomUUID(), invoiceId, item.description, Number(item.quantity) || 1, Number(item.unit_price) || 0);
  }

  const invoice = db.prepare(`
    SELECT i.*, p.first_name, p.last_name, p.patient_id
    FROM invoices i
    JOIN patients p ON p.id = i.patient_id
    WHERE i.id = ?
  `).get(invoiceId);

  invoice.items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(invoiceId);
  res.status(201).json({ message: 'Invoice created successfully.', invoice });
});

app.post('/api/payments', requireAuth, (req, res) => {
  const { invoice_id, amount } = req.body || {};

  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoice_id);
  if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });

  const totalPayment = Number(amount) || 0;
  const existing = Number(invoice.paid_amount) || 0;
  const nextPaid = existing + totalPayment;
  const status = nextPaid >= Number(invoice.total_amount) ? 'paid' : 'partial';

  db.prepare('UPDATE invoices SET paid_amount = ?, status = ? WHERE id = ?').run(nextPaid, status, invoice_id);
  res.json({ message: 'Payment recorded.', invoice: db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoice_id) });
});

app.get('/api/inventory', requireAuth, (req, res) => {
  const inventory = db.prepare('SELECT * FROM inventory ORDER BY created_at DESC').all();
  res.json({ inventory });
});

app.post('/api/inventory', requireAuth, (req, res) => {
  const { name, category, stock_quantity, reorder_level, unit_price, supplier } = req.body || {};
  if (!name) return res.status(400).json({ message: 'Medicine name is required.' });

  const item = {
    id: randomUUID(),
    name,
    category: category || 'General',
    stock_quantity: Number(stock_quantity) || 0,
    reorder_level: Number(reorder_level) || 5,
    unit_price: Number(unit_price) || 0,
    supplier: supplier || 'Unknown',
  };

  db.prepare(`
    INSERT INTO inventory (id, name, category, stock_quantity, reorder_level, unit_price, supplier)
    VALUES (@id, @name, @category, @stock_quantity, @reorder_level, @unit_price, @supplier)
  `).run(item);

  res.status(201).json({ message: 'Inventory item added.', item });
});

app.get('/api/prescriptions', requireAuth, (req, res) => {
  const prescriptions = db.prepare(`
    SELECT p.*, pt.first_name, pt.last_name, u.name AS doctor_name
    FROM prescriptions p
    JOIN patients pt ON pt.id = p.patient_id
    JOIN users u ON u.id = p.doctor_id
    ORDER BY p.created_at DESC
  `).all();
  res.json({ prescriptions });
});

app.post('/api/prescriptions', requireAuth, (req, res) => {
  const { patient_id, doctor_id, medication_name, dosage, frequency, duration, instructions } = req.body || {};
  if (!patient_id || !doctor_id || !medication_name) {
    return res.status(400).json({ message: 'Patient, doctor, and medication name are required.' });
  }

  const prescription = {
    id: randomUUID(),
    patient_id,
    doctor_id,
    medication_name,
    dosage: dosage || '',
    frequency: frequency || '',
    duration: duration || '',
    instructions: instructions || '',
    status: 'active',
  };

  db.prepare(`
    INSERT INTO prescriptions (id, patient_id, doctor_id, medication_name, dosage, frequency, duration, instructions, status)
    VALUES (@id, @patient_id, @doctor_id, @medication_name, @dosage, @frequency, @duration, @instructions, @status)
  `).run(prescription);

  res.status(201).json({ message: 'Prescription created.', prescription });
});

app.get('/api/lab-tests', requireAuth, (req, res) => {
  const tests = db.prepare(`
    SELECT l.*, p.first_name, p.last_name, u.name AS doctor_name
    FROM lab_tests l
    JOIN patients p ON p.id = l.patient_id
    JOIN users u ON u.id = l.doctor_id
    ORDER BY l.created_at DESC
  `).all();
  res.json({ tests });
});

app.post('/api/lab-tests', requireAuth, (req, res) => {
  const { patient_id, doctor_id, test_name, result, status, notes } = req.body || {};
  if (!patient_id || !doctor_id || !test_name) {
    return res.status(400).json({ message: 'Patient, doctor, and test name are required.' });
  }

  const test = {
    id: randomUUID(),
    patient_id,
    doctor_id,
    test_name,
    result: result || '',
    status: status || 'pending',
    notes: notes || '',
  };

  db.prepare(`
    INSERT INTO lab_tests (id, patient_id, doctor_id, test_name, result, status, notes)
    VALUES (@id, @patient_id, @doctor_id, @test_name, @result, @status, @notes)
  `).run(test);

  res.status(201).json({ message: 'Lab test recorded.', test });
});

app.get('/api/reports', requireAuth, (req, res) => {
  const summary = {
    totalPatients: db.prepare('SELECT COUNT(*) as total FROM patients').get().total,
    totalAppointments: db.prepare('SELECT COUNT(*) as total FROM appointments').get().total,
    totalInvoices: db.prepare('SELECT COUNT(*) as total FROM invoices').get().total,
    totalRevenue: db.prepare('SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices').get().total,
    pendingPayments: db.prepare("SELECT COUNT(*) as total FROM invoices WHERE status != 'paid'").get().total,
    lowStockItems: db.prepare('SELECT COUNT(*) as total FROM inventory WHERE stock_quantity <= reorder_level').get().total,
  };

  const revenueByMonth = db.prepare(`
    SELECT strftime('%Y-%m', issue_date) AS month, SUM(total_amount) AS total
    FROM invoices
    GROUP BY strftime('%Y-%m', issue_date)
    ORDER BY month DESC
    LIMIT 6
  `).all();

  res.json({ summary, revenueByMonth });
});

app.listen(PORT, () => console.log(`Snosio Clinic API running on http://localhost:${PORT}`));
