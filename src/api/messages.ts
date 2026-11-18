import { redis } from "./redis";

export type WallMessage = {
  id: number;
  author: string;
  content: string;
  expiresAt: number;   // ms
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
  const query = `INSERT INTO messages VALUES (${esc(author)}, ${esc(content)}, ${Date.now()})`;

  const res = await fetch('/db/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql: query }),
  });

  const result = await res.json();
  if (!result.ok) throw new Error(result.error.message);
  return result;
}

export async function fetchMessages(): Promise<MessageRow[]> {
  const res = await fetch('/db/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql: 'SELECT * FROM messages' }),
  });

  export async function fetchRemainingSeconds(): Promise<Record<number, number>> {
    const items = await redis<{ key: string; value: string; ttl: number }[]>('SCANPREFIX', 'msg:');

    const result: Record<number, number> = {};
    for (const item of items) {
      const id = Number(item.key.slice('msg:'.length)};
      result[id] = item.ttl;
    }
    return result;
  const result = await res.json();
  if (!result.ok) throw new Error(result.error.message);
  return result.rows.map((row: [number, string, string, number]) => ({
    id: row[0],
    author: row[1],
    content: row[2],
    createdAt: row[3]
  }));
}

