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