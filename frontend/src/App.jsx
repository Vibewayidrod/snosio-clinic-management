import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import BillingPage from './pages/BillingPage';
import InventoryPage from './pages/InventoryPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import LabTestsPage from './pages/LabTestsPage';
import ReportsPage from './pages/ReportsPage';

function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      {user && <Sidebar user={user} onLogout={logout} />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/prescriptions" element={<PrescriptionsPage />} />
            <Route path="/lab-tests" element={<LabTestsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
