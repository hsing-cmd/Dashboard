import { useState } from 'react';
import type { OkaneEntry } from '../types/item';
 
interface AddEntryModalProps {
  onClose: () => void;
  onAdd: (entry: OkaneEntry) => void;
}
 
export const AddEntryModal = ({ onClose, onAdd }: AddEntryModalProps) => {
  const [summary, setSummary] = useState('');
  const [amount, setAmount] = useState('');
  const [contact, setContact] = useState('');
  const [confidence, setConfidence] = useState<'possible' | 'expected' | 'committed'>('possible');
  const [category, setCategory] = useState('売上高');
  const [type, setType] = useState<'継続売上' | '単発売上'>('継続売上');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
 
  const handleSubmit = () => {
    const newEntry: OkaneEntry = {
      id: Date.now().toString(),
      team_id: 'azukaritai',
      year,
      month,
      day: null,
      date: null,
      type: 'in',
      stage: 'upcoming',
      confidence,
      category,
      amount: Number(amount),
      summary,
      contact,
      note: null,
      tags: type,
      member_id: null,
      version: 1,
      created_at: Date.now().toString(),
      updated_at: Date.now().toString(),
      created_by: '',
      updated_by: '',
      member_name: null,
      metadata: null,
      splits: null,
    };
    onAdd(newEntry);
    onClose();
  };
 
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>新規案件追加</h2>
          <button onClick={onClose}>✕</button>
        </div>
 
        <div className="modal-body">
          <div className="field-group">
            <label>案件名</label>
            <input value={summary} onChange={e => setSummary(e.target.value)} placeholder="例：A社 売上" />
          </div>
          <div className="field-group">
            <label>金額（円）</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="例：500000" />
          </div>
          <div className="field-group">
            <label>取引先</label>
            <input value={contact} onChange={e => setContact(e.target.value)} placeholder="例：A株式会社" />
          </div>
          <div className="field-group">
            <label>年月</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                placeholder="年"
                style={{ width: 80 }}
              />
              <select
                value={month}
                onChange={e => setMonth(Number(e.target.value))}
                style={{ flex: 1 }}
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                  <option key={m} value={m}>{m}月</option>
                ))}
              </select>
            </div>
          </div>
          <div className="field-group">
            <label>種類</label>
            <select value={type} onChange={e => setType(e.target.value as '継続売上' | '単発売上')}>
              <option value="継続売上">継続売上</option>
              <option value="単発売上">単発売上</option>
            </select>
          </div>
          <div className="field-group">
            <label>確度</label>
            <select value={confidence} onChange={e => setConfidence(e.target.value as 'possible' | 'expected' | 'committed')}>
              <option value="possible">可能性あり（20-50%）</option>
              <option value="expected">見込み（60-90%）</option>
              <option value="committed">確定（95-100%）</option>
            </select>
          </div>
        </div>
 
        <div className="modal-footer">
          <button className="btn-save" onClick={handleSubmit}>追加</button>
          <button className="btn-cancel" onClick={onClose}>キャンセル</button>
        </div>
      </div>
    </div>
  );
};