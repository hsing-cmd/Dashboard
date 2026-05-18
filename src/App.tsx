import { useState, useEffect } from 'react'
import './App.css'
// --- 新增：從 components 資料夾匯入組件 ---
import { ItemCard } from './components/ItemCard'
import { EmptyState } from './components/EmptyState'
// --- 新增：從 types 資料夾匯入型別 ---
import type { OkaneEntry } from './types/item'

// 💡 刪除了已經用不到的 interface RawTodo，保持程式碼乾淨

function App() {
  // 1. 這裡原本是 useState<Item[]>，改用全新的 OkaneEntry[] 貼紙
  const [items, setItems] = useState<OkaneEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 2. 將基礎網址換成正確的 OKANE API
  const API_BASE_URL = 'https://okane.uniba.jp/api';

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        // 3. 把路徑從 /todos... 改成 /entries
        const response = await fetch(`${API_BASE_URL}/entries`);
        if (!response.ok) throw new Error('API 連線失敗');
        
        // 4. 解析出後端回傳的根物件
        const data = await response.json();
        
        // 5. 徹底移除舊的 .map 轉換邏輯。
        // 因為 data 的結構是 { entries: [...] }，我們直接取出 entries 陣列並塞入 State
        setItems(data.entries || []);
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
      {/* 順便把大標題改成更符合記帳/財務的名稱 */}
      <h1>OKANE Dashboard</h1>
      
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="list-wrapper">
          {items.map(item => (
            // 這裡傳進去的 item 已經是完美的 OkaneEntry 結構
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;