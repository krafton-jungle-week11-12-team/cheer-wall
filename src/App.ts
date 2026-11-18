import { h } from '../src/lib/mini-react/h';
import { useEffect, useState } from './lib/mini-react';
import { MessagesPage, type Tab } from './pages/MessagesPage';
import { WallPage } from './pages/WallPage';

export function App() {
  const [route, setRoute] = useState(location.hash);
  const [tab, setTab] = useState<Tab>('all'); // 전체 메시지 탭(전체/만료된 메시지)

  useEffect(() => {
    const onHashChange = () => setRoute(location.hash);
    window.addEventListener('hashchange', onHashChange);
  }, []);

  const page = route === '#donghwan'
    ? h(WallPage, {})
    : h(MessagesPage, { tab, onTabChange: setTab });// 전체 메시지 탭(전체/만료된 메시지)

  return h('div', { class: 'container' },
  h('ul', {},
    h('li', {}, h('a', { href: '#dongho' }, '동호')),
    h('li', {}, h('a', { href: '#donghwan' }, '동환')),
  ),
  page,
);
}
