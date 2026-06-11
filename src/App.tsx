import { useState, useEffect } from 'react'
import './App.css'
import { EmptyState } from './components/EmptyState'
import { MetricCard } from './components/MetricCard'
import { SidePanel } from './components/SidePanel'
import { AddEntryModal } from './components/AddEntryModal'
import QuarterlyComparisonTable from './components/QuarterlyComparisonTable'
import type { OkaneEntry } from './types/item'

type Page = 'dashboard' | 'entries' | 'sales'

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'ダッシュボード', icon: '📊' },
  { id: 'sales',     label: '売上一覧',       icon: '📈' },
  { id: 'entries',   label: '案件一覧',       icon: '📁' },
]

function App() {
  const [items, setItems] = useState<OkaneEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<OkaneEntry | null>(null);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await fetch('/json/entries');
        if (!response.ok) throw new Error('API 連線失敗');
        const data = await response.json();
        setItems(data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError('発生未知錯誤');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const upcomingItems = items
    .filter(i => i.stage === 'upcoming' && i.type === 'in')
    .sort((a, b) => {
      const dateA = new Date(a.year, (a.month || 1) - 1, a.day || 1);
      const dateB = new Date(b.year, (b.month || 1) - 1, b.day || 1);
      return dateB.getTime() - dateA.getTime();
    });

  const groupedByMonth = upcomingItems.reduce((groups, item) => {
    const key = `${item.year}年${item.month ? `${item.month}月` : ''}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {} as Record<string, OkaneEntry[]>);

  const salesItems = items
    .filter(i => i.type === 'in' && (i.stage === 'realized' || i.stage === 'upcoming'))
    .sort((a, b) => {
      const dateA = new Date(a.year, (a.month || 1) - 1, a.day || 1);
      const dateB = new Date(b.year, (b.month || 1) - 1, b.day || 1);
      return dateB.getTime() - dateA.getTime();
    });

  const salesGroupedByMonth = salesItems.reduce((groups, item) => {
    const key = `${item.year}年${item.month ? `${item.month}月` : '月未定'}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {} as Record<string, OkaneEntry[]>);

  const today = new Date();
  const overdueItems = items.filter(item => {
    if (item.stage !== 'upcoming') return false;
    if (item.date) return new Date(item.date) <= today;
    if (item.year && item.month) return new Date(item.year, item.month - 1) <= today;
    return false;
  });

  const targetTotal = items.filter(i => i.stage === 'target' && i.type === 'in').reduce((sum, i) => sum + Number(i.amount), 0);
  const upcomingTotal = items.filter(i => i.stage === 'upcoming' && i.type === 'in').reduce((sum, i) => sum + Number(i.amount), 0);
  const realizedTotal = items.filter(i => i.stage === 'realized' && i.type === 'in').reduce((sum, i) => sum + Number(i.amount), 0);
  const gap = targetTotal - upcomingTotal - realizedTotal;

  if (loading) return <div className="state-msg">讀取中...</div>;
  if (error) return <div className="state-msg error">錯誤: {error}</div>;

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-logo">OKANE</div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              {item.id === 'dashboard' && overdueItems.length > 0 && (
                <span className="sidebar-badge">{overdueItems.length}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="app-main">
        <div className="dashboard-container">
          <div className="app-topbar">
            <h1 className="app-page-title">
              {NAV_ITEMS.find(i => i.id === activePage)?.label}
            </h1>
            {(activePage === 'entries' || activePage === 'sales') && (
              <button className="btn-add" onClick={() => setShowAddModal(true)}>
                ＋ 新規追加
              </button>
            )}
          </div>

          {/* ダッシュボード */}
          {activePage === 'dashboard' && (
            <>
              <div className="metric-grid">
                <MetricCard label="目標（年次）" amount={targetTotal} sub="target" />
                <MetricCard label="予定" amount={upcomingTotal} sub="upcoming" />
                <MetricCard label="実績" amount={realizedTotal} sub="realized" />
                <MetricCard label="目標まであと" amount={Math.abs(gap)} sub={gap > 0 ? '不足' : '達成'} />
              </div>

              <QuarterlyComparisonTable items={items} year={2026} />

              {overdueItems.length > 0 && (
                <div className="overdue-section">
                  <h2>⚠️ 請求書の発行を確認してください</h2>
                  <table className="sales-table">
                    <thead>
                      <tr>
                        <th>概要</th><th>クライアント</th><th>担当者</th><th>確度</th><th>金額</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overdueItems.map(item => (
                        <tr key={item.id} onClick={() => setSelectedItem(item)} className="table-row-clickable">
                          <td>{item.summary}</td>
                          <td>{item.contact || '-'}</td>
                          <td>{item.member_name || '-'}</td>
                          <td>{item.confidence || '-'}</td>
                          <td>¥{Number(item.amount).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* 売上一覧 */}
          {activePage === 'sales' && (
            <>
              <div className="filter-buttons">
                <div className="total-amount">売上合計：¥{realizedTotal.toLocaleString()}</div>
              </div>
              {salesItems.length === 0 ? <EmptyState /> : (
                Object.entries(salesGroupedByMonth).map(([month, monthItems]) => (
                  <div key={month} className="month-group">
                    <div className="month-header">
                      <span className="month-title">{month}</span>
                      <span className="month-total">
                        ¥{monthItems.reduce((sum, i) => sum + Number(i.amount), 0).toLocaleString()}
                      </span>
                    </div>
                    <table className="sales-table">
                      <thead>
                        <tr>
                          <th>概要</th><th>クライアント</th><th>担当者</th><th>ステージ</th><th>Split</th><th>金額</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthItems.map(item => (
                          <tr key={item.id} onClick={() => setSelectedItem(item)} className="table-row-clickable">
                            <td>{item.summary}</td>
                            <td>{item.contact || '-'}</td>
                            <td>{item.member_name || '-'}</td>
                            <td>
                              <span className={`status-badge badge-${item.stage}`}>
                                {item.stage === 'realized' ? '実績' : '予定'}
                              </span>
                            </td>
                            <td>
                              {item.splits && item.splits.length > 0
                                ? <span style={{ fontSize: 12, color: '#2E75B6' }}>{item.splits.length}件</span>
                                : <span style={{ fontSize: 12, color: '#ccc' }}>未設定</span>
                              }
                            </td>
                            <td className="amount-cell">¥{Number(item.amount).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              )}
            </>
          )}

          {/* 案件一覧 */}
          {activePage === 'entries' && (
            <>
              <div className="filter-buttons">
                <div className="total-amount">予定合計：¥{upcomingTotal.toLocaleString()}</div>
              </div>
              {upcomingItems.length === 0 ? <EmptyState /> : (
                Object.entries(groupedByMonth).map(([month, monthItems]) => (
                  <div key={month} className="month-group">
                    <div className="month-header">
                      <span className="month-title">{month}</span>
                      <span className="month-total">
                        ¥{monthItems.reduce((sum, i) => sum + Number(i.amount), 0).toLocaleString()}
                      </span>
                    </div>
                    <table className="sales-table">
                      <thead>
                        <tr>
                          <th>概要</th><th>クライアント</th><th>担当者</th><th>確度</th><th>金額</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthItems.map(item => (
                          <tr key={item.id} onClick={() => setSelectedItem(item)} className="table-row-clickable">
                            <td>{item.summary}</td>
                            <td>{item.contact || '-'}</td>
                            <td>{item.member_name || '-'}</td>
                            <td>
                              <span className={`status-badge badge-${item.confidence}`}>
                                {item.confidence === 'committed' ? '確定' :
                                 item.confidence === 'expected' ? '見込み' :
                                 item.confidence === 'possible' ? '提案中' : '-'}
                              </span>
                            </td>
                            <td className="amount-cell">¥{Number(item.amount).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </main>

      <SidePanel
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSave={(updated) => {
          setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
          setSelectedItem(null);
        }}
        onDelete={(id) => {
          setItems(prev => prev.filter(i => i.id !== id));
          setSelectedItem(null);
        }}
      />

      {showAddModal && (
        <AddEntryModal
          onClose={() => setShowAddModal(false)}
          onAdd={(entry) => {
            setItems(prev => [entry, ...prev]);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

export default App;