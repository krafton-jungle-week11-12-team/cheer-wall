import { h, type VNode } from "../lib/mini-react";
import { sendMessage, type WallMessage } from "../api/messages";
import { formatRemaining, isExpired } from "../utils/time";

type WallMessageProps = {
  messages: WallMessage[];
  now: number;
  onSent: () => void;
  onLike: (id: number) => void;
}

export function WallPage({ messages, now, onSent, onLike }: WallMessageProps) {
  async function onSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    const content = String(data.get('content') ?? '');
    const author = String(data.get('author') ?? '');

    if (!content.trim()) return;

    try {
      await sendMessage(author, content);
      form.reset();
      onSent();
    } catch (error) {
      console.log(error);
    }
  }

  const alive = messages.filter((m) => !isExpired(m.expiresAt, now));   // 0초 된 카드는 다음 polling 전에 숨김

  return h('section', {},
    h('h2', {}, '동환 페이지'),
    h('ul', { class: 'wall-list' },
      alive.map((m) => h(WallCard, { key: m.id, message: m, now, onLike })),
    ),
    h('form', { onSubmit },
      h('input', { name: 'author', placeholder: '작성자를 입력하세요'}),
      h('input', { name: 'content', placeholder: '응원 메시지를 입력하세요'}),
      h('button', { type: "submit" }, '전송'),
    )
  );
}

// 벽에 붙는 메시지 카드 하나: 작성자, 남은 시간, 내용, 좋아요 버튼
function WallCard({ message, now, onLike }: { message: WallMessage; now: number; onLike: (id: number) => void; }): VNode {
  return h('li', { class: 'card' },
    h('strong', {}, message.author),
    h('span', { class: 'timer' }, formatRemaining(message.expiresAt - now)),
    h('p', {}, message.content),
    h('button', { type: 'button', class: 'like', onClick: () => onLike(message.id) }, `❤ ${message.likes}`),
  );
}
