import type { OkaneEntry } from '../types/item';

export const ItemCard = ({ item }: { item: OkaneEntry }) => (
  <div className="list-card">
    <div className="card-info">
      <span className="item-title">{item.summary}</span>
      <span className="item-date">{item.year}年 {item.month}月</span>
    </div>
    <div className="card-right">
    <span className="item-amount">¥{Number(item.amount).toLocaleString()}</span>
      <span className={`status-badge ${item.stage.toLowerCase()}`}>
        {item.stage}
      </span>
    </div>
  </div>
);