// src/types/item.ts

export interface OkaneEntry {
  id: string;
  team_id: string;
  year: number;
  month: number;
  day: number | null;
  date: string | null;
  type: string;          // 真實API是 "in" / "out"
  stage: string;         // 真實API是 "realized" 等等
  confidence: string | null;  // 真實API可能是 null！
  category: string;
  amount: string;        // 已經是 string 
  summary: string | null;     // 真實API可能是 null！
  contact: string | null;     // 真實API可能是 null！
  note: string | null;        // 真實API可能是 null！
  tags: string | null;        // 真實API可能是 null！
  member_id: string | null;   // 真實API可能是 null！
  version: number;
  created_at: string;         // 真實API是字串！
  updated_at: string;         // 真實API是字串！
  created_by: string;
  updated_by: string;
  member_name: string | null; // 新增！真實API有這個欄位
  metadata: string | null;    // 新增！真實API有這個欄位
}