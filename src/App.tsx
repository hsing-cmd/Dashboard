import { useState, useEffect } from 'react'
import './App.css'
import { ItemCard } from './components/ItemCard'
import { EmptyState } from './components/EmptyState'
import { MetricCard } from './components/MetricCard'
import { SidePanel } from './components/SidePanel'
import type { OkaneEntry } from './types/item'

const getSubCategory = (category: string): string => {
  const 人件費 = ['役員報酬', '給料手当', '法定福利費', '業務委託料', '役員賞与', '賞与'];
  const 運営費 = ['通信費', '地代家賃', 'チーム間取引支出'];
  const 設備費 = ['備品・消耗品費'];
  const 交通出張費 = ['旅費交通費', '福利厚生費'];
  const 売上 = ['売上高'];
  const チーム間 = ['チーム間取引収入'];

  if (人件費.includes(category)) return '人件費';
  if (運営費.includes(category)) return '運営費';
  if (設備費.includes(category)) return '設備費';
  if (交通出張費.includes(category)) return '交通・出張費';
  if (売上.includes(category)) return '売上';
  if (チーム間.includes(category)) return 'チーム間';
  return 'その他';
};

function App() {
  const [items, setItems] = useState<OkaneEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [subFilter, setSubFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<OkaneEntry | null>(null);

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

  const filteredItems = items
    .filter(item => filter === 'all' || item.type === filter)
    .filter(item => subFilter === 'all' || getSubCategory(item.category) === subFilter)
    .filter(item => stageFilter === 'all' || item.stage === stageFilter);

  const targetTotal = items
    .filter(i => i.stage === 'target' && i.type === 'in')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const upcomingTotal = items
    .filter(i => i.stage === 'upcoming' && i.type === 'in')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const realizedTotal = items
    .filter(i => i.stage === 'realized' && i.type === 'in')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  if (loading) return <div className="state-msg">讀取中...</div>;
  if (error) return <div className="state-msg error">錯誤: {error}</div>;

  return (
    <div className="dashboard-container">
      <h1>OKANE Dashboard</h1>

      {/* 指標卡 */}
      <div className="metric-grid">
        <MetricCard label="目標（年次）" amount={targetTotal} sub="target" />
        <MetricCard label="予定" amount={upcomingTotal} sub="upcoming" />
        <MetricCard label="実績" amount={realizedTotal} sub="realized" />
      </div>

      {/* 主篩選 */}
      <div className="filter-buttons">
        <button onClick={() => { setFilter('all'); setSubFilter('all'); }} className={filter === 'all' ? 'active' : ''}>全部</button>
        <button onClick={() => { setFilter('in'); setSubFilter('all'); }} className={filter === 'in' ? 'active' : ''}>収入</button>
        <button onClick={() => { setFilter('out'); setSubFilter('all'); }} className={filter === 'out' ? 'active' : ''}>支出</button>
        <div className="total-amount">
          合計：¥{filteredItems
            .reduce((sum, item) => sum + Number(item.amount), 0)
            .toLocaleString()}
        </div>
      </div>

      {/* Stage 篩選 */}
      <div className="filter-buttons sub">
        <button onClick={() => setStageFilter('all')} className={stageFilter === 'all' ? 'active' : ''}>全て</button>
        <button onClick={() => setStageFilter('target')} className={stageFilter === 'target' ? 'active' : ''}>目標</button>
        <button onClick={() => setStageFilter('upcoming')} className={stageFilter === 'upcoming' ? 'active' : ''}>予定</button>
        <button onClick={() => setStageFilter('realized')} className={stageFilter === 'realized' ? 'active' : ''}>実績</button>
      </div>

      {/* 収入細項篩選 */}
      {filter === 'in' && (
        <div className="filter-buttons sub">
          <button onClick={() => setSubFilter('all')} className={subFilter === 'all' ? 'active' : ''}>全て</button>
          <button onClick={() => setSubFilter('売上')} className={subFilter === '売上' ? 'active' : ''}>売上</button>
          <button onClick={() => setSubFilter('チーム間')} className={subFilter === 'チーム間' ? 'active' : ''}>チーム間</button>
        </div>
      )}

      {/* 支出細項篩選 */}
      {filter === 'out' && (
        <div className="filter-buttons sub">
          <button onClick={() => setSubFilter('all')} className={subFilter === 'all' ? 'active' : ''}>全て</button>
          <button onClick={() => setSubFilter('人件費')} className={subFilter === '人件費' ? 'active' : ''}>人件費</button>
          <button onClick={() => setSubFilter('運営費')} className={subFilter === '運営費' ? 'active' : ''}>運営費</button>
          <button onClick={() => setSubFilter('設備費')} className={subFilter === '設備費' ? 'active' : ''}>設備費</button>
          <button onClick={() => setSubFilter('交通・出張費')} className={subFilter === '交通・出張費' ? 'active' : ''}>交通・出張費</button>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="list-wrapper">
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>
      )}

      <SidePanel
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSave={(updated) => {
          setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
          setSelectedItem(null);
        }}
      />
    </div>
  );
}

export default App;