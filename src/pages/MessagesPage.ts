import { h, type VNode } from '../lib/mini-react';

export function MessagesPage() {
  return h('section', {},
    h('h2', {}, '동호 페이지'),
    h('ul', {}, SAMPLE.map((m) => h(MessageItem, { key: m.id, message: m }))),);
}

type Message = {
  id: number;
  author: string;
  content: string;
  expiresAt: number | null;
};
// 샘플 메시지 데이터
const SAMPLE: Message[] = [
  { id: 1, author: '동호', content: '정글 끝나는 날 언제임', expiresAt: Date.now() + 10 * 60 * 1000 }, // 10분 남음
  { id: 2, author: 'Bob', content: '모두 화이팅입니다', expiresAt: Date.now() + 25 * 60 * 1000 },     // 25분 남음
  { id: 3, author: 'Charlie', content: 'React is great!', expiresAt: null },                          // 만료됨
];

function isExpired(message: Message): boolean {
  return message.expiresAt === null || message.expiresAt <= Date.now();
}
// 메시지 출력 컴포넌트 id, 이름, 내용, 남은 시간(만료됨 또는 분:초) 순 출력
function MessageItem({ message }: { message: Message; }): VNode {
  return h('li', null,
    `#${message.id} `,
    h('b', null, message.author),
    ': ${message.content}',
    isExpired(message) ? '[만료됨]' : `[${formatRemaining(message.expiresAt!)} 남음]`,
  );
}
// 남은 시간을 "분:초"로 바꿈 (예: 1781초 → "29:41")
function formatRemaining(expiresAt: number): string {
  const seconds = Math.ceil((expiresAt - Date.now()) / 1000);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}
