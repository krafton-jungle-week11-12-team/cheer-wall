import { h } from '../src/lib/mini-react/h';
import { WallMessage } from './api/messages';
import { useEffect, useState } from './lib/mini-react';
import { MessagesPage, type Tab } from './pages/MessagesPage';
import { WallPage } from './pages/WallPage';
import { fetchWall } from './api/messages';

export function App() {
  const [route, setRoute] = useState(location.hash);
  const [tab, setTab] = useState<Tab>('all'); // 전체 메시지 탭(전체/만료된 메시지)

  useEffect(() => {
    const onHashChange = () => setRoute(location.hash);
    window.addEventListener('hashchange', onHashChange);
    
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const [messages, setMessages] = useState<WallMessage[]>([]);
  const [now, setNow] = useState(Date.now());

  const loadWall = () => fetchWall().then(setMessages).catch(console.error);

  // 벽 화면일 때만 3초마다 다시 가져오기
  useEffect(() => {
    if (route !== '#donghwan') return;
    loadWall();
    const t = setInterval(loadWall, 3000);
    return () => clearInterval(t);
  }, [route])

  // 카운트다운용 1초 시계
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const page = route === '#donghwan'
    ? h(WallPage, { messages, now, onSent: loadWall })
    : h(MessagesPage, { tab, onTabChange: setTab });// 전체 메시지 탭(전체/만료된 메시지)

  return h('div', { class: 'container' },
  h('ul', {},
    h('li', {}, h('a', { href: '#dongho' }, '동호')),
    h('li', {}, h('a', { href: '#donghwan' }, '동환')),
  ),
  page,
);
}
