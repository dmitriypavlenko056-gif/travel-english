import { esc } from '../util.js';
import { statusOf } from '../srs.js';

const LABEL = { learned: 'выучено', progress: 'в процессе', new: 'новое' };

export function renderTopic(app, data, topicId) {
  const topic = data.topics.find((t) => t.id === topicId);
  if (!topic) {
    location.hash = '#/';
    return;
  }
  const ws = data.wordsOf(topicId);
  const learned = ws.filter((w) => statusOf(w.id) === 'learned').length;

  const items = ws
    .map((w) => {
      const st = statusOf(w.id);
      return `
        <div class="word-item">
          <span class="ico">${esc(w.image)}</span>
          <span class="txt"><b>${esc(w.en)}</b><br><span class="ru">${esc(w.ru[0])}</span></span>
          <span class="badge ${st}">${LABEL[st]}</span>
        </div>`;
    })
    .join('');

  app.innerHTML = `
    <div class="topbar">
      <button class="secondary back" id="back" aria-label="Назад">‹</button>
      <span class="title">${esc(topic.icon)} ${esc(topic.title)}</span>
      <span class="counter">${learned} / ${ws.length}</span>
    </div>
    <div class="row">
      <button id="learn">📖 Учить</button>
      <button id="exam" class="secondary">📝 Экзамен</button>
    </div>
    <div class="card">${items}</div>`;

  app.querySelector('#back').addEventListener('click', () => (location.hash = '#/'));
  app.querySelector('#learn').addEventListener('click', () => (location.hash = `#/learn/${topicId}`));
  app.querySelector('#exam').addEventListener('click', () => (location.hash = `#/exam/${topicId}`));
}
