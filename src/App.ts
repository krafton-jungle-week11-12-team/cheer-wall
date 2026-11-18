import { h } from '../src/lib/mini-react/h';

export function App() {
  console.log("App is running");
  return h(
    'div',
    {class: 'container'},
  );
}