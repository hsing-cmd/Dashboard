interface MetricCardProps {
  label: string;
  amount: number;
  sub?: string;
}

export const MetricCard = ({ label, amount, sub }: MetricCardProps) => {
  return (
    <div className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-amount">¥{amount.toLocaleString()}</p>
      {sub && <p className="metric-sub">{sub}</p>}
    </div>
  );
};