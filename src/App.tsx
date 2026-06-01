import { useState, useEffect } from 'react'
import './App.css'
import { ItemCard } from './components/ItemCard'
import { EmptyState } from './components/EmptyState'
import type { OkaneEntry } from './types/item'

function App() {
  const [items, setItems] = useState<OkaneEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await fetch('/json/entries');
        if (!response.ok) throw new Error('API 連線失敗');
        const data = await response.json();
        setItems(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('発生未知錯誤');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) return <div className="state-msg">讀取中...</div>;
  if (error) return <div className="state-msg error">錯誤: {error}</div>;

  return (
    <div className="dashboard-container">
      <h1>OKANE Dashboard</h1>
      <div className="filter-buttons">
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>全部</button>
        <button onClick={() => setFilter('in')} className={filter === 'in' ? 'active' : ''}>収入</button>
        <button onClick={() => setFilter('out')} className={filter === 'out' ? 'active' : ''}>支出</button>
        <div className="total-amount">
          合計：¥{items
            .filter(item => filter === 'all' || item.type === filter)
            .reduce((sum, item) => sum + Number(item.amount), 0)
            .toLocaleString()}
        </div>
      </div>
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="list-wrapper">
          {items
            .filter(item => filter === 'all' || item.type === filter)
            .map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
        </div>
      )}
    </div>
  );
}

export default App;