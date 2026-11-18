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

export async function insertMessage(author: string, content: string): Promise<InsertResult> {
  const esc = (s: string) => `'${s.replace(/'/g, "''")}'`;
  const query = `INSERT INTO messages VALUES (${esc(author)}, ${esc(content)}, ${Date.now()})`;

  const res = await fetch('/db/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql: query }),
  });

  const body = await res.json();
  if (!body.ok) throw new Error(body.error.message);
  return body;
}