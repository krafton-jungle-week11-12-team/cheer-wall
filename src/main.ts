import { App } from "./App";
import { FunctionComponent } from "./lib/mini-react";

function byId(id: string): HTMLElement {
  const found = document.getElementById(id);
  if (!found) throw new Error(`#${id}가 없어요`);
  return found;
}

const app = byId('root');

new FunctionComponent(App, {}, app).mount();