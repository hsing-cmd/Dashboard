import { fetchFromGemini } from './geminiService';
import { useState, useEffect } from 'react'
import './App.css'
import { ItemCard } from './components/ItemCard'
import { EmptyState } from './components/EmptyState'
import type { OkaneEntry } from './types/item'

function App() {
  const [items, setItems] = useState<OkaneEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const rawText = await fetchFromGemini();
        const data = JSON.parse(rawText);
        setItems(data.entries);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('發生未知錯誤');
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
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="list-wrapper">
          {items.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;