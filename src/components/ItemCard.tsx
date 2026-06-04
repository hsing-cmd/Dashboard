import type { OkaneEntry } from '../types/item';

const getStageBadge = (stage: string) => {
  switch (stage) {
    case 'target': return { label: '目標', className: 'badge-target' };
    case 'upcoming': return { label: '予定', className: 'badge-upcoming' };
    case 'realized': return { label: '実績', className: 'badge-realized' };
    default: return { label: stage, className: '' };
  }
};

const getConfidenceBadge = (confidence: string | null) => {
  switch (confidence) {
    case 'committed': return { label: '確定', className: 'badge-committed' };
    case 'expected': return { label: '見込み', className: 'badge-expected' };
    case 'possible': return { label: '可能性', className: 'badge-possible' };
    default: return null;
  }
};

interface ItemCardProps {
  item: OkaneEntry;
  onClick: () => void;
}

export const ItemCard = ({ item, onClick }: ItemCardProps) => {
  const stage = getStageBadge(item.stage);
  const confidence = getConfidenceBadge(item.confidence);

  return (
    <div className="list-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="card-info">
        <span className="item-title">{item.summary}</span>
        <span className="item-category">{item.category}</span>
        <span className="item-date">{item.year}年 {item.month ? `${item.month}月` : ''} {item.day ? `${item.day}日` : ''}</span>
      </div>
      <div className="card-right">
        <span className="item-amount">¥{Number(item.amount).toLocaleString()}</span>
        <div className="badge-group">
          <span className={`status-badge ${item.type === 'in' ? 'income' : 'expense'}`}>
            {item.type === 'in' ? '収入' : '支出'}
          </span>
          <span className={`status-badge ${stage.className}`}>
            {stage.label}
          </span>
          {confidence && (
            <span className={`status-badge ${confidence.className}`}>
              {confidence.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};