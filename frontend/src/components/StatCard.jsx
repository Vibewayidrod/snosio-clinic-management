export default function StatCard({ title, value, subtitle, accent = 'blue' }) {
  return (
    <div className={`stat-card ${accent}`}>
      <div className="stat-header">
        <span>{title}</span>
      </div>
      <h3>{value}</h3>
      {subtitle && <small>{subtitle}</small>}
    </div>
  );
}
