import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'clinic.db'));
db.pragma('journal_mode = WAL');

const adminPassword = bcrypt.hashSync('Admin@123', 10);
const doctorPassword = bcrypt.hashSync('Doctor@123', 10);
const receptionistPassword = bcrypt.hashSync('Reception@123', 10);
const nursePassword = bcrypt.hashSync('Nurse@123', 10);
const billingPassword = bcrypt.hashSync('Billing@123', 10);
const pharmacyPassword = bcrypt.hashSync('Pharmacy@123', 10);
const labPassword = bcrypt.hashSync('Lab@123', 10);

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  specialty TEXT,
  department TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  patient_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dob TEXT,
  gender TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  emergency_contact TEXT,
  insurance_number TEXT,
  allergies TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled',
  reason TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(patient_id) REFERENCES patients(id),
  FOREIGN KEY(doctor_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS consultations (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  diagnosis TEXT,
  notes TEXT,
  follow_up_date TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(patient_id) REFERENCES patients(id),
  FOREIGN KEY(doctor_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  duration TEXT,
  instructions TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(patient_id) REFERENCES patients(id),
  FOREIGN KEY(doctor_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  stock_quantity INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 5,
  unit_price REAL DEFAULT 0,
  supplier TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lab_tests (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  doctor_id TEXT NOT NULL,
  test_name TEXT NOT NULL,
  result TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(patient_id) REFERENCES patients(id),
  FOREIGN KEY(doctor_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  total_amount REAL DEFAULT 0,
  paid_amount REAL DEFAULT 0,
  status TEXT DEFAULT 'unpaid',
  issue_date TEXT DEFAULT CURRENT_TIMESTAMP,
  due_date TEXT,
  FOREIGN KEY(patient_id) REFERENCES patients(id)
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price REAL DEFAULT 0,
  FOREIGN KEY(invoice_id) REFERENCES invoices(id)
);
`;

const createTables = db.prepare(schema);
createTables.run();

const seedUsers = [
  {
    id: 'user-admin',
    name: 'System Administrator',
    email: 'admin@snosio.com',
    password_hash: adminPassword,
    role: 'admin',
    phone: '+254700000001',
    specialty: 'Administration',
    department: 'Management'
  },
  {
    id: 'user-doctor',
    name: 'Dr. Jane Smith',
    email: 'doctor@snosio.com',
    password_hash: doctorPassword,
    role: 'doctor',
    phone: '+254700000002',
    specialty: 'General Medicine',
    department: 'Clinical'
  },
  {
    id: 'user-reception',
    name: 'Michael Brown',
    email: 'reception@snosio.com',
    password_hash: receptionistPassword,
    role: 'receptionist',
    phone: '+254700000003',
    specialty: 'Front Desk',
    department: 'Front Office'
  },
  {
    id: 'user-nurse',
    name: 'Grace Johnson',
    email: 'nurse@snosio.com',
    password_hash: nursePassword,
    role: 'nurse',
    phone: '+254700000004',
    specialty: 'Nursing',
    department: 'Nursing'
  },
  {
    id: 'user-billing',
    name: 'Emma Davis',
    email: 'billing@snosio.com',
    password_hash: billingPassword,
    role: 'billing',
    phone: '+254700000005',
    specialty: 'Finance',
    department: 'Accounts'
  },
  {
    id: 'user-pharmacy',
    name: 'Samuel Green',
    email: 'pharmacy@snosio.com',
    password_hash: pharmacyPassword,
    role: 'pharmacist',
    phone: '+254700000006',
    specialty: 'Pharmacy',
    department: 'Pharmacy'
  },
  {
    id: 'user-lab',
    name: 'Ruth White',
    email: 'lab@snosio.com',
    password_hash: labPassword,
    role: 'lab',
    phone: '+254700000007',
    specialty: 'Laboratory',
    department: 'Diagnostics'
  }
];

const existingUsers = db.prepare('SELECT COUNT(*) AS count FROM users').get();
if (existingUsers.count === 0) {
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, phone, specialty, department)
    VALUES (@id, @name, @email, @password_hash, @role, @phone, @specialty, @department)
  `);

  const insertMany = db.transaction((users) => {
    for (const user of users) insertUser.run(user);
  });

  insertMany(seedUsers);
}

export default db;
