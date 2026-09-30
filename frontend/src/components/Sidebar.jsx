import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const links = [
    { label: 'Dashboard', path: '/' },
    { label: 'Patients', path: '/patients' },
    { label: 'Appointments', path: '/appointments' },
    { label: 'Billing', path: '/billing' },
    { label: 'Inventory', path: '/inventory' },
    { label: 'Prescriptions', path: '/prescriptions' },
    { label: 'Lab Tests', path: '/lab-tests' },
    { label: 'Reports', path: '/reports' },
  ];

  return (
    <aside className="sidebar">
      <div className="brand-box">
        <div className="brand-mark">S</div>
        <div>
          <h2>Snosio Clinic</h2>
          <small>Management Suite</small>
        </div>
      </div>

      <nav className="nav-menu">
        {links.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={location.pathname === item.path ? 'nav-item active' : 'nav-item'}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="user-panel">
        <div>
          <strong>{user?.name || 'User'}</strong>
          <p>{user?.role || 'Role'}</p>
        </div>
        <button className="logout-btn" onClick={onLogout}>Log out</button>
      </div>
    </aside>
  );
}
