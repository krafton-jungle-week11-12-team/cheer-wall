import { h, type VNode } from '../lib/mini-react';
import type { Message } from '../api/messages';
import { formatRemaining, isExpired } from '../utils/time';

type MessageCardProps = {
  message: Message;
  now: number;
  // 있으면 좋아요가 누를 수 있는 버튼, 없으면 개수만 표시
  onLike?: (id: number) => void;
  // 메시지 번호(#id) 표시 여부
  showId?: boolean;
};

// 벽 화면과 전체 메시지 화면이 같이 쓰는 메시지 카드: 작성자, 남은 시간(또는 만료됨), 내용, 좋아요
export function MessageCard({ message, now, onLike, showId = false }: MessageCardProps): VNode {
  const timer = message.expiresAt === null || isExpired(message.expiresAt, now)
    ? '만료됨'
    : formatRemaining(message.expiresAt - now);
  const likes = `❤ ${message.likes}`;

  return h('li', { class: 'card' },
    showId ? h('span', { class: 'id' }, `#${message.id}`) : null,
    h('strong', {}, message.author),
    h('span', { class: 'timer' }, timer),
    h('p', {}, message.content),
    onLike
      ? h('button', { type: 'button', class: 'like', onClick: () => onLike(message.id) }, likes)
      : h('span', { class: 'like' }, likes),
  );
}
