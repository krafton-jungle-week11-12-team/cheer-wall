import { redis } from "./redis";
import { db, esc } from "./db";
import { getClientId } from '../utils/author';
import { TTL_SECONDS, MSG_KEY_PREFIX, LIKES_KEY_PREFIX } from '../config';

export type WallMessage = {
  id: number;
  author: string;
  content: string;
  expiresAt: number;   // ms
  likes: number;
};

// 전체 메시지 화면용. Redis에서 만료돼 사라진 메시지는 expiresAt이 null
export type Message = Omit<WallMessage, 'expiresAt'> & { expiresAt: number | null };

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

const msgKey = (id: number) => `${MSG_KEY_PREFIX}${id}`;
const likesKey = (id: number) => `${LIKES_KEY_PREFIX}${id}`;

export async function sendMessage(author: string, content: string) {
  const createdAt = Date.now();
  const dbResult = await insertMessage(author, content, createdAt);
  const id = dbResult.inserted_id;

  const value = JSON.stringify({ id, author, content, createdAt });
  await redis('SET', msgKey(id), value, TTL_SECONDS);
  await redis('SET', likesKey(id), '0', TTL_SECONDS);

  return dbResult
}

export async function insertMessage(author: string, content: string, createdAt: number): Promise<InsertResult> {
  return db<InsertResult>(
    `INSERT INTO messages VALUES (${esc(author)}, ${esc(content)}, ${createdAt}, ${esc(getClientId())})`,
  );
}

// DBMS message 테이블 전부 읽어서 메시지 목록으로 돌려주는 함수
export async function fetchMyMessages(): Promise<MessageRow[]> {
  const result = await db<{ rows: [number, string, string, number][] }>(
    `SELECT id, author, content, created_at FROM messages WHERE client_id = ${esc(getClientId())}`,
  );
  return result.rows.map((row) => ({
    id: row[0],
    author: row[1],
    content: row[2],
    createdAt: row[3]
  }));
}
// DBMS likes 테이블 전부 읽어서 messageId별 좋아요 개수로 돌려주는 함수
export async function fetchLikeCounts():Promise<Record<number, number>> {
  const result = await db<{ rows: [number][] }>(`SELECT message_id FROM likes`);
  const counts: Record<number, number> = {};
  //row 하나가 좋아요 하나를 의미하므로, messageId를 key로 해서 카운트 세기
  for (const row of result.rows) {
    const messageId = row[0]
    counts[messageId] = (counts[messageId] ?? 0) + 1;
  }
  return counts;
}

type ScanItem = { key: string; value: string; ttl: number };

export async function fetchWall(): Promise<WallMessage[]> {
  const [items, likeItems] = await Promise.all([
    redis<ScanItem[]>('SCANPREFIX', MSG_KEY_PREFIX),
    redis<ScanItem[]>('SCANPREFIX', LIKES_KEY_PREFIX)
  ])

  const likesById = new Map<number, number>();
  for (const item of likeItems) {
    likesById.set(Number(item.key.slice(LIKES_KEY_PREFIX.length)), Number(item.value));
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
  await db(`INSERT INTO likes VALUES (${id}, ${Date.now()})`);

  // 2. 실시간 카운터
  return redis<number>('INCR', likesKey(id));
}
