// src/types/item.ts

export interface OkaneEntry {
  id: string;
  team_id: string;
  year: number;
  month: number;
  day: number | null;
  date: string | null;
  type: string;
  stage: string;       // "upcoming", "current", 等等
  confidence: string;  // "committed", 等等
  category: string;    // "売上", 等等
  amount: number;
  summary: string;     // 4月の売上見込み
  contact: string;     // ABC株式会社
  note: string;
  tags: string;
  member_id: string;
  version: number;
  created_at: number;
  created_by: string;
  updated_at: number;
  updated_by: string;
} // 確保最後只留下這個結尾的大括號