import { h } from '../src/lib/mini-react/h';
import { WallMessage } from './api/messages';
import { useEffect, useState } from './lib/mini-react';
import { MessagesPage, toMessages,type Tab } from './pages/MessagesPage';
import { WallPage } from './pages/WallPage';
import { fetchWall, likeMessage, fetchMessages, type MessageRow } from './api/messages';

export function App() {
  const [route, setRoute] = useState(location.hash);
  const [tab, setTab] = useState<Tab>('all'); // 전체 메시지 탭(전체/만료된 메시지)

  useEffect(() => {
    const onHashChange = () => setRoute(location.hash);
    window.addEventListener('hashchange', onHashChange);

    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const [messages, setMessages] = useState<WallMessage[]>([]);
  const [allRows, setAllRows] = useState<MessageRow[]>([]);
  const [now, setNow] = useState(Date.now());

  const loadWall = () => fetchWall().then(setMessages).catch(console.error);

  // 벽 화면일 때만 3초마다 다시 가져오기
  useEffect(() => {
    if (route !== '#donghwan') return;
    loadWall();
    const t = setInterval(loadWall, 3000);
    return () => clearInterval(t);
  }, [route])

  // 전체 메시지화면을 열때 DB 전체 목록과 벽 목록 가져오기
  useEffect(() => {
    if (route === '#donghwan') return; // 벽 화면일 때는 DBMS 메시지 목록 안 가져오기
    fetchMessages().then(setAllRows).catch(console.error);
    loadWall();
  }, [route]);

  // 카운트다운용 1초 시계
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const onLike = (id: number) => {
    // 낙관적 업데이트
    setMessages((prev) => prev.map((m) => (m.id === id ? {...m, likes: m.likes + 1} : m)));

    likeMessage(id)
    .then((count) =>
      // 서버가 준 실제 값으로 맞춤 (다른 사람이 동시에 누른 것까지 반영)
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, likes: count } : m))),
    )
    .catch((e) => {
      console.error(e);
      loadWall();   // 실패하면 서버 값으로 되돌림
    });

  }

  const page = route === '#donghwan'
    ? h(WallPage, { messages, now, onSent: loadWall, onLike })
    : h(MessagesPage, { messages: toMessages(allRows, messages), tab, onTabChange: setTab });// 전체 메시지 탭(전체/만료된 메시지)

  return h('div', { class: 'container' },
  h('ul', {},
    h('li', {}, h('a', { href: '#dongho' }, '동호')),
    h('li', {}, h('a', { href: '#donghwan' }, '동환')),
  ),
  page,
);
}
