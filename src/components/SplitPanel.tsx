import { useState } from 'react';
import type { OkaneEntry, SplitEntry } from '../types/item';

interface Props {
  item: OkaneEntry;
  onClose: () => void;
  onSave: (updated: OkaneEntry) => void;
}

export function SplitPanel({ item, onClose, onSave }: Props) {
  const [splits, setSplits] = useState<SplitEntry[]>(item.splits ?? []);
  const [newMemberName, setNewMemberName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAmount = Number(item.amount);
  const totalSplit = splits.reduce((sum, s) => sum + Number(s.amount), 0);
  const remaining = totalAmount - totalSplit;

  const handleAdd = () => {
    const amt = Number(newAmount);
    if (!newMemberName.trim()) { setError('メンバー名を入力してください'); return; }
    if (!amt || amt <= 0) { setError('金額を正しく入力してください'); return; }
    if (amt > remaining) {
      setError(`未割当金額（¥${remaining.toLocaleString()}）を超えています`);
      return;
    }
    setError(null);
    setSplits(prev => [...prev, {
      member_id: newMemberName.trim(),
      member_name: newMemberName.trim(),
      amount: amt,
    }]);
    setNewMemberName('');
    setNewAmount('');
  };

  const handleDelete = (index: number) => {
    setSplits(prev => prev.filter((_, i) => i !== index));
  };

  const handleAmountChange = (index: number, value: string) => {
    const amt = Number(value);
    if (isNaN(amt) || amt < 0) return;
    // 他のメンバーの合計を計算
    const otherTotal = splits.reduce((sum, s, i) => i === index ? sum : sum + Number(s.amount), 0);
    // 超えないように cap する
    const capped = Math.min(amt, totalAmount - otherTotal);
    setSplits(prev => prev.map((s, i) => i === index ? { ...s, amount: capped } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated: OkaneEntry = { ...item, splits };
      const response = await fetch(`/json/entries/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ splits }),
      });
      if (!response.ok) throw new Error('保存に失敗しました');
      onSave(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="side-panel split-panel">
      <div className="side-panel-header">
        <h2>Split 設定</h2>
        <button onClick={onClose}>✕</button>
      </div>

      <div className="side-panel-body">
        {/* サマリー */}
        <div className="split-summary">
          <div className="split-summary-row">
            <span>売上合計</span>
            <span className="split-amount-total">¥{totalAmount.toLocaleString()}</span>
          </div>
          <div className="split-summary-row">
            <span>Split 合計</span>
            <span className="split-amount-split">¥{totalSplit.toLocaleString()}</span>
          </div>
          <div className="split-summary-row">
            <span>未割当</span>
            <span className={remaining === 0 ? 'split-amount-done' : 'split-amount-remaining'}>
              ¥{remaining.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Split リスト */}
        <div className="field-group">
          <label>メンバー別配分</label>
          {splits.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: 13 }}>まだ Split がありません</p>
          ) : (
            <table className="sales-table" style={{ marginBottom: 0 }}>
              <thead>
                <tr>
                  <th>メンバー</th>
                  <th style={{ textAlign: 'right' }}>金額</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {splits.map((s, i) => (
                  <tr key={i}>
                    <td>{s.member_name}</td>
                    <td>
                      <input
                        type="number"
                        value={s.amount}
                        onChange={e => handleAmountChange(i, e.target.value)}
                        style={{
                          width: '100%',
                          border: '1px solid #e0e0e0',
                          borderRadius: 4,
                          padding: '4px 8px',
                          fontSize: 13,
                          textAlign: 'right',
                        }}
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(i)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 16 }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 新規追加フォーム */}
        <div className="field-group">
          <label>
            メンバーを追加
            {remaining === 0 && (
              <span style={{ marginLeft: 8, fontSize: 11, color: '#2e7d32', fontWeight: 400 }}>
                （割当完了）
              </span>
            )}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input
              type="text"
              placeholder="メンバー名"
              value={newMemberName}
              onChange={e => setNewMemberName(e.target.value)}
              disabled={remaining === 0}
            />
            <input
              type="number"
              placeholder={remaining > 0 ? `最大 ¥${remaining.toLocaleString()}` : '割当完了'}
              value={newAmount}
              onChange={e => setNewAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              disabled={remaining === 0}
              max={remaining}
            />
            {error && <p style={{ color: '#e53e3e', fontSize: 12, margin: 0 }}>{error}</p>}
            <button
              className="btn-save"
              onClick={handleAdd}
              disabled={remaining === 0}
              style={{ opacity: remaining === 0 ? 0.4 : 1 }}
            >
              ＋ 追加
            </button>
          </div>
        </div>
      </div>

      <div className="side-panel-footer">
        <button className="btn-cancel" onClick={onClose}>キャンセル</button>
        <button className="btn-save" onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
}