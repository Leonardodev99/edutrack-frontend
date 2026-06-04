import '../../styles/StatCard.css'

export default function StatCard({ icon: Icon, label, value, hint, tone = "primary" }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <div className="stat-icon">{Icon && <Icon size={22} />}</div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {hint && <div className="stat-hint">{hint}</div>}
      </div>
    </div>
  );
}
