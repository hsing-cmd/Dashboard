import { useState, useEffect } from 'react';
import type { OkaneEntry, Stage, Confidence } from '../types/item';
import { SplitPanel } from './SplitPanel';

interface Comment {
  author: string;
  content: string;
  timestamp: string;
}

interface SidePanelProps {
  item: OkaneEntry | null;
  onClose: () => void;
  onSave: (updated: OkaneEntry) => void;
  onDelete: (id: string) => void;
}

export const SidePanel = ({ item, onClose, onSave, onDelete }: SidePanelProps) => {
  const [summary, setSummary] = useState('');
  const [note, setNote] = useState('');
  const [contact, setContact] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [stage, setStage] = useState<Stage>('upcoming');
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [memberName, setMemberName] = useState('');
  const [year, setYear] = useState<number>(0);
  const [month, setMonth] = useState<number | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [showSplitPanel, setShowSplitPanel] = useState(false);
  const [currentItem, setCurrentItem] = useState<OkaneEntry | null>(item);

  useEffect(() => {
    setCurrentItem(item);
    setShowSplitPanel(false);
    if (item) {
      setSummary(item.summary || '');
      setNote(item.note || '');
      setContact(item.contact || '');
      setAmount(item.amount);
      setStage(item.stage);
      setConfidence(item.confidence);
      setMemberName(item.member_name || '');
      setYear(item.year);
      setMonth(item.month || null);
      setDay(item.day || null);
      try {
        const parsed = item.metadata ? JSON.parse(item.metadata) : [];
        setComments(Array.isArray(parsed) ? parsed : []);
      } catch {
        setComments([]);
      }
    }
  }, [item]);

  if (!item || !currentItem) return null;

  const handleSave = () => {
    const updated: OkaneEntry = {
      ...currentItem,
      summary, note, contact, amount, stage, confidence,
      member_name: memberName, year, month, day,
      metadata: JSON.stringify(comments),
    };
    onSave(updated);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('本当に削除しますか？')) {
      onDelete(item.id);
      onClose();
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !newAuthor.trim()) return;
    const comment: Comment = {
      author: newAuthor,
      content: newComment,
      timestamp: new Date().toISOString()
    };
    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  const handleSplitSave = (updated: OkaneEntry) => {
    setCurrentItem(updated);
    setShowSplitPanel(false);
    onSave(updated);
  };

  return (
    <>
      <div className="side-panel">
        <div className="side-panel-header">
          <h2>詳細情報</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="side-panel-body">
          <div className="field-group">
            <label>金額</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
            />
          </div>
          <div className="field-group">
            <label>ステージ</label>
            <select value={stage} onChange={e => setStage(e.target.value as Stage)}>
              <option value="target">目標</option>
              <option value="upcoming">予定</option>
              <option value="realized">実績</option>
            </select>
          </div>
          {stage === 'upcoming' && (
            <div className="field-group">
              <label>確度</label>
              <select
                value={confidence || ''}
                onChange={e => setConfidence(e.target.value as Confidence || null)}
              >
                <option value="">未設定</option>
                <option value="possible">提案中（Possible）</option>
                <option value="expected">売上見込み（Expected）</option>
                <option value="committed">確定（Committed）</option>
              </select>
            </div>
          )}
          <div className="field-group">
            <label>カテゴリ</label>
            <p>{item.category}</p>
          </div>
          <div className="field-group">
            <label>概要</label>
            <input value={summary} onChange={e => setSummary(e.target.value)} />
          </div>
          <div className="field-group">
            <label>クライアント名</label>
            <input
              value={contact}
              onChange={e => setContact(e.target.value)}
              placeholder="例：A株式会社"
            />
          </div>
          <div className="field-group">
            <label>担当者</label>
            <input
              value={memberName}
              onChange={e => setMemberName(e.target.value)}
              placeholder="例：田中太郎"
            />
          </div>
          <div className="field-group">
            <label>日付</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                value={year || ''}
                onChange={e => setYear(Number(e.target.value))}
                placeholder="年"
                style={{ width: '80px' }}
              />
              <input
                type="number"
                value={month || ''}
                onChange={e => setMonth(Number(e.target.value) || null)}
                placeholder="月"
                style={{ width: '60px' }}
              />
              <input
                type="number"
                value={day || ''}
                onChange={e => setDay(Number(e.target.value) || null)}
                placeholder="日"
                style={{ width: '60px' }}
              />
            </div>
          </div>

          {/* Split 設定ボタン */}
          <div className="field-group">
            <label>Split 設定</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn-add" onClick={() => setShowSplitPanel(true)}>
                ⚡ Split を設定
              </button>
              {currentItem.splits && currentItem.splits.length > 0 && (
                <span style={{ fontSize: 12, color: '#2E75B6' }}>
                  {currentItem.splits.length}件設定済み
                </span>
              )}
            </div>
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

          <div className="field-group">
            <label>ディスカッション</label>
            <div className="comments-list">
              {comments.length === 0 ? (
                <p style={{ color: '#aaa', fontSize: '13px' }}>まだコメントはありません</p>
              ) : (
                comments.map((c, i) => (
                  <div key={i} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">{c.author}</span>
                      <span className="comment-time">
                        {new Date(c.timestamp).toLocaleString('ja-JP')}
                      </span>
                    </div>
                    <p className="comment-content">{c.content}</p>
                  </div>
                ))
              )}
            </div>
            <div className="comment-input-group">
              <input
                value={newAuthor}
                onChange={e => setNewAuthor(e.target.value)}
                placeholder="名前"
                style={{ width: '100px' }}
              />
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="コメントを入力"
                style={{ flex: 1 }}
              />
              <button onClick={handleAddComment}>送信</button>
            </div>
          </div>
        </div>

        <div className="side-panel-footer">
          <button className="btn-save" onClick={handleSave}>保存</button>
          <button className="btn-cancel" onClick={onClose}>キャンセル</button>
          <button className="btn-delete" onClick={handleDelete}>削除</button>
        </div>
      </div>

      {showSplitPanel && (
        <SplitPanel
          item={currentItem}
          onClose={() => setShowSplitPanel(false)}
          onSave={handleSplitSave}
        />
      )}
    </>
  );
};
