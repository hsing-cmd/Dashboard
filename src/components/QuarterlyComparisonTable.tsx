import type { OkaneEntry } from '../types/item';

interface Props {
  items: OkaneEntry[];
  year: number;
}

interface QuarterData {
  label: string;
  target: number;
  realized: number;
  upcoming: number;
}

function formatJPY(amount: number): string {
  if (amount === 0) return '—';
  return '¥' + amount.toLocaleString('ja-JP');
}

function getQuarter(month: number): number {
  if (month >= 1 && month <= 3) return 0;
  if (month >= 4 && month <= 6) return 1;
  if (month >= 7 && month <= 9) return 2;
  return 3;
}

export default function QuarterlyComparisonTable({ items, year }: Props) {
  const annualTarget = items
    .filter(i => i.stage === 'target' && i.type === 'in' && i.year === year)
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const quarterTarget = annualTarget / 4;

  const quarters: QuarterData[] = [
    { label: 'Q1', target: quarterTarget, realized: 0, upcoming: 0 },
    { label: 'Q2', target: quarterTarget, realized: 0, upcoming: 0 },
    { label: 'Q3', target: quarterTarget, realized: 0, upcoming: 0 },
    { label: 'Q4', target: quarterTarget, realized: 0, upcoming: 0 },
  ];

  items
    .filter(i => i.stage === 'realized' && i.type === 'in' && i.year === year && i.month != null)
    .forEach(i => { quarters[getQuarter(i.month!)].realized += Number(i.amount); });

  items
    .filter(i => i.stage === 'upcoming' && i.type === 'in' && i.year === year && i.month != null)
    .forEach(i => { quarters[getQuarter(i.month!)].upcoming += Number(i.amount); });

  const totalRealized = quarters.reduce((s, q) => s + q.realized, 0);
  const totalUpcoming = quarters.reduce((s, q) => s + q.upcoming, 0);

  const RateCell = ({ realized, target }: { realized: number; target: number }) => {
    if (target === 0) return <td className="qct-rate-cell"><span className="qct-rate-empty">—</span></td>;
    const rate = Math.round((realized / target) * 100);
    const isAchieved = rate >= 100;
    const barWidth = Math.min(rate, 100);
    return (
      <td className="qct-rate-cell">
        <span className={isAchieved ? 'qct-rate-achieved' : 'qct-rate-shortfall'}>
          {realized === 0 ? '0%' : `${rate}%`}
        </span>
        <div className="qct-bar-wrap">
          <div
            className="qct-bar-fill"
            style={{
              width: `${realized === 0 ? 0 : barWidth}%`,
              background: isAchieved ? '#2e7d32' : '#2E75B6',
            }}
          />
        </div>
      </td>
    );
  };

  return (
    <div className="quarter-section">
      <div className="month-header">
        <span className="month-title">売上目標比較</span>
        <span className="month-total">
          {year}年度目標：{annualTarget > 0 ? '¥' + annualTarget.toLocaleString('ja-JP') : '未設定'}
        </span>
      </div>

      <table className="sales-table qct-table">
        <thead>
          <tr>
            <th style={{ width: 60 }}></th>
            <th className="qct-th-right">目標</th>
            <th className="qct-th-right">実績</th>
            <th className="qct-th-right">予定</th>
            <th className="qct-th-right" style={{ width: 88 }}>達成率</th>
          </tr>
        </thead>
        <tbody>
          {quarters.map(q => (
            <tr key={q.label}>
              <td style={{ fontWeight: 600, color: '#1a1a2e' }}>{q.label}</td>
              <td className="qct-td-right">{formatJPY(q.target)}</td>
              <td className="qct-td-right" style={{ color: q.realized > 0 ? '#1a1a2e' : '#ccc' }}>
                {formatJPY(q.realized)}
              </td>
              <td className="qct-td-right" style={{ color: q.upcoming > 0 ? '#888' : '#ccc' }}>
                {formatJPY(q.upcoming)}
              </td>
              <RateCell realized={q.realized} target={q.target} />
            </tr>
          ))}
          <tr className="qct-total-row">
            <td style={{ fontWeight: 700, color: '#1a1a2e' }}>合計</td>
            <td className="qct-td-right" style={{ fontWeight: 700 }}>{formatJPY(annualTarget)}</td>
            <td className="qct-td-right" style={{ fontWeight: 700, color: totalRealized > 0 ? '#1a1a2e' : '#ccc' }}>
              {formatJPY(totalRealized)}
            </td>
            <td className="qct-td-right" style={{ color: totalUpcoming > 0 ? '#888' : '#ccc' }}>
              {formatJPY(totalUpcoming)}
            </td>
            <RateCell realized={totalRealized} target={annualTarget} />
          </tr>
        </tbody>
      </table>

      <p className="qct-footnote">達成率 = 実績 ÷ 目標　／　予定は参考値</p>
    </div>
  );
}
