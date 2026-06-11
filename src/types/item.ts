// Stage 的類型
export type Stage = 'target' | 'upcoming' | 'realized';

// Confidence 只有 upcoming 才有
export type Confidence = 'committed' | 'expected' | 'possible';

// Type 收入或支出
export type EntryType = 'in' | 'out';

// Split 分帳明細
export interface SplitEntry {
  member_id: string;
  member_name: string;
  amount: number;
}

export interface OkaneEntry {
  id: string;
  team_id: string;
  year: number;
  month: number | null;
  day: number | null;
  date: string | null;
  type: EntryType;
  stage: Stage;
  confidence: Confidence | null;
  category: string;
  amount: number;
  summary: string | null;
  contact: string | null;
  note: string | null;
  tags: string | null;
  member_id: string | null;
  version: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  member_name: string | null;
  metadata: string | null;
  splits: SplitEntry[] | null; // 新增
}