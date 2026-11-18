import { h, useEffect, useState } from './lib/mini-react';
import { MessagesPage, toMessages, type Tab } from './pages/MessagesPage';
import { WallPage } from './pages/WallPage';
import { fetchWall, likeMessage, fetchMyMessages, fetchLikeCounts, type MessageRow, type WallMessage } from './api/messages';
import { WALL_ROUTE, MESSAGES_ROUTE } from './config';

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
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({}); // DBMS likes 테이블에서 가져온 messageId별 좋아요 개수
  const [now, setNow] = useState(Date.now());

  const loadWall = () => fetchWall().then(setMessages).catch(console.error);

  // 벽 화면일 때만 3초마다 다시 가져오기
  useEffect(() => {
    if (route !== WALL_ROUTE) return;
    loadWall();
    const t = setInterval(loadWall, 3000);
    return () => clearInterval(t);
  }, [route])

  // 전체 메시지화면을 열때 DB 전체 목록과 벽 목록 가져오기
  useEffect(() => {
    if (route === WALL_ROUTE) return; // 벽 화면일 때는 DBMS 메시지 목록 안 가져오기
    fetchMyMessages().then(setAllRows).catch(console.error);
    fetchLikeCounts().then(setLikeCounts).catch(console.error);
    loadWall();
  }, [route]);

  // 카운트다운용 1초 시계
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // id가 같은 메시지의 좋아요 수만 바꿈
  const setLikes = (id: number, next: (likes: number) => number) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, likes: next(m.likes) } : m)));

  const onLike = (id: number) => {
    // 낙관적 업데이트
    setLikes(id, (likes) => likes + 1);

    likeMessage(id)
    // 서버가 준 실제 값으로 맞춤 (다른 사람이 동시에 누른 것까지 반영)
    .then((count) => setLikes(id, () => count))
    .catch((e) => {
      console.error(e);
      loadWall();   // 실패하면 서버 값으로 되돌림
    });

  }

  const page = route === WALL_ROUTE
    ? h(WallPage, { messages, now, onSent: loadWall, onLike })
    : h(MessagesPage, { messages: toMessages(allRows, messages, likeCounts), now, tab, onTabChange: setTab });// 전체 메시지 탭(전체/만료된 메시지)

  return h('div', { class: 'container' },
    h('header', { class: 'app-header' },
      h('img', { class: 'app-logo', src: 'dd-logo.png', alt: 'DD' }),
      h('h1', { class: 'app-title' }, '지게 응원합니다'),
    ),
    h('ul', { class: 'main-tabs' },
      h('li', { class: route === WALL_ROUTE ? 'active' : '' }, h('a', { href: WALL_ROUTE }, '모든 응원')),
      h('li', { class: route === WALL_ROUTE ? '' : 'active' }, h('a', { href: MESSAGES_ROUTE }, '내가 보낸 응원')),
    ),
    page,
  );
}
