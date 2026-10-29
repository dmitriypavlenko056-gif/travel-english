import { esc, shuffle } from '../util.js';
import { forget } from '../srs.js';
import { speak, NO_VOICE_HINT } from '../speech.js';
import { isCorrect } from '../check.js';
import { EXAM_ALL_COUNT } from '../config.js';

export function renderExam(app, data, topicId) {
  const topic = data.topics.find((t) => t.id === topicId);
  const backHash = topic ? `#/topic/${topicId}` : '#/';
  const pool = shuffle(data.wordsOf(topicId));
  const questions = topicId === 'all' ? pool.slice(0, EXAM_ALL_COUNT) : pool;
  const mistakes = [];
  let i = 0;
  let checked = null; // null или { ok }
  let hint = false;
  let typed = '';

  const title = topic ? `Экзамен: ${esc(topic.title)}` : 'Экзамен по всем блокам';
  const bar = `
    <div class="topbar">
      <button class="secondary back" id="back" aria-label="Назад">‹</button>
      <span class="title">${title}</span>
      <span class="counter" id="num"></span>
    </div>`;

  function summary() {
    const good = questions.length - mistakes.length;
    const list = mistakes
      .map((m) => `<div class="mistake"><b>${esc(m.w.en)}</b> — ${esc(m.w.ru[0])}
        ${m.answer ? `<div class="a">Вы ответили: ${esc(m.answer)}</div>` : '<div class="a">Ответа не было</div>'}</div>`)
      .join('');
    app.innerHTML = `${bar}
      <div class="card center">
        <div class="muted">Результат</div>
        <div class="score">${good} из ${questions.length}</div>
      </div>
      ${mistakes.length
        ? `<div class="card"><h2 style="margin-bottom:6px">Ошибки</h2>${list}</div>
           <p class="muted center" style="margin:0">Эти слова добавлены на повторение.</p>
           <button class="block" id="repeat">📖 Повторить ошибки</button>`
        : '<div class="card center"><h2>Без ошибок! 🎉</h2></div>'}
      <button class="secondary block" id="done">Готово</button>`;
    wireBack();
    app.querySelector('#done').addEventListener('click', () => (location.hash = backHash));
    app.querySelector('#repeat')?.addEventListener('click', () => (location.hash = `#/learn/${topicId}`));
  }

  function wireBack() {
    app.querySelector('#back').addEventListener('click', () => (location.hash = backHash));
  }

  function show() {
    if (i >= questions.length) return summary();
    const w = questions[i];
    app.innerHTML = `${bar}
      <div class="card flash">
        <div class="en ${w.en.length > 18 ? 'long' : ''}">${esc(w.en)}</div>
        <button class="speak" id="speak" aria-label="Озвучить">🔊</button>
        ${hint ? `<div class="hint">${esc(NO_VOICE_HINT)}</div>` : ''}
      </div>
      <input type="text" id="answer" placeholder="Перевод на русском" autocomplete="off"
        autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done"
        value="${esc(typed)}" ${checked ? 'readonly' : ''}>
      ${checked
        ? `<div class="result ${checked.ok ? 'ok' : 'fail'}">${checked.ok ? '✅ Верно' : '❌ Неверно'}
             <div style="font-weight:400">Правильно: ${esc(w.ru.join(' / '))}</div></div>
           <button class="block" id="next">${i + 1 < questions.length ? 'Дальше' : 'Показать итог'}</button>`
        : '<button class="block" id="check">Проверить</button>'}`;
    wireBack();
    app.querySelector('#num').textContent = `${i + 1} / ${questions.length}`;
    const input = app.querySelector('#answer');
    app.querySelector('#speak').addEventListener('click', () => {
      typed = input.value;
      if (!speak(w.en)) {
        hint = true;
        show();
      }
    });
    const submit = () => {
      typed = input.value;
      const ok = isCorrect(typed, w);
      if (!ok) {
        forget(w.id);
        mistakes.push({ w, answer: typed.trim() });
      }
      checked = { ok };
      show();
    };
    const next = () => {
      i++;
      checked = null;
      typed = '';
      show();
    };
    app.querySelector('#check')?.addEventListener('click', submit);
    app.querySelector('#next')?.addEventListener('click', next);
    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      checked ? next() : submit();
    });
  }

  if (!questions.length) {
    location.hash = backHash;
    return;
  }
  show();
}
