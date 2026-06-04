interface MetricCardProps {
    label: string;      // 標題，例如「目標（年次）」
    amount: number;     // 金額
    sub?: string;       // 補充說明（可選）
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