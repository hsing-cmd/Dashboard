import { useState, useEffect } from 'react'
import './App.css'
// --- 新增：從 components 資料夾匯入組件 ---
import { ItemCard } from './components/ItemCard'
import { EmptyState } from './components/EmptyState'
// --- 新增：從 types 資料夾匯入型別 ---
import type { Item } from './types/item'

// 定義從 JSONPlaceholder 回傳的原始資料格式
interface RawTodo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/todos?_limit=5`);
        if (!response.ok) throw new Error('API 連線失敗');
        
        const data: RawTodo[] = await response.json();
        
        const formattedData: Item[] = data.map((todo: RawTodo) => ({
          id: todo.id,
          name: todo.title,
          status: todo.completed ? 'Done' : 'Todo',
          createdAt: new Date().toLocaleDateString(),
        }));
        
        setItems(formattedData);
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
      <h1>My Task Dashboard</h1>
      
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