import { esc } from '../util.js';
import { isDue, remember, forget } from '../srs.js';
import { speak, NO_VOICE_HINT } from '../speech.js';
import { NEW_PER_SESSION, RETURN_AFTER } from '../config.js';
import { getEntry } from '../storage.js';

function buildQueue(words, practiceAll) {
  if (practiceAll) return [...words];
  const due = words.filter((w) => getEntry(w.id) && isDue(w.id));
  const fresh = words.filter((w) => !getEntry(w.id)).slice(0, NEW_PER_SESSION);
  return [...due, ...fresh];
}

export function renderCards(app, data, topicId, practiceAll = false) {
  const topic = data.topics.find((t) => t.id === topicId);
  const backHash = topic ? `#/topic/${topicId}` : '#/';
  const queue = buildQueue(data.wordsOf(topicId), practiceAll);
  const total = queue.length;
  let revealed = false;
  let hint = false;

  const bar = `
    <div class="topbar">
      <button class="secondary back" id="back" aria-label="Назад">‹</button>
      <span class="title">${topic ? esc(topic.title) : 'Повторение'}</span>
      <span class="counter" id="left"></span>
    </div>`;

  function finish() {
    app.innerHTML = `${bar}
      <div class="flash">
        <div class="pic">${total ? '🎉' : '✅'}</div>
        <h2>${total ? 'Сессия закончена' : 'Пока всё повторено'}</h2>
        <p class="muted">${total ? 'Отлично! Слова вернутся по расписанию.' : 'Новых слов и повторений на сегодня нет. Загляните позже.'}</p>
      </div>
      ${total ? '' : '<button class="secondary block" id="again">Повторить всё равно</button>'}
      <button class="block" id="done">Готово</button>`;
    wire();
    app.querySelector('#done').addEventListener('click', () => (location.hash = backHash));
    app.querySelector('#again')?.addEventListener('click', () => (location.hash = `#/learn/${topicId}/all`));
  }

  function wire() {
    app.querySelector('#back').addEventListener('click', () => (location.hash = backHash));
  }

  function show() {
    const w = queue[0];
    if (!w) return finish();
    const long = w.en.length > 18 ? 'long' : '';
    app.innerHTML = `${bar}
      <div class="card flash">
        <div class="pic">${esc(w.image)}</div>
        <div class="en ${long}">${esc(w.en)}</div>
        <button class="speak" id="speak" aria-label="Озвучить">🔊</button>
        ${hint ? `<div class="hint">${esc(NO_VOICE_HINT)}</div>` : ''}
        ${revealed ? `<div class="ru">${esc(w.ru[0])}</div><div class="pron">«${esc(w.pron_ru)}»</div>` : ''}
      </div>
      ${revealed
        ? `<div class="row"><button class="bad" id="no">Не помню</button><button class="good" id="yes">Помню</button></div>`
        : `<button class="block" id="reveal">Показать перевод</button>`}`;
    wire();
    app.querySelector('#left').textContent = `осталось ${queue.length}`;
    app.querySelector('#speak').addEventListener('click', () => {
      if (!speak(w.en)) {
        hint = true;
        show();
      }
    });
    app.querySelector('#reveal')?.addEventListener('click', () => {
      revealed = true;
      show();
    });
    app.querySelector('#yes')?.addEventListener('click', () => {
      remember(w.id);
      queue.shift();
      revealed = false;
      show();
    });
    app.querySelector('#no')?.addEventListener('click', () => {
      forget(w.id);
      queue.shift();
      queue.splice(Math.min(RETURN_AFTER, queue.length), 0, w);
      revealed = false;
      show();
    });
  }

  show();
}
