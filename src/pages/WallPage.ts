import { h } from "../lib/mini-react";
import { sendMessage, WallMessage } from "../api/messages";

type WallMessageProps = {
  messages: WallMessage[];
  now: number;
  onSent: () => void;
  onLike: (id: number) => void;
}

function formatRemaining(ms: number) {
  const sec = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
}

export function WallPage({ messages, now, onSent, onLike }: WallMessageProps) {
  async function onSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const content = String(new FormData(form).get('content') ?? '');
    const author = String(new FormData(form).get('author') ?? '');

    if (!content.trim()) return;

    try {
      const result = await sendMessage(author, content);
      form.reset();
      onSent();
    } catch (error) {
      console.log(error);
    }
  }

  const alive = messages.filter((m) => m.expiresAt > now);   // 0초 된 카드는 다음 polling 전에 숨김

  return h('section', {}, 
    h('h2', {}, '동환 페이지'),
    h('ul', { class: 'wall-list' },
      alive.map((m) =>
        h('li', { key: m.id, class: 'card' },
          h('strong', {}, m.author),
          h('span', { class: 'timer' }, formatRemaining(m.expiresAt - now)),
          h('p', {}, m.content),
          h('button', { type: 'button', class: 'like', onClick: () => onLike(m.id) }, `❤ ${m.likes}`),
        )
      ),
    ),
    h('form', { onSubmit }, 
      h('input', { name: 'author', placeholder: '작성자를 입력하세요'}),
      h('input', { name: 'content', placeholder: '응원 메시지를 입력하세요'}),
      h('button', { type: "submit" }, '전송'),
    )
  );
}