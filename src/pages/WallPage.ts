import { h } from "../lib/mini-react";
import { sendMessage, type WallMessage } from "../api/messages";
import { isExpired } from "../utils/time";
import { MessageCard } from "../components/MessageCard";

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

  return h('section', { class: 'page wall-page' },
    h('h2', { class: 'page-title' }, '동환 페이지'),
    h('ul', { class: 'wall-list card-list' },
      alive.map((m) => h(MessageCard, { key: m.id, message: m, now, onLike })),
    ),
    h('form', { class: 'composer', onSubmit },
      h('input', { name: 'author', placeholder: '닉네임'}),
      h('input', { name: 'content', placeholder: '응원 메시지를 입력하세요'}),
      h('button', { type: "submit", 'aria-label': '전송' }, '(ง •̀_•́)ง'),
    )
  );
}
