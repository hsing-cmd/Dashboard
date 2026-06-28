import { useState, useEffect } from 'react';

interface MemberTarget {
  id: string;
  member_name: string;
  member_id: string;
  year: number;
  quarter: string;
  amount: number;
}

interface MemberRealized {
  id: string;
  member_name: string;
  member_id: string;
  year: number;
  quarter: string;
  amount: number;
}

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

function formatJPY(amount: number): string {
  if (amount === 0) return '—';
  return '¥' + amount.toLocaleString('ja-JP');
}

interface Props {
  year: number;
}

export default function GoalsPage({ year }: Props) {
  const [targets, setTargets] = useState<MemberTarget[]>([]);
  const [realized, setRealized] = useState<MemberRealized[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [targetsRes, realizedRes] = await Promise.all([
          fetch('/json/member_targets'),
          fetch('/json/member_realized'),
        ]);
        const targetsData: MemberTarget[] = await targetsRes.json();
        const realizedData: MemberRealized[] = await realizedRes.json();

        setTargets(targetsData.filter(t => t.year === year));
        setRealized(realizedData.filter(r => r.year === year));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  if (loading) return <div className="state-msg">讀取中...</div>;

  const members = Array.from(new Set(targets.map(t => t.member_id))).map(id => ({
    id,
    name: targets.find(t => t.member_id === id)?.member_name || id,
  }));

  const getTarget = (memberId: string, quarter: string) =>
    targets.find(t => t.member_id === memberId && t.quarter === quarter)?.amount || 0;

  const getRealized = (memberId: string, quarter: string) =>
    realized.find(r => r.member_id === memberId && r.quarter === quarter)?.amount || 0;

  const getRate = (realized: number, target: number): number | null => {
    if (target === 0) return null;
    return Math.round((realized / target) * 100);
  };

  return (
    <div>
      {/* 売上目標 */}
      <div className="quarter-section">
        <div className="month-header">
          <span className="month-title">売上目標</span>
          <span style={{ fontSize: 13, color: '#888' }}>{year}年度</span>
        </div>
        <table className="sales-table">
          <thead>
            <tr>
              <th>Quarter</th>
              {members.map(m => <th key={m.id} style={{ textAlign: 'right' }}>{m.name}</th>)}
              <th style={{ textAlign: 'right' }}>合計</th>
            </tr>
          </thead>
          <tbody>
            {QUARTERS.map(q => {
              const total = members.reduce((sum, m) => sum + getTarget(m.id, q), 0);
              return (
                <tr key={q}>
                  <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{q}</td>
                  {members.map(m => (
                    <td key={m.id} className="amount-cell">
                      {formatJPY(getTarget(m.id, q))}
                    </td>
                  ))}
                  <td className="amount-cell" style={{ fontWeight: 700 }}>
                    {formatJPY(total)}
                  </td>
                </tr>
              );
            })}
            <tr className="qct-total-row">
              <td style={{ fontWeight: 700 }}>年度合計</td>
              {members.map(m => {
                const total = QUARTERS.reduce((sum, q) => sum + getTarget(m.id, q), 0);
                return <td key={m.id} className="amount-cell">{formatJPY(total)}</td>;
              })}
              <td className="amount-cell">
                {formatJPY(QUARTERS.reduce((sum, q) =>
                  sum + members.reduce((s, m) => s + getTarget(m.id, q), 0), 0))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 売上実績集計 */}
      <div className="quarter-section">
        <div className="month-header">
          <span className="month-title">売上実績集計</span>
          <span style={{ fontSize: 13, color: '#888' }}>{year}年度</span>
        </div>
        <table className="sales-table">
          <thead>
            <tr>
              <th>Quarter</th>
              {members.map(m => <th key={m.id} style={{ textAlign: 'right' }}>{m.name}</th>)}
              <th style={{ textAlign: 'right' }}>合計</th>
            </tr>
          </thead>
          <tbody>
            {QUARTERS.map(q => {
              const total = members.reduce((sum, m) => sum + getRealized(m.id, q), 0);
              return (
                <tr key={q}>
                  <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{q}</td>
                  {members.map(m => {
                    const r = getRealized(m.id, q);
                    const t = getTarget(m.id, q);
                    const rate = getRate(r, t);
                    return (
                      <td key={m.id} className="amount-cell">
                        <div>{formatJPY(r)}</div>
                        {rate !== null && r > 0 && (
                          <div style={{ fontSize: 11, color: rate >= 100 ? '#2e7d32' : '#2E75B6' }}>
                            {rate}%
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="amount-cell" style={{ fontWeight: 700 }}>
                    {total === 0 ? '—' : formatJPY(total)}
                  </td>
                </tr>
              );
            })}
            <tr className="qct-total-row">
              <td style={{ fontWeight: 700 }}>年度合計</td>
              {members.map(m => {
                const total = QUARTERS.reduce((sum, q) => sum + getRealized(m.id, q), 0);
                const targetTotal = QUARTERS.reduce((sum, q) => sum + getTarget(m.id, q), 0);
                const rate = getRate(total, targetTotal);
                return (
                  <td key={m.id} className="amount-cell">
                    <div>{total === 0 ? '—' : formatJPY(total)}</div>
                    {rate !== null && total > 0 && (
                      <div style={{ fontSize: 11, color: rate >= 100 ? '#2e7d32' : '#2E75B6' }}>
                        {rate}%
                      </div>
                    )}
                  </td>
                );
              })}
              <td className="amount-cell">
                {formatJPY(QUARTERS.reduce((sum, q) =>
                  sum + members.reduce((s, m) => s + getRealized(m.id, q), 0), 0))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}