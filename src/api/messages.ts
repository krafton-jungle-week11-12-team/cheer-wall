import { redis } from "./redis";

export type WallMessage = {
  id: number;
  author: string;
  content: string;
  expiresAt: number;   // ms
  likes: number;
};

export type InsertResult = {
  ok: true;
  type: 'insert';
  inserted_id: number;
  affected_rows: number;
  elapsed_ms: number;
};

export type MessageRow = {
  id: number;
  author: string;
  content: string;
  createdAt: number;
}

const TTL_SECONDS = '1800';

export async function sendMessage(author: string, content: string) {
  const createdAt = Date.now();
  const dbResult = await insertMessage(author, content, createdAt);
  const id = dbResult.inserted_id;

  const value = JSON.stringify({ id, author, content, createdAt });
  await redis('SET', `msg:${id}`, value, TTL_SECONDS);
  await redis('SET', `likes:${id}`, '0', TTL_SECONDS);

  return dbResult
}

export async function insertMessage(author: string, content: string, createdAt: number): Promise<InsertResult> {
  const esc = (s: string) => `'${s.replace(/'/g, "''")}'`;
  const query = `INSERT INTO messages VALUES (${esc(author)}, ${esc(content)}, ${createdAt})`;

  const res = await fetch('/db/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql: query }),
  });

  const result = await res.json();
  if (!result.ok) throw new Error(result.error.message);
  return result;
}

// DBMS message 테이블 전부 읽어서 메시지 목록으로 돌려주는 함수
export async function fetchMessages(): Promise<MessageRow[]> {
  const res = await fetch('/db/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql: 'SELECT * FROM messages' }),
  });

  const result = await res.json();
  if (!result.ok) throw new Error(result.error.message);
  return result.rows.map((row: [number, string, string, number]) => ({
    id: row[0],
    author: row[1],
    content: row[2],
    createdAt: row[3]
  }));
}

type ScanItem = { key: string; value: string; ttl: number };

export async function fetchWall(): Promise<WallMessage[]> {
  const [items, likeItems] = await Promise.all([
    redis<ScanItem[]>('SCANPREFIX', 'msg:'),
    redis<ScanItem[]>('SCANPREFIX', 'likes:')
  ])

  const likesById = new Map<number, number>();
  for (const item of likeItems) {
    likesById.set(Number(item.key.slice('likes:'.length)), Number(item.value));
  }
  
  const now = Date.now();

  const messages: WallMessage[] = [];
  for (const item of items) {
    try {
      const { id, author, content } = JSON.parse(item.value);
      messages.push({ id, author, content, expiresAt: now + item.ttl * 1000, likes: likesById.get(id) ?? 0});
    } catch (error) {
      console.warn(`[fetchWall] JSON이 아닌 값이라 건너뜀: ${item.key}`, item.value);
    }
  }
  return messages.sort((a, b) => b.expiresAt - a.expiresAt);
}

export async function likeMessage(id: number): Promise<number> {
  // 1. 영구 기록 먼저 (메시지 저장과 같은 순서)
  const res = await fetch('/db/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql: `INSERT INTO likes VALUES (${id}, ${Date.now()})` }),
  });

  const result = await res.json();
  if (!result.ok) throw new Error(result.error.message);

  // 2. 실시간 카운터
  return redis<number>('INCR', `likes:${id}`);
}
