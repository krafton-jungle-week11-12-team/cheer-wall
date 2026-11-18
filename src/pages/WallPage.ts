import { h } from "../lib/mini-react";
import { insertMessage } from "../api/messages";

export type WallMessage = {
  id: number;
  author: string;
  content: string;
  expiresAt: number;   // ms
};


export function WallPage() {

  async function onSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const content = String(new FormData(form).get('content') ?? '');
    const author = String(new FormData(form).get('author') ?? '');

    if (!content.trim()) return;

    try {
      const result = await insertMessage(author, content);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
    
  }

  return h('section', {}, 
    h('h2', {}, '동환 페이지'),
    h('form', { onSubmit }, 
      h('input', { name: 'author', placeholder: '작성자를 입력하세요'}),
      h('input', { name: 'content', placeholder: '응원 메시지를 입력하세요'}),
      h('button', { type: "submit" }, '전송'),
    )
  );
}