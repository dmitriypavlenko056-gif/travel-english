import { esc } from '../util.js';
import { statusOf } from '../srs.js';

export function renderHome(app, data) {
  const all = data.words;
  const cards = data.topics
    .map((t) => {
      const ws = data.wordsOf(t.id);
      const learned = ws.filter((w) => statusOf(w.id) === 'learned').length;
      const pct = ws.length ? Math.round((learned / ws.length) * 100) : 0;
      const empty = ws.length === 0;
      return `
        <button class="topic-card ${empty ? 'empty' : ''}" data-topic="${esc(t.id)}" ${empty ? 'disabled' : ''}>
          <span class="icon">${esc(t.icon)}</span>
          <span class="info">
            <span class="name">${esc(t.title)}</span><br>
            <span class="muted">${empty ? 'Скоро' : `${learned} / ${ws.length}`}</span>
            <span class="progress"><i style="width:${pct}%"></i></span>
          </span>
        </button>`;
    })
    .join('');

  app.innerHTML = `
    <h1>Travel English</h1>
    <p class="muted" style="margin:0">Английский для поездок</p>
    ${cards}
    <div class="spacer"></div>
    <button class="block" id="exam-all" ${all.length ? '' : 'disabled'}>📝 Экзамен по всем блокам</button>`;

  app.querySelectorAll('[data-topic]').forEach((b) =>
    b.addEventListener('click', () => (location.hash = `#/topic/${b.dataset.topic}`)));
  app.querySelector('#exam-all').addEventListener('click', () => (location.hash = '#/exam/all'));
}
