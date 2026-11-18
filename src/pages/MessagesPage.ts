import { h, type VNode } from '../lib/mini-react';
import type { MessageRow, WallMessage } from '../api/messages';



// 페이지 전체, 만료됨 탭 바꿔서 보여주기 탭 상태는 app에서 props로 받음
export function MessagesPage({ messages, tab, onTabChange }: { messages: Message[];tab: Tab; onTabChange: (next: Tab) => void; }): VNode {
  const sorted = [...messages].sort((a, b) => b.id - a.id); // id 내림차순 정렬
  const expiredCount = sorted.filter(isExpired).length;
  const visible = tab === 'expired' ? sorted.filter(isExpired) : sorted;
  return h('section', {},
    h('h2', {}, '동호 페이지'),
    h(TabButton, { tab, onChange: onTabChange, totalCount: sorted.length, expiredCount }),
    h('ul', {}, visible.map((m) => h(MessageItem, { key: m.id, message: m }))),);
}

type Message = {
  id: number;
  author: string;
  content: string;
  expiresAt: number | null;
  likes: number;
};
export type Tab = 'all' | 'expired';

// DBMS와 Redis에서 가져온 메시지 데이터를 화면에 보여주기 위해 변환하는 함수
export function toMessages(rows: MessageRow[], wall: WallMessage[], likeCounts: Record<number, number>): Message[] {
  return rows.map((row) => {
    const alive = wall.find((w) => w.id === row.id);
    return {
      id: row.id,
      author: row.author,
      content: row.content,
      expiresAt: alive ? alive.expiresAt : null,
      likes: likeCounts[row.id] ?? 0
    };
  });
}

function isExpired(message: Message): boolean {
  return message.expiresAt === null || message.expiresAt <= Date.now();
}
// 메시지 출력 컴포넌트 id, 이름, 내용, 남은 시간(만료됨 또는 분:초) 순 출력
function MessageItem({ message }: { message: Message; }): VNode {
  return h('li', null,
    `#${message.id} `,
    h('b', null, message.author),
    `: ${message.content}`,
    isExpired(message) ? '[만료됨]' : `[${formatRemaining(message.expiresAt!)} 남음]`,
    `❤ ${message.likes}`,
  );
}

function TabButton({ tab, onChange, totalCount, expiredCount }:
  {
    tab: Tab;
    onChange: (next: Tab) => void;
    totalCount: number;
    expiredCount: number;
  }): VNode {
  return h('div', null,
    h('button', { type: 'button', disabled: tab === 'all', onClick: () => onChange('all') }, `전체 (${formatCount(totalCount)})`),
    h('button', { type: 'button', disabled: tab === 'expired', onClick: () => onChange('expired') }, `만료된 메시지 (${formatCount(expiredCount)})`)
  );
}
// 남은 시간을 "분:초"로 바꿈 (예: 1781초 → "29:41")
function formatRemaining(expiresAt: number): string {
  const seconds = Math.ceil((expiresAt - Date.now()) / 1000);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}
function formatCount(count: number): string {
  return count > 999 ? '999+' : String(count);
}
