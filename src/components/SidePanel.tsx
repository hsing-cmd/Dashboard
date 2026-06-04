import { useState, useEffect } from 'react';
import type { OkaneEntry } from '../types/item';

interface SidePanelProps {
  item: OkaneEntry | null;
  onClose: () => void;
  onSave: (updated: OkaneEntry) => void;
}

export const SidePanel = ({ item, onClose, onSave }: SidePanelProps) => {
  const [summary, setSummary] = useState('');
  const [note, setNote] = useState('');
  const [contact, setContact] = useState('');

  useEffect(() => {
    if (item) {
      setSummary(item.summary || '');
      setNote(item.note || '');
      setContact(item.contact || '');
    }
  }, [item]);

  if (!item) return null;

  const handleSave = () => {
    onSave({ ...item, summary, note, contact });
    onClose();
  };

  return (
    <div className="side-panel">
      <div className="side-panel-header">
        <h2>詳細情報</h2>
        <button onClick={onClose}>✕</button>
      </div>

      <div className="side-panel-body">
        <div className="field-group">
          <label>金額</label>
          <p>¥{Number(item.amount).toLocaleString()}</p>
        </div>
        <div className="field-group">
          <label>ステージ</label>
          <p>{item.stage}</p>
        </div>
        <div className="field-group">
          <label>カテゴリ</label>
          <p>{item.category}</p>
        </div>
        <div className="field-group">
          <label>概要</label>
          <input
            value={summary}
            onChange={e => setSummary(e.target.value)}
          />
        </div>
        <div className="field-group">
          <label>取引先</label>
          <input
            value={contact}
            onChange={e => setContact(e.target.value)}
            placeholder="例：A株式会社"
          />
        </div>
        <div className="field-group">
          <label>メモ</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="備考・メモ"
            rows={4}
          />
        </div>
      </div>

      <div className="side-panel-footer">
        <button className="btn-save" onClick={handleSave}>保存</button>
        <button className="btn-cancel" onClick={onClose}>キャンセル</button>
      </div>
    </div>
  );
};