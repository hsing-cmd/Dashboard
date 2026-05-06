// src/components/ItemCard.tsx
import type { Item } from '../types/item';

// 加上 export 關鍵字，這樣 App.tsx 才能匯入它
export const ItemCard = ({ item }: { item: Item }) => (
  <div className="list-card">
    <div className="card-info">
      <span className="item-title">{item.name}</span>
      <span className="item-date">{item.createdAt}</span>
    </div>
    <span className={`status-badge ${item.status.toLowerCase().replace(' ', '-')}`}>
      {item.status}
    </span>
  </div>
);