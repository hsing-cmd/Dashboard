// src/types/item.ts

// 必須有 export 關鍵字
export type ItemStatus = 'Todo' | 'In Progress' | 'Done';

export interface Item {
  id: number;
  name: string;
  status: ItemStatus;
  createdAt: string;
}