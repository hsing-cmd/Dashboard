import { useState, useEffect } from 'react'
import './App.css'
import { EmptyState } from './components/EmptyState'
import { MetricCard } from './components/MetricCard'
import { SidePanel } from './components/SidePanel'
import { AddEntryModal } from './components/AddEntryModal'
import QuarterlyComparisonTable from './components/QuarterlyComparisonTable'
import GoalsPage from './components/GoalsPage'
import { LayoutDashboard, TrendingUp, Folder, Target, type LucideIcon } from 'lucide-react'
import type { OkaneEntry } from './types/item'

type Page = 'dashboard' | 'entries' | 'sales' | 'goals'
type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

type NavItem = { id: Page; label: string; icon: LucideIcon }

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { id: 'sales',     label: '売上一覧',       icon: TrendingUp },
  { id: 'entries',   label: '案件一覧',       icon: Folder },
  { id: 'goals',     label: '個人売上目標',    icon: Target },
]

const selectStyle = {
  padding: '6px 10px',
  border: '1px solid #ccc',
  borderRadius: 20,
  fontSize: 13,
  cursor: 'pointer',
}

function App() {
  const [items, setItems] = useState<OkaneEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<OkaneEntry | null>(null);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date-desc');
  const [filterConfidence, setFilterConfidence] = useState('all');
  const [filterMember, setFilterMember] = useState('all');

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

  const handleMarkRealized = async (item: OkaneEntry) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const updated: OkaneEntry = {
      ...item,
      stage: 'realized',
      date: dateStr,
    };

    await fetch(`/json/entries/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: 'realized', date: dateStr }),
    });

    setItems(prev => prev.map(i => i.id === item.id ? updated : i));
  };

  const sortFn = (a: OkaneEntry, b: OkaneEntry) => {
    if (sortKey === 'date-desc') {
      return new Date(b.year, (b.month||1)-1, b.day||1).getTime() - new Date(a.year, (a.month||1)-1, a.day||1).getTime();
    }
    if (sortKey === 'date-asc') {
      return new Date(a.year, (a.month||1)-1, a.day||1).getTime() - new Date(b.year, (b.month||1)-1, b.day||1).getTime();
    }
    if (sortKey === 'amount-desc') return Number(b.amount) - Number(a.amount);
    return Number(a.amount) - Number(b.amount);
  };

  const upcomingItems = items
    .filter(i => i.stage === 'upcoming' && i.type === 'in')
    .filter(i => i.summary?.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(i => filterConfidence === 'all' || i.confidence === filterConfidence)
    .filter(i => filterMember === 'all' || i.member_name === filterMember)
    .sort(sortFn);

  const groupedByMonth = upcomingItems.reduce((groups, item) => {
    const key = `${item.year}年${item.month ? `${item.month}月` : ''}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {} as Record<string, OkaneEntry[]>);

  const salesItems = items
    .filter(i => i.type === 'in' && (i.stage === 'realized' || i.stage === 'upcoming'))
    .filter(i => i.summary?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort(sortFn);

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

  const memberNames = Array.from(new Set(items.filter(i => i.member_name).map(i => i.member_name)));

  const SortSelect = ({ count, showAdd }: { count: number; showAdd?: boolean }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
      <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)} style={selectStyle}>
        <option value="date-desc">日付（新しい順）</option>
        <option value="date-asc">日付（古い順）</option>
        <option value="amount-desc">金額（高い順）</option>
        <option value="amount-asc">金額（低い順）</option>
      </select>
      {showAdd && (
        <button className="btn-add" onClick={() => setShowAddModal(true)}>＋ 新規追加</button>
      )}
      {searchQuery && (
        <span style={{ fontSize: 13, color: '#888' }}>{count} 件見つかりました</span>
      )}
    </div>
  );

  if (loading) return <div className="state-msg">讀取中...</div>;
  if (error) return <div className="state-msg error">錯誤: {error}</div>;

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-logo">OKANE</div>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0' }}>
          <input
            type="text"
            placeholder="検索..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <item.icon size={16} />
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
                  <h2>⚠️ 請求書の発行を確認してください!!</h2>
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
              <SortSelect count={salesItems.length} showAdd />
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <select value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)} style={selectStyle}>
                  <option value="date-desc">日付（新しい順）</option>
                  <option value="date-asc">日付（古い順）</option>
                  <option value="amount-desc">金額（高い順）</option>
                  <option value="amount-asc">金額（低い順）</option>
                </select>
                <select value={filterConfidence} onChange={e => setFilterConfidence(e.target.value)} style={selectStyle}>
                  <option value="all">確度：全て</option>
                  <option value="committed">確定</option>
                  <option value="expected">見込み</option>
                  <option value="possible">提案中</option>
                </select>
                <select value={filterMember} onChange={e => setFilterMember(e.target.value)} style={selectStyle}>
                  <option value="all">担当者：全て</option>
                  {memberNames.map(name => (
                    <option key={name} value={name!}>{name}</option>
                  ))}
                </select>
                <button className="btn-add" onClick={() => setShowAddModal(true)}>＋ 新規追加</button>
                {searchQuery && (
                  <span style={{ fontSize: 13, color: '#888' }}>{upcomingItems.length} 件見つかりました</span>
                )}
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
                          <th>概要</th><th>クライアント</th><th>担当者</th><th>確度</th><th>金額</th><th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthItems.map(item => (
                          <tr key={item.id} className="table-row-clickable">
                            <td onClick={() => setSelectedItem(item)}>{item.summary}</td>
                            <td onClick={() => setSelectedItem(item)}>{item.contact || '-'}</td>
                            <td onClick={() => setSelectedItem(item)}>{item.member_name || '-'}</td>
                            <td onClick={() => setSelectedItem(item)}>
                              <span className={`status-badge badge-${item.confidence}`}>
                                {item.confidence === 'committed' ? '確定' :
                                 item.confidence === 'expected' ? '見込み' :
                                 item.confidence === 'possible' ? '提案中' : '-'}
                              </span>
                            </td>
                            <td className="amount-cell" onClick={() => setSelectedItem(item)}>
                              ¥{Number(item.amount).toLocaleString()}
                            </td>
                            <td>
                              <button
                                onClick={e => { e.stopPropagation(); handleMarkRealized(item); }}
                                style={{
                                  padding: '3px 10px',
                                  fontSize: 11,
                                  border: '1px solid #2e7d32',
                                  borderRadius: 20,
                                  background: 'white',
                                  color: '#2e7d32',
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                ✓ 実績へ
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))
              )}
            </>
          )}

          {/* 個人売上目標 */}
          {activePage === 'goals' && (
            <GoalsPage year={2025} />
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