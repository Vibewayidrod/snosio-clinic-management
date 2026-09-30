export default function Sidebar({ user, onLogout }) {
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
          <a key={item.path} href={item.path} className="nav-item">
            {item.label}
          </a>
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
